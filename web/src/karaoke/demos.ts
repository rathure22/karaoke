import type { MidiSong, Track } from "@/karaoke/types";

type Spec = {
  code: string;
  title: string;
  artist: string;
  bpm: number;
  bars: [number, boolean][];
  melody: number[];
  lines: string[];
};

function expand(spec: Spec): MidiSong {
  const notes: MidiSong["notes"] = [];
  const lyrics: MidiSong["lyrics"] = [];
  const barCount = spec.bars.length;
  const beats = barCount * 4;
  for (let bar = 0; bar < barCount; bar++) {
    const [root, minor] = spec.bars[bar]!;
    const third = root + (minor ? 3 : 4);
    const fifth = root + 7;
    for (const pitch of [root + 12, third + 12, fifth + 12]) {
      notes.push({ beat: bar * 4, dur: 3.5, midi: pitch, vel: 46, ch: 0, melody: false });
    }
    for (let step = 0; step < 4; step++) {
      const beat = bar * 4 + step;
      const bass = step === 1 ? fifth : step === 3 ? root + 12 : root;
      notes.push({ beat, dur: 0.42, midi: bass, vel: 80, ch: 1, melody: false });
      notes.push({ beat, dur: 0.08, midi: 42, vel: step % 2 ? 36 : 52, ch: 9, melody: false });
      if (step === 0) notes.push({ beat, dur: 0.18, midi: 36, vel: 104, ch: 9, melody: false });
      if (step === 2) notes.push({ beat, dur: 0.16, midi: 36, vel: 72, ch: 9, melody: false });
      if (step === 1 || step === 3) notes.push({ beat, dur: 0.16, midi: 38, vel: 90, ch: 9, melody: false });
      const mel = spec.melody[beat % spec.melody.length] ?? 0;
      if (mel > 0) notes.push({ beat, dur: 0.88, midi: mel, vel: 108, ch: 2, melody: true });
    }
    const line = spec.lines[bar];
    if (line) lyrics.push({ beat: bar * 4, text: line });
  }
  return { notes, lyrics, tempos: [{ beat: 0, bpm: spec.bpm }], beats };
}

const LOOP: [number, boolean][] = [
  [48, false],
  [53, false],
  [55, false],
  [57, true],
  [48, false],
  [41, false],
  [43, false],
  [45, true],
];

const SPECS: Spec[] = [
  {
    code: "000001",
    title: "Blue Horizon",
    artist: "May Lin",
    bpm: 100,
    bars: LOOP,
    melody: [76, 79, 81, 79, 77, 76, 74, 72, 74, 77, 76, 74, 72, 74, 76, 79],
    lines: [
      "City lights along the water",
      "I keep your melody",
      "Every window hums the chorus",
      "Stay another beat with me",
      "Horizon turning silver",
      "The night is keeping time",
      "If you hear me, sing it louder",
      "This song was always mine",
    ],
  },
  {
    code: "000002",
    title: "Summer Breeze",
    artist: "Kevin Brooks",
    bpm: 98,
    bars: LOOP,
    melody: [72, 74, 76, 79, 81, 79, 76, 74, 76, 74, 72, 71, 72, 74, 76, 72],
    lines: [
      "Windows down on a quiet street",
      "Radio knows our names",
      "Summer leans against the evening",
      "Nothing here to explain",
      "Hold the note a little longer",
      "Let the chorus bloom",
      "We can leave the map unfinished",
      "Meet me in the room",
    ],
  },
  {
    code: "000003",
    title: "Neon Lights",
    artist: "Aiko Tanaka",
    bpm: 112,
    bars: LOOP,
    melody: [79, 81, 84, 81, 79, 77, 76, 74, 76, 79, 81, 79, 77, 76, 74, 72],
    lines: [
      "Neon writes your name in color",
      "On the rain-slick road",
      "I follow every changing signal",
      "Wherever the chorus goes",
      "Turn it up above the traffic",
      "Let the high note ring",
      "We were never background singers",
      "This is our opening",
    ],
  },
  {
    code: "000004",
    title: "Moonlight Promise",
    artist: "Sarah Cole",
    bpm: 86,
    bars: LOOP,
    melody: [74, 76, 79, 76, 74, 72, 71, 72, 74, 72, 71, 69, 71, 72, 74, 76],
    lines: [
      "Leave a light above the stair",
      "I remember how it felt",
      "Moonlight keeps a quiet promise",
      "Long after midnight bells",
      "If the words arrive too slowly",
      "Hum the line with me",
      "Some promises are melodies",
      "Soft enough to keep",
    ],
  },
  {
    code: "000005",
    title: "City Dreams",
    artist: "Tom Reyes",
    bpm: 104,
    bars: LOOP,
    melody: [72, 76, 79, 76, 81, 79, 77, 74, 76, 79, 77, 74, 72, 71, 72, 76],
    lines: [
      "Elevators full of strangers",
      "All of them humming",
      "City dreams in different keys",
      "Somehow still becoming",
      "Take the bridge and don't look down",
      "The skyline answers back",
      "Every dream deserves a chorus",
      "Yours is on this track",
    ],
  },
  {
    code: "000006",
    title: "Starlight Memories",
    artist: "Jun Wei",
    bpm: 96,
    bars: LOOP,
    melody: [76, 79, 76, 74, 72, 74, 76, 79, 81, 79, 76, 74, 72, 74, 76, 72],
    lines: [
      "夜色轻轻落在窗",
      "星河向我眨眼睛",
      "如果歌声还记得",
      "请你再靠近一点",
      "城市在远处发亮",
      "心跳跟着节拍走",
      "把未说完的句子",
      "唱进这一首星光",
    ],
  },
  {
    code: "000007",
    title: "Harbor Echo",
    artist: "Lila Ortiz",
    bpm: 92,
    bars: LOOP,
    melody: [69, 72, 76, 74, 72, 76, 79, 76, 74, 72, 71, 72, 74, 76, 74, 72],
    lines: [
      "Boats knock softly on the pier",
      "Echo answers twice",
      "I throw a line into the water",
      "It comes back as a voice",
      "Sing until the harbor listens",
      "Sing until it's clear",
      "Every echo finds a shoreline",
      "I am glad you're here",
    ],
  },
  {
    code: "000008",
    title: "Paper Lanterns",
    artist: "Noah Vale",
    bpm: 108,
    bars: LOOP,
    melody: [81, 79, 76, 79, 77, 74, 76, 72, 74, 76, 79, 81, 79, 76, 74, 72],
    lines: [
      "Paper lanterns leave the courtyard",
      "Small fires learning flight",
      "We wrote our wishes on the inside",
      "Then we let them night",
      "Don't chase them past the river",
      "Just keep the melody",
      "Some lights are only beautiful",
      "Because we set them free",
    ],
  },
];

const SONGS = new Map<string, MidiSong>(SPECS.map((spec) => [spec.code, expand(spec)]));

export function demoSong(code: string): MidiSong | undefined {
  return SONGS.get(code);
}

export const demoTracks: Track[] = SPECS.map((spec) => ({
  id: `demo:${spec.code}`,
  code: spec.code,
  title: spec.title,
  artist: spec.artist,
  kind: "midi" as const,
  fileName: `${spec.code} – ${spec.title} – ${spec.artist}.mid`,
  origin: "demo" as const,
  bytes: 2400,
}));
