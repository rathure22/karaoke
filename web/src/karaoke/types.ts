export type Kind = "midi" | "audio" | "video";

export type Track = {
  id: string;
  code: string;
  title: string;
  artist: string;
  kind: Kind;
  fileName: string;
  origin: "demo" | "blob" | "folder";
  blobKey?: string;
  relPath?: string;
  bytes?: number;
};

export type MidiNote = {
  beat: number;
  dur: number;
  midi: number;
  vel: number;
  ch: number;
  melody: boolean;
};

export type LyricEv = { beat: number; text: string };
export type TempoMark = { beat: number; bpm: number };

export type MidiSong = {
  notes: MidiNote[];
  lyrics: LyricEv[];
  tempos: TempoMark[];
  beats: number;
};

export type ThemeId = "neon" | "violet" | "solar" | "vercel" | "rose" | "emerald";
export type BgvId = "city" | "grid" | "stars" | "ocean" | "solar" | "haze";
export type TabId = "stage" | "queue" | "booth" | "songs" | "code";
export type Tune = "idle" | "hit" | "close" | "miss";

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "neon", label: "Neon", swatch: "#3ad7ff" },
  { id: "violet", label: "Violet", swatch: "#c084fc" },
  { id: "solar", label: "Solar", swatch: "#ffb020" },
  { id: "vercel", label: "Vercel", swatch: "#ededed" },
  { id: "rose", label: "Rose", swatch: "#ff4d8d" },
  { id: "emerald", label: "Emerald", swatch: "#2ee6a6" },
];

export const BGVS: { id: BgvId; label: string; hint: string }[] = [
  { id: "city", label: "City Nights", hint: "Skyline glow, ambient city" },
  { id: "grid", label: "Neon Grid", hint: "Floor grid, stage depth" },
  { id: "stars", label: "Starlight", hint: "Slow star field" },
  { id: "ocean", label: "Harbor", hint: "Tide and horizon" },
  { id: "solar", label: "Solar Dawn", hint: "Warm horizon flare" },
  { id: "haze", label: "Stage Haze", hint: "Vertical light beams" },
];

export const ACCEPT_EXT = ["mid", "midi", "kar", "mp3", "mpeg", "mpg", "mpe4", "mp4", "m4v", "m4a", "aac", "wav", "webm", "ogg"];
