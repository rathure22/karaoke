import { create } from "zustand";
import { demoSong, demoTracks } from "@/karaoke/demos";
import { durationSec } from "@/karaoke/midi";
import type { BgvId, TabId, ThemeId, Track, Tune } from "@/karaoke/types";

const SETTINGS_KEY = "mykaraoke-settings";

type Settings = {
  theme: ThemeId;
  singer: string;
  keyShift: number;
  tempoRatio: number;
  micVol: number;
  echo: number;
  echoOn: boolean;
  bgv: BgvId;
};

const defaultSettings: Settings = {
  theme: "neon",
  singer: "Alex Chen",
  keyShift: 2,
  tempoRatio: 98 / 96,
  micVol: 75,
  echo: 32,
  echoOn: true,
  bgv: "city",
};

export type BoothState = Settings & {
  tracks: Track[];
  query: string;
  kindFilter: "all" | Track["kind"];
  queue: Track[];
  currentId: string | null;
  playing: boolean;
  paused: boolean;
  score: number;
  baseBpm: number;
  micOn: boolean;
  micLevel: number;
  tune: Tune;
  lyric: string;
  lyricNext: string;
  lyricPrev: string;
  lyricPct: number;
  timeSec: number;
  durSec: number;
  tab: TabId;
  notice: string;
  scoreOpen: boolean;
  syncing: boolean;
  storageLabel: string;
  code: string;
  remoteOpen: boolean;
  meter: number[];
  videoOn: boolean;
  editingSinger: boolean;
};

type Actions = {
  patch: (partial: Partial<BoothState>) => void;
};

function readSettings(): Settings {
  if (typeof localStorage === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
}

export const useBooth = create<BoothState & Actions>((set) => ({
  tracks: demoTracks,
  query: "",
  kindFilter: "all",
  queue: demoTracks.slice(0, 5),
  currentId: demoTracks[5]?.id ?? demoTracks[0]!.id,
  playing: false,
  paused: false,
  score: 92450,
  baseBpm: 96,
  micOn: false,
  micLevel: 0,
  tune: "idle",
  lyric: "夜色轻轻落在窗",
  lyricNext: "星河向我眨眼睛",
  lyricPrev: "",
  lyricPct: 0,
  timeSec: 0,
  durSec: durationSec(demoSong("000006") ?? { notes: [], lyrics: [], tempos: [{ beat: 0, bpm: 96 }], beats: 32 }),
  tab: "stage",
  notice: "",
  scoreOpen: false,
  syncing: false,
  storageLabel: "House band ready",
  code: "",
  remoteOpen: false,
  meter: [0.2, 0.35, 0.15, 0.4, 0.25, 0.1, 0.3, 0.2],
  videoOn: false,
  editingSinger: false,
  ...defaultSettings,
  patch: (partial) => set(partial),
}));

let hooked = false;

export function bootSettings() {
  const settings = readSettings();
  useBooth.setState(settings);
  document.documentElement.dataset.theme = settings.theme;
  if (hooked) return;
  hooked = true;
  useBooth.subscribe((state, prev) => {
    if (state.theme !== prev.theme) document.documentElement.dataset.theme = state.theme;
    const changed =
      state.theme !== prev.theme ||
      state.singer !== prev.singer ||
      state.keyShift !== prev.keyShift ||
      state.tempoRatio !== prev.tempoRatio ||
      state.micVol !== prev.micVol ||
      state.echo !== prev.echo ||
      state.echoOn !== prev.echoOn ||
      state.bgv !== prev.bgv;
    if (!changed) return;
    const next: Settings = {
      theme: state.theme,
      singer: state.singer,
      keyShift: state.keyShift,
      tempoRatio: state.tempoRatio,
      micVol: state.micVol,
      echo: state.echo,
      echoOn: state.echoOn,
      bgv: state.bgv,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  });
}

export function mergeTracks(blobs: Track[], folder: Track[]) {
  const map = new Map<string, Track>();
  for (const track of demoTracks) map.set(track.id, track);
  for (const track of blobs) map.set(track.id, track);
  for (const track of folder) map.set(track.id, track);
  const tracks = [...map.values()].sort(
    (a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }) || a.title.localeCompare(b.title),
  );
  useBooth.setState({
    tracks,
    storageLabel: folder.length
      ? `Folder synced · ${folder.length.toLocaleString()} files`
      : blobs.length
        ? `Saved on this device · ${blobs.length.toLocaleString()} files`
        : "House band ready",
  });
}

export function findByCode(tracks: Track[], entry: string): Track | undefined {
  const digits = entry.replace(/\D/g, "");
  if (!digits) return undefined;
  const padded = digits.padStart(6, "0");
  return tracks.find((track) => track.code === padded || track.code === digits || track.code.replace(/^0+/, "") === digits.replace(/^0+/, ""));
}
