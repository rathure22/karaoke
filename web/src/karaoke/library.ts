import { ACCEPT_EXT, type Kind, type Track } from "@/karaoke/types";

type DirHandle = FileSystemDirectoryHandle & {
  values(): AsyncIterable<FileSystemHandle & { getFile?: () => Promise<File> }>;
  queryPermission(descriptor: { mode: "read" }): Promise<PermissionState>;
  getDirectoryHandle(name: string): Promise<DirHandle>;
  getFileHandle(name: string): Promise<FileSystemFileHandle>;
};

function asDir(handle: FileSystemDirectoryHandle): DirHandle {
  return handle as DirHandle;
}
const DB_NAME = "mykaraoke-v3";
const HANDLE_KEY = "library-root";

const sessionBlobs = new Map<string, Blob>();
let folderHandle: FileSystemDirectoryHandle | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
      if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage unavailable"));
  });
}

async function idbGet<T>(store: string, key: string): Promise<T | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const request = tx.objectStore(store).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error);
  });
}

async function idbPut(store: string, key: string, value: unknown): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function idbAll(): Promise<{ key: string; blob: Blob; name: string }[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("blobs", "readonly");
    const request = tx.objectStore("blobs").getAll();
    const keys = tx.objectStore("blobs").getAllKeys();
    let rows: { name: string; blob: Blob }[] = [];
    let ids: IDBValidKey[] = [];
    request.onsuccess = () => {
      rows = request.result as { name: string; blob: Blob }[];
    };
    keys.onsuccess = () => {
      ids = keys.result;
    };
    tx.oncomplete = () => {
      resolve(
        rows.map((row, index) => ({
          key: String(ids[index] ?? index),
          blob: row.blob,
          name: row.name,
        })),
      );
    };
    tx.onerror = () => reject(tx.error);
  });
}

export function kindForName(name: string): Kind | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mid", "midi", "kar"].includes(ext)) return "midi";
  if (["mp3", "mpeg", "mpg", "m4a", "aac", "wav", "ogg"].includes(ext)) return "audio";
  if (["mp4", "m4v", "mpe4", "webm", "mov"].includes(ext)) return "video";
  return null;
}

