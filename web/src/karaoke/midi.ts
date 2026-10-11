import type { LyricEv, MidiNote, MidiSong, TempoMark } from "@/karaoke/types";

function readVar(data: Uint8Array, offset: number): { value: number; next: number } {
  let value = 0;
  let o = offset;
  let b = 0;
  do {
    if (o >= data.length) break;
    b = data[o++];
    value = (value << 7) | (b & 0x7f);
  } while (b & 0x80);
  return { value, next: o };
}

function ascii(data: Uint8Array, offset: number, length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) s += String.fromCharCode(data[offset + i] ?? 0);
  return s;
}

function decodeText(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/\u0000/g, "");
}

function cleanPiece(raw: string): { text: string; hard: boolean } {
  const hard = /[\n\r]/.test(raw) || /^[\\/@]/.test(raw.trim());
  const text = raw
    .replace(/[\n\r]+/g, " ")
    .replace(/^[\s\\/@]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  return { text, hard };
}

function groupLyrics(raw: { tick: number; text: string }[], ppq: number): LyricEv[] {
  const out: LyricEv[] = [];
  let buf = "";
  let beat = 0;
  let last = -99;
  const flush = () => {
    const text = buf.replace(/\s+/g, " ").trim();
    if (text) out.push({ beat, text });
    buf = "";
  };
  for (const ev of raw) {
    const { text, hard } = cleanPiece(ev.text);
    const b = ev.tick / ppq;
    if (!text) {
      if (hard) flush();
      continue;
    }
    if (buf && (hard || b - last > 1.75 || buf.length > 42)) flush();
    if (!buf) beat = b;
    if (!buf) buf = text;
    else if (buf.endsWith("-") || text.length > 8) buf = `${buf.replace(/-$/, "")} ${text}`;
    else if (/[A-Za-z0-9]$/.test(buf) && /^[A-Za-z0-9(]/.test(text)) buf += text.length <= 3 ? text : ` ${text}`;
    else buf += ` ${text}`;
    last = b;
    if (/[.!?。！？…]$/.test(buf) || buf.length > 52) flush();
  }
  flush();
  return out;
}

function markMelody(notes: MidiNote[]) {
  const buckets = new Map<number, number[]>();
  for (const note of notes) {
    if (note.ch === 9) continue;
    const list = buckets.get(note.ch) ?? [];
    list.push(note.midi);
    buckets.set(note.ch, list);
  }
  let best = -1;
  let bestScore = -1;
  for (const [ch, pitches] of buckets) {
    if (pitches.length < 4) continue;
    const sorted = [...pitches].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    if (median < 55) continue;
    const score = pitches.length * (median >= 60 && median <= 86 ? 2 : 1);
    if (score > bestScore) {
      bestScore = score;
      best = ch;
    }
  }
  if (best < 0) return;
  for (const note of notes) if (note.ch === best) note.melody = true;
}

type Raw =
  | { tick: number; kind: "on"; ch: number; note: number; vel: number }
  | { tick: number; kind: "off"; ch: number; note: number }
  | { tick: number; kind: "tempo"; bpm: number }
  | { tick: number; kind: "lyric"; text: string };

export function parseMidi(data: Uint8Array): MidiSong {
  if (data.length < 14 || ascii(data, 0, 4) !== "MThd") throw new Error("Not a MIDI file");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const headerLength = view.getUint32(4);
  const tracks = view.getUint16(10);
  const division = view.getUint16(12);
  const ppq = division & 0x8000 ? 480 : division || 480;
  let offset = 8 + headerLength;
  const events: Raw[] = [];

  for (let track = 0; track < tracks && offset + 8 <= data.length; track++) {
    if (ascii(data, offset, 4) !== "MTrk") break;
    const length = view.getUint32(offset + 4);
    offset += 8;
    const end = Math.min(data.length, offset + length);
    let tick = 0;
    let status = 0;
    while (offset < end) {
      const delta = readVar(data, offset);
      offset = delta.next;
      tick += delta.value;
      if (offset >= end) break;
      const peek = data[offset] ?? 0;
      if (peek === 0xff) {
        const type = data[offset + 1] ?? 0;
        const len = readVar(data, offset + 2);
        offset = len.next;
        const payload = data.slice(offset, offset + len.value);
        offset += len.value;
        status = 0;
        if (type === 0x51 && payload.length >= 3) {
          const us = ((payload[0] ?? 0) << 16) | ((payload[1] ?? 0) << 8) | (payload[2] ?? 0);
          events.push({ tick, kind: "tempo", bpm: us > 0 ? Math.round(60_000_000 / us) : 120 });
        } else if (type === 0x01 || type === 0x05) {
          const text = decodeText(payload);
          if (text.trim()) events.push({ tick, kind: "lyric", text });
        }
        continue;
      }
      if (peek === 0xf0 || peek === 0xf7) {
        const len = readVar(data, offset + 1);
        offset = len.next + len.value;
        status = 0;
        continue;
      }
      let running = false;
      if (peek & 0x80) {
        status = peek;
        offset++;
      } else {
        running = true;
      }
      if (!status || status < 0x80) continue;
      const hi = status & 0xf0;
      const ch = status & 0x0f;
      if (hi === 0xc0 || hi === 0xd0) {
        offset += 1;
        continue;
      }
      const d1 = running ? peek : (data[offset++] ?? 0);
      if (running) offset++;
      const d2 = data[offset++] ?? 0;
      if (hi === 0x90) {
        if (d2 === 0) events.push({ tick, kind: "off", ch, note: d1 });
        else events.push({ tick, kind: "on", ch, note: d1, vel: d2 });
      } else if (hi === 0x80) {
        events.push({ tick, kind: "off", ch, note: d1 });
      }
    }
    offset = end;
  }

  const pending = new Map<string, { tick: number; vel: number }>();
  const notes: MidiNote[] = [];
  let maxTick = 0;
  const lyricRaw: { tick: number; text: string }[] = [];
  const tempos: TempoMark[] = [];

  for (const event of events) {
    maxTick = Math.max(maxTick, event.tick);
    if (event.kind === "tempo") tempos.push({ beat: event.tick / ppq, bpm: event.bpm });
    else if (event.kind === "lyric") lyricRaw.push({ tick: event.tick, text: event.text });
    else if (event.kind === "on") pending.set(`${event.ch}:${event.note}`, { tick: event.tick, vel: event.vel });
    else {
      const key = `${event.ch}:${event.note}`;
      const start = pending.get(key);
      if (!start) continue;
      pending.delete(key);
      const durTicks = Math.max(1, event.tick - start.tick);
      notes.push({
        beat: start.tick / ppq,
        dur: durTicks / ppq,
        midi: event.note,
        vel: start.vel,
        ch: event.ch,
        melody: false,
      });
    }
  }
  for (const [key, start] of pending) {
    const [ch, note] = key.split(":").map(Number);
    notes.push({
      beat: start.tick / ppq,
      dur: 1,
      midi: note ?? 60,
      vel: start.vel,
      ch: ch ?? 0,
      melody: false,
    });
    maxTick = Math.max(maxTick, start.tick + ppq);
  }
  if (!notes.length) throw new Error("This MIDI has no notes");
  if (!tempos.length || tempos[0]!.beat > 0) tempos.unshift({ beat: 0, bpm: tempos[0]?.bpm ?? 120 });
  markMelody(notes);
  return {
    notes,
    lyrics: groupLyrics(lyricRaw, ppq),
    tempos,
    beats: Math.max(4, maxTick / ppq),
  };
}

export function songBpm(song: MidiSong): number {
  return song.tempos[0]?.bpm || 120;
}

export function beatToSec(song: MidiSong, beat: number): number {
  const marks = song.tempos.length ? song.tempos : [{ beat: 0, bpm: 120 }];
  let sec = 0;
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i]!.beat;
    const bpm = marks[i]!.bpm || 120;
    const end = i + 1 < marks.length ? marks[i + 1]!.beat : Number.POSITIVE_INFINITY;
    if (beat <= start) break;
    const slice = Math.min(beat, end) - start;
    sec += (slice * 60) / bpm;
    if (beat <= end) break;
  }
  return sec;
}

