import { demoSong } from "@/karaoke/demos";
import { blobForTrack } from "@/karaoke/library";
import { activeMelody, beatToSec, durationSec, parseMidi, secToBeat, songBpm } from "@/karaoke/midi";
import { useBooth, type BoothState } from "@/karaoke/store";
import type { MidiSong, Track } from "@/karaoke/types";

type Stopper = () => void;

let ctx: AudioContext | null = null;
let music: GainNode | null = null;
let micGain: GainNode | null = null;
let echoWet: GainNode | null = null;
let echoFb: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let noise: AudioBuffer | null = null;

let song: MidiSong | null = null;
let buffer: AudioBuffer | null = null;
let bufferSrc: AudioBufferSourceNode | null = null;
let videoEl: HTMLVideoElement | null = null;
let videoUrl = "";
let generation = 0;
let voices: Stopper[] = [];
let raf = 0;
let originCtx = 0;
let originSongSec = 0;
let pausedHold = 0;
let scoreAnchor = 0;
let lastTune: "idle" | "hit" | "close" | "miss" = "idle";
let mode: "midi" | "audio" | "video" | "idle" = "idle";
let micSource: MediaStreamAudioSourceNode | null = null;
let finishing = false;
let lastUi = 0;

function state() {
  return useBooth.getState();
}

function publish(partial: Partial<BoothState>) {
  useBooth.setState(partial);
}

async function ensure(): Promise<AudioContext> {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 20;
    comp.ratio.value = 3.2;
    comp.attack.value = 0.006;
    comp.release.value = 0.18;
    music = ctx.createGain();
    music.gain.value = 0.85;
    micGain = ctx.createGain();
    micGain.gain.value = 0;
    const hip = ctx.createBiquadFilter();
    hip.type = "highpass";
    hip.frequency.value = 90;
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.75;
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.28;
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 2800;
    echoWet = ctx.createGain();
    echoFb = ctx.createGain();
    echoWet.gain.value = 0;
    echoFb.gain.value = 0;
    music.connect(comp);
    micGain.connect(hip);
    hip.connect(analyser);
    analyser.connect(comp);
    analyser.connect(delay);
    delay.connect(tone);
    tone.connect(echoFb);
    echoFb.connect(delay);
    tone.connect(echoWet);
    echoWet.connect(comp);
    comp.connect(ctx.destination);
    const samples = ctx.sampleRate;
    noise = ctx.createBuffer(1, samples, samples);
    const data = noise.getChannelData(0);
    for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
    applyMix();
  }
  if (ctx.state === "suspended") await ctx.resume();
  return ctx;
}

function applyMix() {
  const snap = state();
  if (micGain) micGain.gain.value = snap.micOn ? snap.micVol / 100 : 0;
  if (echoWet) echoWet.gain.value = snap.echoOn ? (snap.echo / 100) * 0.75 : 0;
  if (echoFb) echoFb.gain.value = snap.echoOn ? Math.min(0.48, (snap.echo / 100) * 0.5) : 0;
}

export function attachVideo(node: HTMLVideoElement | null) {
  videoEl = node;
}

function stopVoices() {
  for (const stop of voices) stop();
  voices = [];
}

function clearMedia(keepVideoElement = true) {
  generation++;
  stopVoices();
  if (bufferSrc) {
    bufferSrc.onended = null;
    try {
      bufferSrc.stop();
    } catch {
      /* already stopped */
    }
    bufferSrc.disconnect();
    bufferSrc = null;
  }
  buffer = null;
  if (videoEl) {
    videoEl.pause();
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    videoUrl = "";
    videoEl.removeAttribute("src");
    if (keepVideoElement) videoEl.load();
  }
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  song = null;
  mode = "idle";
}

function ratio() {
  return state().tempoRatio || 1;
}

function songSeconds(): number {
  if (!ctx || mode === "idle") return pausedHold;
  if (state().paused) return pausedHold;
  if (mode === "video" && videoEl) return videoEl.currentTime || 0;
  return originSongSec + (ctx.currentTime - originCtx) * (mode === "audio" ? bufferSrc?.playbackRate.value || ratio() : ratio());
}

function armClock(songSec: number) {
  if (!ctx) return;
  originCtx = ctx.currentTime;
  originSongSec = songSec;
  scoreAnchor = ctx.currentTime;
}