export function parseSongName(fileName: string, index: number): Pick<Track, "code" | "title" | "artist" | "fileName" | "kind"> | null {
  const kind = kindForName(fileName);
  if (!kind) return null;
  const base = fileName.replace(/\.[^.]+$/, "");
  let parts = base
    .split(/\s+[–—-]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  let code = "";
  if (parts[0] && /^\d+$/.test(parts[0])) {
    code = parts[0].padStart(6, "0");
    parts = parts.slice(1);
  }
  let title = base;
  let artist = "Unknown";
  if (parts.length >= 2) {
    artist = parts[parts.length - 1] ?? "Unknown";
    title = parts.slice(0, -1).join(" - ");
  } else if (parts.length === 1) {
    title = parts[0] ?? base;
    artist = "Unknown";
  }
  if (!code) code = String(100000 + index).padStart(6, "0");
  return { code, title, artist, fileName, kind };
}

function toTrack(fileName: string, index: number, origin: Track["origin"], extra: Partial<Track>): Track | null {
  const parsed = parseSongName(fileName, index);
  if (!parsed) return null;
  const id = origin === "blob" ? `blob:${extra.blobKey}` : `fs:${extra.relPath ?? fileName}`;
  return { id, ...parsed, origin, ...extra };
}

export async function loadStoredTracks(): Promise<Track[]> {
  try {
    const rows = await idbAll();
    return rows
      .map((row, index) => {
        sessionBlobs.set(row.key, row.blob);
        return toTrack(row.name, index, "blob", { blobKey: row.key, bytes: row.blob.size });
      })
      .filter((track): track is Track => Boolean(track));
  } catch {
    return [];
  }
}

async function fileFromPath(root: FileSystemDirectoryHandle, relPath: string): Promise<File> {
  const parts = relPath.split("/").filter(Boolean);
  let dir = asDir(root);
  for (let i = 0; i < parts.length - 1; i++) dir = asDir(await dir.getDirectoryHandle(parts[i]!));
  const handle = await dir.getFileHandle(parts[parts.length - 1]!);
  return handle.getFile();
}

async function walk(dir: DirHandle, prefix: string, depth: number, out: { file: File; rel: string }[]) {
  if (out.length >= 1500 || depth > 3) return;
  for await (const entry of dir.values()) {
    if (out.length >= 1500) return;
    if (entry.kind === "file") {
      const file = entry.getFile ? await entry.getFile() : null;
      if (file && kindForName(file.name)) out.push({ file, rel: prefix ? `${prefix}/${file.name}` : file.name });
    } else if (entry.kind === "directory") {
      const next = asDir(entry as FileSystemDirectoryHandle);
      const prefer = /^(songs|bgv|music|karaoke)$/i.test(next.name);
      if (depth === 0 && !prefer && out.length > 0) continue;
      await walk(next, prefix ? `${prefix}/${next.name}` : next.name, depth + 1, out);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
}

export async function scanHandle(root: FileSystemDirectoryHandle): Promise<Track[]> {
  folderHandle = root;
  const found: { file: File; rel: string }[] = [];
  const dir = asDir(root);
  try {
    const songs = asDir(await dir.getDirectoryHandle("songs"));
    await walk(songs, "songs", 1, found);
  } catch {
    await walk(dir, "", 0, found);
  }
  return found
    .map((item, index) => toTrack(item.file.name, index, "folder", { relPath: item.rel, bytes: item.file.size }))
    .filter((track): track is Track => Boolean(track))
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.title.localeCompare(b.title));
}

export async function restoreFolderTracks(): Promise<Track[] | null> {
  try {
    const handle = await idbGet<FileSystemDirectoryHandle>("handles", HANDLE_KEY);
    if (!handle) return null;
    const permission = await asDir(handle).queryPermission({ mode: "read" });
    if (permission !== "granted") return null;
    return scanHandle(handle);
  } catch {
    return null;
  }
}

export async function pickFolder(): Promise<{ tracks: Track[]; note: string } | null> {
  const picker = (window as Window & { showDirectoryPicker?: (opts?: { mode?: "read" }) => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker;
  if (!picker) return null;
  const handle = await picker({ mode: "read" });
  await idbPut("handles", HANDLE_KEY, handle);
  const tracks = await scanHandle(handle);
  const note = tracks.length
    ? `Storage synced · ${tracks.length.toLocaleString()} playable files kept on this device.`
    : "That folder has no .mid, .mp3, .mpeg, or .mp4 songs.";
  return { tracks, note };
}

export async function importFiles(files: File[]): Promise<{ tracks: Track[]; note: string }> {
  const accepted = files.filter((file) => kindForName(file.name));
  const tracks: Track[] = [];
  let stored = 0;
  let session = 0;
  for (let index = 0; index < accepted.length && tracks.length < 1500; index++) {
    const file = accepted[index]!;
    const key = `f-${Date.now().toString(36)}-${index}-${file.size}`;
    if (file.size <= 40_000_000 && stored < 80) {
      await idbPut("blobs", key, { name: file.name, blob: file });
      stored++;
    } else {
      session++;
    }
    sessionBlobs.set(key, file);
    const track = toTrack(file.name, index, "blob", { blobKey: key, bytes: file.size });
    if (track) tracks.push(track);
    if (index % 40 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
  }
  const skipped = files.length - accepted.length;
  const parts = [`Added ${tracks.length.toLocaleString()} songs`];
  if (stored) parts.push(`${stored} saved for next visit`);
  if (session) parts.push(`${session} ready this session only`);
  if (skipped) parts.push(`${skipped} skipped (unsupported type)`);
  if (!tracks.length) parts[0] = `No playable files. Use ${ACCEPT_EXT.slice(0, 6).join(", ")}`;
  return { tracks, note: `${parts.join(" · ")}.` };
}

export async function blobForTrack(track: Track): Promise<Blob> {
  if (track.origin === "demo") throw new Error("Demo tracks are synthesized");
  if (track.blobKey) {
    const cached = sessionBlobs.get(track.blobKey);
    if (cached) return cached;
    const row = await idbGet<{ blob: Blob }>("blobs", track.blobKey);
    if (row?.blob) {
      sessionBlobs.set(track.blobKey, row.blob);
      return row.blob;
    }
  }
  if (track.origin === "folder" && track.relPath && folderHandle) {
    return fileFromPath(folderHandle, track.relPath);
  }
  throw new Error("Song file is no longer available. Sync storage again.");
}

export function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
