import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Check,
  Delete,
  FolderSync,
  Inbox,
  Keyboard,
  ListMusic,
  Mic,
  MicOff,
  Music2,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Sparkles,
  Square,
  Star,
  Tv,
  UserRound,
  Waves,
  X,
} from "lucide-react";
import { demoSong } from "@/karaoke/demos";
import {
  attachVideo,
  displayedBpm,
  nudgeBpm,
  playNext,
  playPrev,
  playTrack,
  setEcho,
  setKey,
  setMicVol,
  setTempoRatio,
  stopPlayback,
  toggleEcho,
  toggleMic,
  togglePlay,
} from "@/karaoke/engine";
import { formatBytes, importFiles, loadStoredTracks, pickFolder, restoreFolderTracks } from "@/karaoke/library";
import { durationSec } from "@/karaoke/midi";
import { bootSettings, findByCode, mergeTracks, useBooth } from "@/karaoke/store";
import { BGVS, THEMES, type BgvId, type TabId, type Track } from "@/karaoke/types";

const TABS: { id: TabId; label: string }[] = [
  { id: "stage", label: "Stage" },
  { id: "queue", label: "Queue" },
  { id: "booth", label: "Booth" },
  { id: "songs", label: "Songs" },
  { id: "code", label: "Code" },
];

const HOSTS = ["Lisa", "Kevin", "David", "Sarah", "Tom"];

function clock(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const total = Math.floor(sec);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function trackLength(track: Track) {
  if (track.origin === "demo") {
    const song = demoSong(track.code);
    if (song) return clock(durationSec(song));
  }
  return formatBytes(track.bytes) || track.kind.toUpperCase();
}

function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect x="1.5" y="1.5" width="45" height="45" rx="14" fill="currentColor" opacity="0.16" />
      <rect x="2" y="2" width="44" height="44" rx="13" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <rect x="18" y="9" width="12" height="18" rx="6" fill="currentColor" />
      <path d="M15 22a9 9 0 0 0 18 0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 31v5.5M18.5 36.5h11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function useFiltered() {
  const tracks = useBooth((s) => s.tracks);
  const query = useBooth((s) => s.query);
  const kindFilter = useBooth((s) => s.kindFilter);
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return tracks.filter((track) => {
      if (kindFilter !== "all" && track.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        track.title.toLowerCase().includes(q) ||
        track.artist.toLowerCase().includes(q) ||
        track.code.includes(q.replace(/\D/g, "") || q) ||
        track.fileName.toLowerCase().includes(q)
      );
    });
  }, [tracks, query, kindFilter]);
}