function trigger(audio: AudioContext, midi: number, when: number, dur: number, vel: number, ch: number, melody: boolean) {
  if (!music) return;
  const peakBase = melody ? 0.22 : ch === 1 ? 0.16 : 0.055;
  if (ch === 9) {
    drum(audio, midi, when, vel / 127);
    return;
  }
  const freq = 440 * 2 ** ((midi - 69) / 12);
  const osc = audio.createOscillator();
  const osc2 = audio.createOscillator();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();
  filter.type = "lowpass";
  if (ch === 1) {
    osc.type = "sawtooth";
    osc2.type = "sine";
    filter.frequency.setValueAtTime(280, when);
  } else if (melody) {
    osc.type = "triangle";
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, when);
    filter.frequency.setValueAtTime(3200, when);
  } else {
    osc.type = "triangle";
    osc2.type = "sine";
    filter.frequency.setValueAtTime(1400, when);
  }
  osc.frequency.setValueAtTime(freq, when);
  if (!melody) osc2.frequency.setValueAtTime(freq, when);
  const peak = Math.max(0.001, peakBase * (vel / 127));
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.06, dur));
  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  gain.connect(music);
  osc.start(when);
  osc2.start(when);
  const stopAt = when + Math.max(0.08, dur) + 0.02;
  osc.stop(stopAt);
  osc2.stop(stopAt);
  voices.push(() => {
    const now = audio.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(0.0001, now, 0.012);
    try {
      osc.stop(now + 0.03);
      osc2.stop(now + 0.03);
    } catch {
      /* ended */
    }
  });
}

function drum(audio: AudioContext, midi: number, when: number, vel: number) {
  if (!music || !noise) return;
  if (midi === 42 || midi === 44 || midi === 46) {
    const src = audio.createBufferSource();
    src.buffer = noise;
    const filter = audio.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.05 * vel, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.045);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(music);
    src.start(when);
    src.stop(when + 0.05);
    voices.push(() => {
      try {
        src.stop();
      } catch {
        /* ended */
      }
    });
    return;
  }
  if (midi === 38 || midi === 40) {
    const src = audio.createBufferSource();
    src.buffer = noise;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.18 * vel, when);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.16);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(music);
    src.start(when);
    src.stop(when + 0.18);
    const osc = audio.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(190, when);
    osc.frequency.exponentialRampToValueAtTime(120, when + 0.08);
    const og = audio.createGain();
    og.gain.setValueAtTime(0.12 * vel, when);
    og.gain.exponentialRampToValueAtTime(0.0001, when + 0.1);
    osc.connect(og);
    og.connect(music);
    osc.start(when);
    osc.stop(when + 0.12);
    voices.push(() => {
      try {
        src.stop();
        osc.stop();
      } catch {
        /* ended */
      }
    });
    return;
  }
  const osc = audio.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(148, when);
  osc.frequency.exponentialRampToValueAtTime(46, when + 0.12);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.42 * vel, when);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.2);
  osc.connect(gain);
  gain.connect(music);
  osc.start(when);
  osc.stop(when + 0.22);
  voices.push(() => {
    try {
      osc.stop();
    } catch {
      /* ended */
    }
  });
}

function scheduleMidi(fromSec: number) {
  if (!ctx || !song || !music) return;
  stopVoices();
  const audio = ctx;
  const key = state().keyShift;
  const speed = ratio();
  const now = audio.currentTime;
  for (const note of song.notes) {
    const noteSec = beatToSec(song, note.beat);
    const endSec = beatToSec(song, note.beat + note.dur);
    if (endSec < fromSec - 0.02) continue;
    const when = originCtx + (noteSec - originSongSec) / speed;
    const dur = Math.max(0.05, (endSec - noteSec) / speed);
    const start = Math.max(when, now);
    const remain = dur - Math.max(0, now - when);
    if (remain <= 0.02) continue;
    const midi = note.ch === 9 ? note.midi : note.midi + key;
    trigger(audio, midi, start, remain, note.vel, note.ch, note.melody);
  }
}

function finishIfNeeded(sec: number, total: number) {
  if (finishing || total <= 0.2) return;
  if (sec < total - 0.12) return;
  finishing = true;
  const queued = state().queue;
  if (queued.length) {
    const [next, ...rest] = queued;
    publish({ queue: rest, scoreOpen: false });
    if (next) void playTrack(next);
    return;
  }
  stopInternals(false);
  fanfare();
  publish({ playing: false, paused: false, scoreOpen: true, timeSec: total, lyricPct: 1, tune: "idle" });
}