export function secToBeat(song: MidiSong, sec: number): number {
  const marks = song.tempos.length ? song.tempos : [{ beat: 0, bpm: 120 }];
  let acc = 0;
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i]!.beat;
    const bpm = marks[i]!.bpm || 120;
    const end = i + 1 < marks.length ? marks[i + 1]!.beat : Number.POSITIVE_INFINITY;
    const span = end - start;
    const spanSec = Number.isFinite(span) ? (span * 60) / bpm : Number.POSITIVE_INFINITY;
    if (acc + spanSec >= sec || !Number.isFinite(end)) return start + ((sec - acc) * bpm) / 60;
    acc += spanSec;
  }
  return marks[marks.length - 1]?.beat ?? 0;
}

export function durationSec(song: MidiSong): number {
  return beatToSec(song, song.beats);
}

export function activeMelody(song: MidiSong, beat: number): number | null {
  let found: number | null = null;
  for (const note of song.notes) {
    if (!note.melody) continue;
    if (beat >= note.beat && beat < note.beat + Math.max(0.2, note.dur)) found = note.midi;
  }
  return found;
}

function vlen(value: number): number[] {
  const bytes = [value & 0x7f];
  let rest = value >> 7;
  while (rest > 0) {
    bytes.push((rest & 0x7f) | 0x80);
    rest >>= 7;
  }
  return bytes.reverse();
}

/** Tiny SMF writer so the parser can be checked and demos can be exported later. */
export function encodeMidi(song: MidiSong): Uint8Array {
  const ppq = 480;
  const events: { tick: number; data: number[] }[] = [];
  const push = (tick: number, data: number[]) => events.push({ tick: Math.max(0, Math.round(tick)), data });
  for (const tempo of song.tempos) {
    const us = Math.max(1, Math.round(60_000_000 / (tempo.bpm || 120)));
    push(tempo.beat * ppq, [0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff]);
  }
  for (const line of song.lyrics) {
    const bytes = [...new TextEncoder().encode(line.text)];
    push(line.beat * ppq, [0xff, 0x05, ...vlen(bytes.length), ...bytes]);
  }
  for (const note of song.notes) {
    const on = Math.round(note.beat * ppq);
    const off = Math.round((note.beat + note.dur) * ppq);
    push(on, [0x90 | (note.ch & 0x0f), note.midi & 0x7f, note.vel & 0x7f]);
    push(Math.max(on + 1, off), [0x80 | (note.ch & 0x0f), note.midi & 0x7f, 0x40]);
  }
  events.sort((a, b) => a.tick - b.tick || a.data[0]! - b.data[0]!);
  const track: number[] = [];
  let last = 0;
  for (const event of events) {
    track.push(...vlen(event.tick - last), ...event.data);
    last = event.tick;
  }
  track.push(...vlen(0), 0xff, 0x2f, 0x00);
  const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, (ppq >> 8) & 0xff, ppq & 0xff];
  const out = new Uint8Array(header.length + 8 + track.length);
  out.set(header, 0);
  out.set([0x4d, 0x54, 0x72, 0x6b, (track.length >>> 24) & 0xff, (track.length >> 16) & 0xff, (track.length >> 8) & 0xff, track.length & 0xff], header.length);
  out.set(track, header.length + 8);
  return out;
}