export function KaraokeApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const tab = useBooth((s) => s.tab);
  const notice = useBooth((s) => s.notice);
  const remoteOpen = useBooth((s) => s.remoteOpen);
  const scoreOpen = useBooth((s) => s.scoreOpen);

  useEffect(() => {
    bootSettings();
    attachVideo(videoRef.current);
    let alive = true;
    void (async () => {
      const blobs = await loadStoredTracks();
      const folder = (await restoreFolderTracks()) ?? [];
      if (!alive) return;
      mergeTracks(blobs, folder);
    })();
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      if (event.code === "Space") {
        event.preventDefault();
        void togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4">
      <SearchRow />
      {notice ? <p className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted">{notice}</p> : null}
      <section className="console-shell flex min-h-0 flex-1 flex-col gap-3 rounded-card border border-line bg-surface/88 p-3 sm:p-4">
        <Masthead />
        <div className="grid grid-cols-5 gap-1 lg:hidden">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => useBooth.setState({ tab: item.id })}
              className={`h-10 rounded-full text-xs font-semibold ${tab === item.id ? "bg-primary text-ink" : "bg-deep text-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={`${tab === "stage" || tab === "queue" || tab === "booth" ? "grid" : "hidden lg:grid"} min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.92fr)]`}>
          <div className={tab === "stage" ? "min-h-72 lg:min-h-0" : "hidden lg:block"}>
            <Stage videoRef={videoRef} />
          </div>
          <div className={tab === "queue" ? "" : "hidden lg:block"}>
            <QueueCard />
          </div>
          <div className={tab === "booth" ? "" : "hidden lg:block"}>
            <Sitting />
          </div>
        </div>
        <div className={tab === "songs" ? "" : "hidden"}>
          <SongBrowser />
        </div>
        <div className={tab === "code" ? "lg:hidden" : "hidden"}>
          <Remote />
        </div>
        <Transport
          onSync={() => void syncStorage(folderRef)}
          onAdd={() => fileRef.current?.click()}
        />
      </section>
      <input
        ref={fileRef}
        type="file"
        multiple
        accept=".mid,.midi,.kar,.mp3,.mpeg,.mpg,.mpe4,.mp4,.m4v,.m4a,.aac,.wav,.webm,.ogg"
        className="hidden"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void takeFiles(files);
        }}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        className="hidden"
        accept=".mid,.midi,.kar,.mp3,.mpeg,.mpg,.mp4,.m4a,.wav"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void takeFiles(files);
        }}
        {...{ webkitdirectory: "", directory: "" }}
      />
      {remoteOpen ? (
        <div className="fixed inset-0 z-30 hidden items-end justify-center bg-deep/70 p-4 lg:flex lg:items-center">
          <div className="max-h-[90dvh] w-full max-w-md overflow-auto rounded-card border border-line bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Song code</h2>
              <button type="button" aria-label="Close code pad" onClick={() => useBooth.setState({ remoteOpen: false })} className="grid size-10 place-items-center rounded-full bg-deep">
                <X className="size-4" />
              </button>
            </div>
            <Remote />
          </div>
        </div>
      ) : null}
      {scoreOpen ? <ScoreCard /> : null}
    </main>
  );
}

async function syncStorage(folderRef: RefObject<HTMLInputElement | null>) {
  useBooth.setState({ syncing: true, notice: "" });
  try {
    const picked = await pickFolder();
    if (!picked) {
      useBooth.setState({ syncing: false });
      folderRef.current?.click();
      return;
    }
    const blobs = useBooth.getState().tracks.filter((track) => track.origin === "blob");
    mergeTracks(blobs, picked.tracks);
    useBooth.setState({ syncing: false, notice: picked.note, tab: "songs" });
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === "AbortError";
    useBooth.setState({ syncing: false, notice: aborted ? "" : "Could not read that folder." });
  }
}

async function takeFiles(files: File[]) {
  if (!files.length) return;
  useBooth.setState({ syncing: true });
  const result = await importFiles(files);
  const folder = useBooth.getState().tracks.filter((track) => track.origin === "folder");
  const blobs = await loadStoredTracks();
  const memory = result.tracks.filter((track) => !blobs.some((saved) => saved.blobKey === track.blobKey));
  mergeTracks([...blobs, ...memory], folder);
  useBooth.setState({ syncing: false, notice: result.note, tab: "songs" });
}

function SearchRow() {
  const query = useBooth((s) => s.query);
  const kindFilter = useBooth((s) => s.kindFilter);
  const filtered = useFiltered();
  const [open, setOpen] = useState(false);
  const hits = query.trim() ? filtered.slice(0, 8) : [];
  return (
    <div className="relative">
      <label className="flex h-12 items-center gap-2 rounded-full border border-line bg-surface/80 px-4">
        <Search className="size-4 shrink-0 text-primary" />
        <input
          value={query}
          onChange={(event) => {
            useBooth.setState({ query: event.target.value });
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && filtered[0]) void playTrack(filtered[0]);
          }}
          placeholder="Search title, artist or code..."
          className="w-full bg-transparent text-base outline-none placeholder:text-muted"
        />
        <button
          type="button"
          aria-label="Filter by file type"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const order = ["all", "midi", "audio", "video"] as const;
            const next = order[(order.indexOf(kindFilter) + 1) % order.length]!;
            useBooth.setState({ kindFilter: next });
          }}
          className="rounded-full px-2 text-xs font-semibold text-primary"
        >
          {kindFilter}
        </button>
      </label>
      {open && hits.length ? (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lg">
          {hits.map((track) => (
            <li key={track.id}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => void playTrack(track)} className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-raised">
                <Music2 className="size-4 text-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{track.title}</span>
                  <span className="block truncate text-xs text-muted">{track.code} · {track.artist}</span>
                </span>
                <span className="text-xs text-muted uppercase">{track.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Masthead() {
  const score = useBooth((s) => s.score);
  const singer = useBooth((s) => s.singer);
  const editing = useBooth((s) => s.editingSinger);
  const currentId = useBooth((s) => s.currentId);
  const tracks = useBooth((s) => s.tracks);
  const current = tracks.find((track) => track.id === currentId);
  return (
    <header className="flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <Mark className="size-12 text-primary" />
        <div>
          <h1 className="font-display text-xl leading-none font-extrabold text-balance">
            MyKaraoke <span className="text-primary">v3</span>
          </h1>
          <p className="text-xs text-muted">v3.0.2 · live booth</p>
        </div>
      </div>
      <div className="sm:ml-auto sm:text-right">
        <p className="flex items-center gap-1 text-xs tracking-widest text-muted sm:justify-end">
          SCORE <Sparkles className="size-3 text-primary" />
        </p>
        <p className="font-display text-3xl leading-none font-extrabold text-primary tabular-nums">{score.toLocaleString()}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-deep/70 px-3 py-2">
          <UserRound className="size-4 text-primary" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Now singing</p>
            {editing ? (
              <input
                autoFocus
                defaultValue={singer}
                onBlur={(event) => useBooth.setState({ singer: event.target.value.trim() || "Guest", editingSinger: false })}
                onKeyDown={(event) => {
                  if (event.key === "Enter") (event.target as HTMLInputElement).blur();
                }}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            ) : (
              <button type="button" onClick={() => useBooth.setState({ editingSinger: true })} className="block max-w-40 truncate text-sm font-semibold">
                {singer}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-deep/70 px-3 py-2">
          <Music2 className="size-4 text-primary" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Song</p>
            <p className="truncate text-sm font-semibold">{current ? `${current.title} · ${current.artist}` : "Nothing cued"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Stage({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) {
  const bgv = useBooth((s) => s.bgv);
  const lyric = useBooth((s) => s.lyric);
  const lyricNext = useBooth((s) => s.lyricNext);
  const lyricPrev = useBooth((s) => s.lyricPrev);
  const lyricPct = useBooth((s) => s.lyricPct);
  const timeSec = useBooth((s) => s.timeSec);
  const durSec = useBooth((s) => s.durSec);
  const videoOn = useBooth((s) => s.videoOn);
  const tune = useBooth((s) => s.tune);
  const playing = useBooth((s) => s.playing);
  const currentId = useBooth((s) => s.currentId);
  const tracks = useBooth((s) => s.tracks);
  const current = tracks.find((track) => track.id === currentId);
  return (
    <article className="flex h-full min-h-72 flex-col gap-3 rounded-card border border-line bg-deep/50 p-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Tv className="size-4 text-primary" /> Sing TV Frame
      </h2>
      <div className="relative flex min-h-56 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-stage p-4">
        <StageBg id={bgv} />
        <video ref={videoRef} playsInline className={videoOn ? "absolute inset-0 h-full w-full object-cover" : "hidden"} />
        <div className="relative z-10 flex items-start justify-between text-xs text-fg/80">
          <span className="rounded-full bg-deep/70 px-2 py-1">{BGVS.find((item) => item.id === bgv)?.label}</span>
          {tune !== "idle" ? (
            <span className={`rounded-full px-2 py-1 ${tune === "hit" ? "bg-ok text-ink" : tune === "close" ? "bg-primary text-ink" : "bg-deep/80 text-fg"}`}>
              {tune === "hit" ? "In tune" : tune === "close" ? "Close" : "Find the note"}
            </span>
          ) : null}
        </div>
        <div className="relative z-10 px-1 text-center">
          {lyricPrev ? <p className="mb-2 text-sm text-fg/55">{lyricPrev}</p> : <p className="mb-2 text-xs tracking-widest text-primary/80">LYRICS</p>}
          <p className="font-display text-3xl leading-tight font-bold text-balance text-primary sm:text-4xl">{lyric || current?.title || "Pick a song"}</p>
          <div className="mx-auto mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-fg/20">
            <div className="h-full bg-primary" style={{ width: `${Math.round(lyricPct * 100)}%` }} />
          </div>
          {lyricNext ? <p className="mt-3 text-sm text-fg/75">{lyricNext}</p> : null}
        </div>
        <div className="relative z-10 flex items-end justify-between gap-3">
          <p className="text-xs text-fg/75 tabular-nums">{clock(timeSec)} / {clock(durSec)}</p>
          <button
            type="button"
            onClick={() => {
              if (current) void playTrack(current);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-ink"
          >
            {playing ? <Pause className="size-4" /> : <Mic className="size-4" />}
            [ Sing ]
          </button>
        </div>
      </div>
    </article>
  );
}

function StageBg({ id }: { id: BgvId }) {
  const heights = [46, 72, 38, 64, 54, 80, 42, 68, 50, 76, 36, 60];
  return (
    <div className={`bgv bgv-${id}`} aria-hidden>
      {id === "city" ? (
        <div className="skyline">
          {heights.map((height, index) => (
            <i key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      ) : null}
      {id === "grid" ? <div className="grid-floor" /> : null}
      {id === "ocean" ? (
        <>
          <div className="tide" style={{ bottom: "18%" }} />
          <div className="tide" style={{ bottom: "8%", animationDelay: "1.2s" }} />
        </>
      ) : null}
      {id === "stars" ? <StarField /> : null}
    </div>
  );
}

function StarField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const dots = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      s: Math.random() * 0.35 + 0.08,
    }));
    let frame = 0;
    let rafId = 0;
    const draw = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      context.clearRect(0, 0, width, height);
      frame += 1;
      for (const dot of dots) {
        const y = ((dot.y + frame * 0.00035 * dot.s) % 1) * height;
        context.fillStyle = `rgba(231,246,255,${0.3 + dot.s})`;
        context.beginPath();
        context.arc(dot.x * width, y, dot.r, 0, Math.PI * 2);
        context.fill();
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

function QueueCard() {
  const queue = useBooth((s) => s.queue);
  return (
    <article className="flex h-full flex-col rounded-card border border-line bg-deep/50 p-3">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Inbox className="size-4 text-primary" /> Receive Queue
      </h2>
      <ol className="flex flex-1 flex-col gap-2 overflow-auto">
        {queue.length === 0 ? <li className="py-8 text-center text-sm text-muted">Queue is clear. Reserve a song or enter a code.</li> : null}
        {queue.map((track, index) => (
          <li key={`${track.id}-${index}`} className="rounded-2xl border border-line bg-surface/80 px-3 py-2">
            <div className="flex items-start gap-2">
              <span className="pt-0.5 text-sm font-semibold text-muted tabular-nums">{index + 1}.</span>
              <div className="min-w-0 flex-1">
                {index === 0 ? <p className="text-xs font-bold tracking-wide text-primary">NOW IN QUEUE</p> : null}
                <p className="truncate font-semibold">“{track.title}”</p>
                <p className="truncate text-xs text-muted">
                  {track.artist} · {trackLength(track)}
                </p>
                <p className="text-xs text-muted">Queued by {index < HOSTS.length && track.origin === "demo" ? HOSTS[index] : "you"}</p>
              </div>
              <button type="button" aria-label={`Remove ${track.title}`} onClick={() => useBooth.setState({ queue: queue.filter((_, item) => item !== index) })} className="grid size-9 place-items-center rounded-full text-muted hover:text-fg">
                <X className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function Sitting() {
  const keyShift = useBooth((s) => s.keyShift);
  const baseBpm = useBooth((s) => s.baseBpm);
  const tempoRatio = useBooth((s) => s.tempoRatio);
  const micVol = useBooth((s) => s.micVol);
  const echo = useBooth((s) => s.echo);
  const bgv = useBooth((s) => s.bgv);
  const theme = useBooth((s) => s.theme);
  const meter = useBooth((s) => s.meter);
  const micOn = useBooth((s) => s.micOn);
  const bpm = Math.round((baseBpm || 100) * tempoRatio);
  const scene = BGVS.find((item) => item.id === bgv);
  return (
    <article className="flex h-full flex-col gap-3 rounded-card border border-line bg-deep/50 p-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="size-4 text-primary" /> Sitting Feature Adjust
      </h2>
      <label className="block">
        <span className="flex items-center justify-between text-sm">
          Key <b className="font-display text-lg text-primary tabular-nums">{keyShift > 0 ? `+${keyShift}` : keyShift}</b>
        </span>
        <input type="range" min={-6} max={6} step={1} value={keyShift} aria-label="Key" onChange={(event) => setKey(Number(event.target.value))} className="w-full" />
        <span className="flex justify-between text-xs text-muted"><span>-6</span><span>0</span><span>+6</span></span>
      </label>
      <label className="block">
        <span className="flex items-center justify-between text-sm">
          Tempo <b className="font-display text-lg text-primary tabular-nums">{displayedBpm() || bpm} BPM</b>
        </span>
        <input
          type="range"
          min={70}
          max={140}
          step={1}
          value={Math.min(140, Math.max(70, bpm))}
          aria-label="Tempo"
          onChange={(event) => setTempoRatio(Number(event.target.value) / (baseBpm || 100))}
          className="w-full"
        />
        <span className="flex justify-between text-xs text-muted"><span>70</span><span>100</span><span>140</span></span>
      </label>
      <div className="flex gap-2">
        <Step label="Key down" onClick={() => setKey(keyShift - 1)} text="−" />
        <Step label="Key up" onClick={() => setKey(keyShift + 1)} text="+" />
        <Step label="Tempo down" onClick={() => nudgeBpm(-2)} text="− BPM" />
        <Step label="Tempo up" onClick={() => nudgeBpm(2)} text="+ BPM" />
      </div>
      <label className="block">
        <span className="flex items-center justify-between text-sm">
          Mic volume <b className="tabular-nums">{micVol}%</b>
        </span>
        <input type="range" min={0} max={100} value={micVol} aria-label="Mic volume" onChange={(event) => setMicVol(Number(event.target.value))} className="w-full" />
        <span className="mt-1 flex h-6 items-end gap-1" aria-hidden>
          {meter.map((value, index) => (
            <i key={index} className="block w-full rounded-sm bg-primary" style={{ height: `${Math.max(8, Math.round((micOn ? value : 0.08) * 24))}px`, opacity: micOn ? 0.45 + value : 0.25 }} />
          ))}
        </span>
      </label>
      <label className="block">
        <span className="flex items-center justify-between text-sm">
          Echo <b className="tabular-nums">{echo}%</b>
        </span>
        <input type="range" min={0} max={100} value={echo} aria-label="Echo" onChange={(event) => setEcho(Number(event.target.value))} className="w-full" />
      </label>
      <label className="block text-sm">
        BGV selection
        <select
          value={bgv}
          aria-label="Background visuals"
          onChange={(event) => useBooth.setState({ bgv: event.target.value as BgvId })}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-deep px-3"
        >
          {BGVS.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-muted">{scene?.hint}</span>
      </label>
      <div>
        <p className="mb-2 text-xs tracking-widest text-muted">SIX LOOKS</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => useBooth.setState({ theme: item.id })}
              className={`flex h-11 items-center justify-center gap-2 rounded-full border text-xs font-semibold ${theme === item.id ? "border-primary bg-primary text-ink" : "border-line bg-deep text-fg"}`}
            >
              <i className="size-2.5 rounded-full" style={{ background: item.swatch }} />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function Step({ label, text, onClick }: { label: string; text: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="h-11 flex-1 rounded-full border border-line bg-surface text-sm font-semibold">
      {text}
    </button>
  );
}

function SongBrowser() {
  const filtered = useFiltered();
  const query = useBooth((s) => s.query);
  const shown = filtered.slice(0, query.trim() ? 200 : 60);
  const storageLabel = useBooth((s) => s.storageLabel);
  const yours = shown.filter((track) => track.origin !== "demo");
  const house = shown.filter((track) => track.origin === "demo");
  return (
    <div className="rounded-card border border-line bg-deep/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <ListMusic className="size-4 text-primary" /> Songs
        </h2>
        <p className="text-xs text-muted">{storageLabel}</p>
      </div>
      <div className="max-h-[50dvh] space-y-3 overflow-auto pr-1">
        {yours.length ? <SongGroup title="On this device" tracks={yours} /> : null}
        <SongGroup title={yours.length ? "House band" : `House band · ${shown.length}`} tracks={house.length ? house : shown} />
        {filtered.length > shown.length ? <p className="text-xs text-muted">Showing {shown.length} of {filtered.length}. Type a title, artist, or code to narrow.</p> : null}
        {shown.length === 0 ? <p className="py-6 text-center text-sm text-muted">No songs match. Sync a folder of .mid, .mp3, .mpeg, or .mp4 files.</p> : null}
      </div>
    </div>
  );
}

function SongGroup({ title, tracks }: { title: string; tracks: Track[] }) {
  if (!tracks.length) return null;
  return (
    <div>
      <p className="mb-1 text-xs tracking-widest text-muted uppercase">{title}</p>
      <ul className="flex flex-col">
        {tracks.map((track) => (
          <li key={track.id} className="flex items-center gap-3 border-b border-line/70 py-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Music2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track.fileName}</p>
              <p className="text-xs text-muted">{trackLength(track)} · {track.kind.toUpperCase()} · {track.code}</p>
            </div>
            <button type="button" onClick={() => void playTrack(track)} className="h-10 rounded-full bg-primary px-3 text-xs font-bold text-ink">Sing</button>
            <button type="button" onClick={() => reserve(track)} className="h-10 rounded-full border border-line px-3 text-xs font-semibold">Reserve</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function reserve(track: Track) {
  const queue = useBooth.getState().queue;
  if (queue.some((item) => item.id === track.id)) {
    useBooth.setState({ notice: `${track.title} is already in the queue.` });
    return;
  }
  useBooth.setState({ queue: [...queue, track], notice: `Reserved ${track.title}.` });
}

function Remote() {
  const code = useBooth((s) => s.code);
  const tracks = useBooth((s) => s.tracks);
  const currentId = useBooth((s) => s.currentId);
  const playing = useBooth((s) => s.playing);
  const paused = useBooth((s) => s.paused);
  const timeSec = useBooth((s) => s.timeSec);
  const durSec = useBooth((s) => s.durSec);
  const keyShift = useBooth((s) => s.keyShift);
  const current = tracks.find((track) => track.id === currentId);
  const artists = [...new Map(tracks.map((track) => [track.artist, track])).values()].slice(0, 4);
  const press = (digit: string) => useBooth.setState({ code: (code + digit).slice(0, 6) });
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-2 text-xs tracking-widest text-muted">SUGGESTIONS</p>
        <ul className="flex flex-col gap-2">
          {artists.map((track) => (
            <li key={track.artist}>
              <button type="button" onClick={() => useBooth.setState({ query: track.artist, tab: "songs", remoteOpen: false })} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-deep px-3 py-2 text-left">
                <span className="grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-ink">{track.artist.slice(0, 1)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{track.artist}</span>
                  <span className="block text-xs text-muted">Singer · {track.kind === "midi" ? "MIDI" : track.kind}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-card border border-line bg-raised/70 p-3">
        <div className="flex gap-3">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-deep text-primary">
            <Music2 className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-bold">{current ? current.title : "No song"}</p>
            <p className="text-sm text-muted">{playing ? (paused ? "Paused" : "Now playing") : "Cued"} · {clock(timeSec)} / {clock(durSec)}</p>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-deep">
          <div className="h-full bg-primary" style={{ width: `${durSec ? Math.min(100, (timeSec / durSec) * 100) : 0}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-center">
            <p className="text-xs text-muted">KEY</p>
            <div className="mt-1 flex items-center gap-1">
              <Round onClick={() => setKey(keyShift - 1)} label="Key down">−</Round>
              <span className="w-10 font-display text-lg font-bold text-primary tabular-nums">{keyShift > 0 ? `+${keyShift}` : keyShift}</span>
              <Round onClick={() => setKey(keyShift + 1)} label="Key up">+</Round>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted">TEMPO</p>
            <div className="mt-1 flex items-center gap-1">
              <Round onClick={() => nudgeBpm(-2)} label="Tempo down">−</Round>
              <span className="w-16 text-sm font-bold tabular-nums">{displayedBpm()} BPM</span>
              <Round onClick={() => nudgeBpm(2)} label="Tempo up">+</Round>
            </div>
          </div>
          <button type="button" aria-label={playing && !paused ? "Pause" : "Play"} onClick={() => void togglePlay()} className="grid size-14 place-items-center rounded-full bg-primary text-ink">
            {playing && !paused ? <Pause className="size-6" /> : <Play className="size-6" />}
          </button>
        </div>
      </div>
      <div>
        <p className="mb-2 text-center text-xs tracking-widest text-muted">SONG CODE · {code || "ENTER CODE"}</p>
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button key={digit} type="button" onClick={() => press(digit)} className="h-14 rounded-2xl bg-deep text-xl font-semibold">{digit}</button>
          ))}
          <button type="button" onClick={() => useBooth.setState({ code: "" })} className="h-14 rounded-2xl bg-deep text-sm font-semibold text-danger">Cancel</button>
          <button type="button" onClick={() => press("0")} className="h-14 rounded-2xl bg-deep text-xl font-semibold">0</button>
          <button type="button" onClick={() => enterCode(false)} className="flex h-14 items-center justify-center gap-1 rounded-2xl bg-primary font-bold text-ink">
            <Check className="size-4" /> Enter
          </button>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <button type="button" onClick={() => enterCode(true)} className="h-12 rounded-2xl border border-line text-xs font-bold">Reserve</button>
          <button type="button" onClick={() => useBooth.setState({ scoreOpen: true })} className="h-12 rounded-2xl bg-primary text-xs font-bold text-ink">Score</button>
          <button type="button" onClick={() => { useBooth.setState({ code: "", score: 0 }); void stopPlayback(); }} className="h-12 rounded-2xl border border-line text-xs font-bold">Clear</button>
        </div>
      </div>
    </div>
  );
}