function fanfare() {
  if (!ctx) return;
  const now = ctx.currentTime + 0.02;
  [72, 76, 79, 84].forEach((midi, index) => trigger(ctx!, midi, now + index * 0.09, 0.22, 90, 2, true));
}

function loop() {
  raf = requestAnimationFrame(loop);
  if (!ctx) return;
  const nowMs = performance.now();
  if (nowMs - lastUi < 90) return;
  lastUi = nowMs;
  const total = state().durSec || 1;
  let sec = 0;
  if (mode === "video" && videoEl) sec = videoEl.currentTime || 0;
  else sec = songSeconds();
  if (mode === "audio" && buffer) {
    /* playbackRate already includes tempo; detune is key. songSeconds uses playbackRate. */
  }
  const beat = song ? secToBeat(song, Math.max(0, sec)) : 0;
  let lyric = state().lyric;
  let lyricNext = state().lyricNext;
  let lyricPrev = state().lyricPrev;
  let lyricPct = 0;
  if (song && song.lyrics.length) {
    let index = 0;
    for (let i = 0; i < song.lyrics.length; i++) if (song.lyrics[i]!.beat <= beat + 0.02) index = i;
    const line = song.lyrics[index]!;
    const next = song.lyrics[index + 1];
    const prev = song.lyrics[index - 1];
    lyric = line.text;
    lyricNext = next?.text ?? "";
    lyricPrev = prev?.text ?? "";
    const endBeat = next ? next.beat : song.beats;
    lyricPct = Math.max(0, Math.min(1, (beat - line.beat) / Math.max(0.2, endBeat - line.beat)));
  } else if (mode !== "midi") {
    lyricPct = Math.max(0, Math.min(1, sec / total));
  }
  let tune = lastTune;
  let level = state().micLevel;
  const meter = state().meter.slice();
  if (analyser && state().micOn) {
    const bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(bins);
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      const slice = bins.slice(i * 8, i * 8 + 8);
      const avg = slice.reduce((acc, value) => acc + value, 0) / slice.length / 255;
      meter[i] = avg;
      sum += avg;
    }
    level = Math.min(1, sum / 5);
    const wave = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(wave);
    const detected = detectPitch(wave, ctx.sampleRate);
    const targetMidi = song ? activeMelody(song, beat) : null;
    if (detected > 0 && targetMidi != null) {
      const expected = 440 * 2 ** ((targetMidi + state().keyShift - 69) / 12);
      const cents = Math.abs(1200 * Math.log2(detected / expected));
      tune = cents < 55 ? "hit" : cents < 110 ? "close" : "miss";
    } else if (detected > 0) tune = "close";
    else tune = level > 0.08 ? "miss" : "idle";
    lastTune = tune;
  }
  const rolling = mode !== "idle" && !state().paused;
  if (!rolling) {
    publish({ tune: state().micOn ? tune : "idle", micLevel: level, meter });
    return;
  }
  const delta = Math.min(0.2, Math.max(0, ctx.currentTime - scoreAnchor));
  scoreAnchor = ctx.currentTime;
  let score = state().score;
  if (delta > 0) {
    score += delta * 820;
    if (tune === "hit") score += delta * 2400;
    else if (tune === "close") score += delta * 1100;
  }
  publish({
    timeSec: Math.max(0, sec),
    lyric,
    lyricNext,
    lyricPrev,
    lyricPct,
    tune: state().micOn ? tune : "idle",
    micLevel: level,
    meter,
    score: Math.round(score),
  });
  finishIfNeeded(sec, total);
}

function detectPitch(buf: Float32Array, sampleRate: number): number {
  const size = buf.length;
  let rms = 0;
  for (let i = 0; i < size; i++) rms += buf[i]! * buf[i]!;
  rms = Math.sqrt(rms / size);
  if (rms < 0.012) return -1;
  const maxLag = Math.floor(sampleRate / 70);
  const minLag = Math.floor(sampleRate / 880);
  let best = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < size - lag; i += 2) corr += buf[i]! * buf[i + lag]!;
    if (corr > bestCorr) {
      bestCorr = corr;
      best = lag;
    }
  }
  if (best < 0) return -1;
  return sampleRate / best;
}

function ensureLoop() {
  if (!raf) raf = requestAnimationFrame(loop);
}