function Round({ children, onClick, label }: { children: string; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid size-11 place-items-center rounded-full bg-deep text-lg font-bold">
      {children}
    </button>
  );
}

function enterCode(queueOnly: boolean) {
  const { code, tracks } = useBooth.getState();
  const track = findByCode(tracks, code);
  if (!track) {
    useBooth.setState({ notice: code ? `No song for code ${code}.` : "Enter a song code." });
    return;
  }
  if (queueOnly) reserve(track);
  else void playTrack(track);
  useBooth.setState({ code: "", remoteOpen: false, tab: "stage" });
}

function Transport({ onSync, onAdd }: { onSync: () => void; onAdd: () => void }) {
  const playing = useBooth((s) => s.playing);
  const paused = useBooth((s) => s.paused);
  const micOn = useBooth((s) => s.micOn);
  const echoOn = useBooth((s) => s.echoOn);
  const queue = useBooth((s) => s.queue);
  const syncing = useBooth((s) => s.syncing);
  const bgv = useBooth((s) => s.bgv);
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Pill label={playing && !paused ? "Pause" : "Play"} onClick={() => void togglePlay()} active={playing && !paused}>
        {playing && !paused ? <Pause className="size-4" /> : <Play className="size-4" />} Play
      </Pill>
      <Pill label="Stop" onClick={() => void stopPlayback()}>
        <Square className="size-4" /> Stop
      </Pill>
      <Pill label="Next" onClick={() => void playNext()}>
        <SkipForward className="size-4" /> Next
      </Pill>
      <Pill label="Previous" onClick={() => void playPrev()}>
        <SkipBack className="size-4" /> Prev
      </Pill>
      <Pill label="Microphone" onClick={() => void toggleMic()} active={micOn}>
        {micOn ? <Mic className="size-4" /> : <MicOff className="size-4" />} Mic
      </Pill>
      <Pill label="Echo" onClick={toggleEcho} active={echoOn}>
        <Waves className="size-4" /> Echo
      </Pill>
      <Pill
        label="Background"
        onClick={() => {
          const index = BGVS.findIndex((item) => item.id === bgv);
          const next = BGVS[(index + 1) % BGVS.length]!;
          useBooth.setState({ bgv: next.id });
        }}
      >
        <Sparkles className="size-4" /> BGV
      </Pill>
      <Pill label="Received queue" onClick={() => useBooth.setState({ tab: "queue" })}>
        <Inbox className="size-4" /> Received
        <span className="grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-ink">{queue.length}</span>
      </Pill>
      <Pill label="Songs" onClick={() => useBooth.setState({ tab: "songs" })}>
        <ListMusic className="size-4" /> Songs
      </Pill>
      <Pill label="Song code" onClick={() => useBooth.setState(window.matchMedia("(min-width: 1024px)").matches ? { remoteOpen: true } : { tab: "code" })}>
        <Keyboard className="size-4" /> Code
      </Pill>
      <Pill label="Sync storage folder" onClick={onSync}>
        <FolderSync className={`size-4 ${syncing ? "animate-spin" : ""}`} /> Sync
      </Pill>
      <Pill label="Add songs from this device" onClick={onAdd}>
        <Music2 className="size-4" /> Add
      </Pill>
    </div>
  );
}

function Pill({ children, onClick, label, active }: { children: ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${active ? "border-primary bg-primary text-ink" : "border-line bg-deep text-fg"}`}
    >
      {children}
    </button>
  );
}

function ScoreCard() {
  const score = useBooth((s) => s.score);
  const singer = useBooth((s) => s.singer);
  const currentId = useBooth((s) => s.currentId);
  const tracks = useBooth((s) => s.tracks);
  const current = tracks.find((track) => track.id === currentId);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-deep/75 p-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6 text-center">
        <Star className="mx-auto size-8 text-primary" />
        <p className="mt-2 text-xs tracking-widest text-muted">PERFORMANCE</p>
        <p className="font-display text-5xl font-extrabold text-primary tabular-nums">{score.toLocaleString()}</p>
        <p className="mt-2 text-sm">{singer}{current ? ` · ${current.title}` : ""}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={() => useBooth.setState({ scoreOpen: false })} className="h-11 flex-1 rounded-full bg-primary font-bold text-ink">Close</button>
          <button type="button" onClick={() => useBooth.setState({ score: 0 })} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line font-semibold">
            <Delete className="size-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