async function startMidi(track: Track, parsed: MidiSong) {
  const audio = await ensure();
  clearMedia();
  mode = "midi";
  song = parsed;
  const total = durationSec(parsed);
  publish({
    currentId: track.id,
    playing: true,
    paused: false,
    videoOn: false,
    baseBpm: songBpm(parsed),
    durSec: total,
    timeSec: 0,
    lyric: parsed.lyrics[0]?.text || track.title,
    lyricNext: parsed.lyrics[1]?.text || "",
    lyricPrev: "",
    lyricPct: 0,
    tune: "idle",
    notice: "",
  });
  finishing = false;
  armClock(0);
  scheduleMidi(0);
  scoreAnchor = audio.currentTime;
  ensureLoop();
}

async function startAudio(track: Track, data: ArrayBuffer) {
  const audio = await ensure();
  clearMedia();
  mode = "audio";
  const decoded = await audio.decodeAudioData(data.slice(0));
  buffer = decoded;
  publish({
    currentId: track.id,
    playing: true,
    paused: false,
    videoOn: false,
    baseBpm: Math.round(100 * ratio()) ? 100 : 100,
    durSec: decoded.duration,
    timeSec: 0,
    lyric: track.title,
    lyricNext: track.artist,
    lyricPrev: "Audio track",
    lyricPct: 0,
    tune: "idle",
  });
  // Keep a friendly BPM base of 100 so the booth tempo slider stays musical for audio files.
  publish({ baseBpm: 100 });
  finishing = false;
  armClock(0);
  spawnBuffer(0);
  scoreAnchor = audio.currentTime;
  ensureLoop();
}

function spawnBuffer(offset: number) {
  if (!ctx || !buffer || !music) return;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = ratio();
  src.detune.value = state().keyShift * 100;
  src.connect(music);
  const startAt = Math.max(0, Math.min(offset, Math.max(0, buffer.duration - 0.05)));
  const token = ++generation;
  src.onended = () => {
    if (token !== generation) return;
    if (state().paused) return;
    finishIfNeeded(buffer?.duration ?? 0, buffer?.duration ?? 0);
  };
  src.start(0, startAt);
  bufferSrc = src;
  originCtx = ctx.currentTime;
  originSongSec = startAt;
}

async function startVideo(track: Track, file: Blob) {
  await ensure();
  clearMedia();
  if (!videoEl) throw new Error("Video stage is not ready");
  mode = "video";
  videoUrl = URL.createObjectURL(file);
  videoEl.src = videoUrl;
  videoEl.preservesPitch = state().keyShift === 0;
  videoEl.playbackRate = state().keyShift === 0 ? ratio() : ratio() * 2 ** (state().keyShift / 12);
  publish({
    currentId: track.id,
    playing: true,
    paused: false,
    videoOn: true,
    baseBpm: 100,
    durSec: 0,
    timeSec: 0,
    lyric: track.title,
    lyricNext: track.artist,
    lyricPrev: "Video",
    lyricPct: 0,
  });
  await videoEl.play();
  const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : 0;
  publish({ durSec: duration });
  finishing = false;
  videoEl.onended = () => finishIfNeeded(videoEl?.duration ?? 1, videoEl?.duration ?? 1);
  scoreAnchor = ctx?.currentTime ?? 0;
  ensureLoop();
}

function applyTransportToLive() {
  applyMix();
  if (mode === "midi" && song && ctx && !state().paused) {
    const sec = songSeconds();
    armClock(sec);
    scheduleMidi(sec);
  } else if (mode === "audio" && buffer && bufferSrc && ctx && !state().paused) {
    const sec = originSongSec + (ctx.currentTime - originCtx) * (bufferSrc.playbackRate.value || ratio());
    try {
      bufferSrc.stop();
    } catch {
      /* swap */
    }
    spawnBuffer(sec);
  } else if (mode === "video" && videoEl) {
    const shift = state().keyShift;
    videoEl.preservesPitch = shift === 0;
    videoEl.playbackRate = shift === 0 ? ratio() : ratio() * 2 ** (shift / 12);
  }
}

export async function playTrack(track: Track) {
  try {
    publish({ notice: "", scoreOpen: false });
    if (track.origin === "demo" && track.kind === "midi") {
      const parsed = demoSong(track.code);
      if (!parsed) throw new Error("Missing demo arrangement");
      await startMidi(track, parsed);
      return;
    }
    const blob = await blobForTrack(track);
    if (track.kind === "midi") {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      await startMidi(track, parseMidi(bytes));
      return;
    }
    if (track.kind === "audio") {
      await startAudio(track, await blob.arrayBuffer());
      return;
    }
    await startVideo(track, blob);
  } catch (error) {
    publish({ notice: error instanceof Error ? error.message : "Could not play that song", playing: false });
  }
}

function stopInternals(resetScoreCard: boolean) {
  const total = state().durSec;
  clearMedia();
  pausedHold = 0;
  publish({
    playing: false,
    paused: false,
    videoOn: false,
    tune: "idle",
    micLevel: 0,
    timeSec: 0,
    lyricPct: 0,
    scoreOpen: resetScoreCard ? state().scoreOpen : false,
    durSec: total,
  });
}

export async function togglePlay() {
  const snap = state();
  if (!snap.currentId) {
    const next = snap.queue[0] ?? snap.tracks[0];
    if (next) await playTrack(next);
    return;
  }
  if (!snap.playing) {
    const track = snap.tracks.find((item) => item.id === snap.currentId) ?? snap.queue[0];
    if (track) await playTrack(track);
    return;
  }
  if (mode === "video" && videoEl) {
    if (snap.paused) {
      await videoEl.play();
      publish({ paused: false });
    } else {
      videoEl.pause();
      publish({ paused: true });
    }
    return;
  }
  if (!ctx) return;
  if (snap.paused) {
    pausedHold = originSongSec;
    await ctx.resume();
    if (mode === "audio") spawnBuffer(pausedHold);
    if (mode === "midi") {
      armClock(pausedHold);
      scheduleMidi(pausedHold);
    }
    publish({ paused: false });
    ensureLoop();
    return;
  }
  pausedHold = songSeconds();
  if (mode === "audio" && bufferSrc) {
    generation++;
    try {
      bufferSrc.stop();
    } catch {
      /* pause */
    }
  }
  stopVoices();
  await ctx.suspend();
  publish({ paused: true });
}

export async function stopPlayback() {
  if (ctx && ctx.state === "suspended") await ctx.resume();
  stopInternals(false);
  const current = state().tracks.find((track) => track.id === state().currentId);
  if (current) {
    publish({
      lyric: current.kind === "midi" ? state().lyric : current.title,
      timeSec: 0,
      lyricPct: 0,
    });
  }
}

export async function playNext() {
  const snap = state();
  if (snap.queue.length) {
    const [next, ...rest] = snap.queue;
    publish({ queue: rest });
    if (next) await playTrack(next);
    return;
  }
  const index = snap.tracks.findIndex((track) => track.id === snap.currentId);
  const next = snap.tracks[index + 1] ?? snap.tracks[0];
  if (next) await playTrack(next);
}

export async function playPrev() {
  const snap = state();
  const index = snap.tracks.findIndex((track) => track.id === snap.currentId);
  const prev = snap.tracks[index - 1] ?? snap.tracks[snap.tracks.length - 1];
  if (prev) await playTrack(prev);
}

export function setKey(value: number) {
  const keyShift = Math.max(-6, Math.min(6, Math.round(value)));
  publish({ keyShift });
  applyTransportToLive();
}

export function setTempoRatio(tempoRatio: number) {
  publish({ tempoRatio: Math.max(0.7, Math.min(1.35, tempoRatio)) });
  applyTransportToLive();
}

export function setMicVol(micVol: number) {
  publish({ micVol });
  applyMix();
}

export function setEcho(echo: number) {
  publish({ echo });
  applyMix();
}

export async function toggleMic() {
  const snap = state();
  if (snap.micOn) {
    micStream?.getTracks().forEach((track) => track.stop());
    micStream = null;
    micSource?.disconnect();
    micSource = null;
    publish({ micOn: false, tune: "idle", micLevel: 0 });
    applyMix();
    return;
  }
  try {
    await ensure();
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
    });
    micSource?.disconnect();
    micSource = ctx!.createMediaStreamSource(micStream);
    micSource.connect(micGain!);
    publish({ micOn: true, notice: "Mic live. Headphones keep the echo from feeding back." });
    applyMix();
    ensureLoop();
  } catch {
    publish({ notice: "Microphone permission was blocked.", micOn: false });
  }
}

export function toggleEcho() {
  publish({ echoOn: !state().echoOn });
  applyMix();
}

export function nudgeBpm(delta: number) {
  const snap = state();
  const base = snap.baseBpm || 100;
  const next = Math.round(base * snap.tempoRatio + delta);
  setTempoRatio(next / base);
}

export function displayedBpm() {
  const snap = state();
  return Math.round((snap.baseBpm || 100) * snap.tempoRatio);
}
