import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as Check, _ as ListMusic, b as FolderSync, c as Sparkles, d as Search, f as Play, g as MicOff, h as Mic, i as Tv, l as SkipForward, m as Music2, n as Waves, o as Star, p as Pause, r as UserRound, s as Square, t as X, u as SkipBack, v as Keyboard, x as Delete, y as Inbox } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CYn3zUCA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function expand(spec) {
	const notes = [];
	const lyrics = [];
	const barCount = spec.bars.length;
	const beats = barCount * 4;
	for (let bar = 0; bar < barCount; bar++) {
		const [root, minor] = spec.bars[bar];
		const third = root + (minor ? 3 : 4);
		const fifth = root + 7;
		for (const pitch of [
			root + 12,
			third + 12,
			fifth + 12
		]) notes.push({
			beat: bar * 4,
			dur: 3.5,
			midi: pitch,
			vel: 46,
			ch: 0,
			melody: false
		});
		for (let step = 0; step < 4; step++) {
			const beat = bar * 4 + step;
			const bass = step === 1 ? fifth : step === 3 ? root + 12 : root;
			notes.push({
				beat,
				dur: .42,
				midi: bass,
				vel: 80,
				ch: 1,
				melody: false
			});
			notes.push({
				beat,
				dur: .08,
				midi: 42,
				vel: step % 2 ? 36 : 52,
				ch: 9,
				melody: false
			});
			if (step === 0) notes.push({
				beat,
				dur: .18,
				midi: 36,
				vel: 104,
				ch: 9,
				melody: false
			});
			if (step === 2) notes.push({
				beat,
				dur: .16,
				midi: 36,
				vel: 72,
				ch: 9,
				melody: false
			});
			if (step === 1 || step === 3) notes.push({
				beat,
				dur: .16,
				midi: 38,
				vel: 90,
				ch: 9,
				melody: false
			});
			const mel = spec.melody[beat % spec.melody.length] ?? 0;
			if (mel > 0) notes.push({
				beat,
				dur: .88,
				midi: mel,
				vel: 108,
				ch: 2,
				melody: true
			});
		}
		const line = spec.lines[bar];
		if (line) lyrics.push({
			beat: bar * 4,
			text: line
		});
	}
	return {
		notes,
		lyrics,
		tempos: [{
			beat: 0,
			bpm: spec.bpm
		}],
		beats
	};
}
var LOOP = [
	[48, false],
	[53, false],
	[55, false],
	[57, true],
	[48, false],
	[41, false],
	[43, false],
	[45, true]
];
var SPECS = [
	{
		code: "000001",
		title: "Blue Horizon",
		artist: "May Lin",
		bpm: 100,
		bars: LOOP,
		melody: [
			76,
			79,
			81,
			79,
			77,
			76,
			74,
			72,
			74,
			77,
			76,
			74,
			72,
			74,
			76,
			79
		],
		lines: [
			"City lights along the water",
			"I keep your melody",
			"Every window hums the chorus",
			"Stay another beat with me",
			"Horizon turning silver",
			"The night is keeping time",
			"If you hear me, sing it louder",
			"This song was always mine"
		]
	},
	{
		code: "000002",
		title: "Summer Breeze",
		artist: "Kevin Brooks",
		bpm: 98,
		bars: LOOP,
		melody: [
			72,
			74,
			76,
			79,
			81,
			79,
			76,
			74,
			76,
			74,
			72,
			71,
			72,
			74,
			76,
			72
		],
		lines: [
			"Windows down on a quiet street",
			"Radio knows our names",
			"Summer leans against the evening",
			"Nothing here to explain",
			"Hold the note a little longer",
			"Let the chorus bloom",
			"We can leave the map unfinished",
			"Meet me in the room"
		]
	},
	{
		code: "000003",
		title: "Neon Lights",
		artist: "Aiko Tanaka",
		bpm: 112,
		bars: LOOP,
		melody: [
			79,
			81,
			84,
			81,
			79,
			77,
			76,
			74,
			76,
			79,
			81,
			79,
			77,
			76,
			74,
			72
		],
		lines: [
			"Neon writes your name in color",
			"On the rain-slick road",
			"I follow every changing signal",
			"Wherever the chorus goes",
			"Turn it up above the traffic",
			"Let the high note ring",
			"We were never background singers",
			"This is our opening"
		]
	},
	{
		code: "000004",
		title: "Moonlight Promise",
		artist: "Sarah Cole",
		bpm: 86,
		bars: LOOP,
		melody: [
			74,
			76,
			79,
			76,
			74,
			72,
			71,
			72,
			74,
			72,
			71,
			69,
			71,
			72,
			74,
			76
		],
		lines: [
			"Leave a light above the stair",
			"I remember how it felt",
			"Moonlight keeps a quiet promise",
			"Long after midnight bells",
			"If the words arrive too slowly",
			"Hum the line with me",
			"Some promises are melodies",
			"Soft enough to keep"
		]
	},
	{
		code: "000005",
		title: "City Dreams",
		artist: "Tom Reyes",
		bpm: 104,
		bars: LOOP,
		melody: [
			72,
			76,
			79,
			76,
			81,
			79,
			77,
			74,
			76,
			79,
			77,
			74,
			72,
			71,
			72,
			76
		],
		lines: [
			"Elevators full of strangers",
			"All of them humming",
			"City dreams in different keys",
			"Somehow still becoming",
			"Take the bridge and don't look down",
			"The skyline answers back",
			"Every dream deserves a chorus",
			"Yours is on this track"
		]
	},
	{
		code: "000006",
		title: "Starlight Memories",
		artist: "Jun Wei",
		bpm: 96,
		bars: LOOP,
		melody: [
			76,
			79,
			76,
			74,
			72,
			74,
			76,
			79,
			81,
			79,
			76,
			74,
			72,
			74,
			76,
			72
		],
		lines: [
			"夜色轻轻落在窗",
			"星河向我眨眼睛",
			"如果歌声还记得",
			"请你再靠近一点",
			"城市在远处发亮",
			"心跳跟着节拍走",
			"把未说完的句子",
			"唱进这一首星光"
		]
	},
	{
		code: "000007",
		title: "Harbor Echo",
		artist: "Lila Ortiz",
		bpm: 92,
		bars: LOOP,
		melody: [
			69,
			72,
			76,
			74,
			72,
			76,
			79,
			76,
			74,
			72,
			71,
			72,
			74,
			76,
			74,
			72
		],
		lines: [
			"Boats knock softly on the pier",
			"Echo answers twice",
			"I throw a line into the water",
			"It comes back as a voice",
			"Sing until the harbor listens",
			"Sing until it's clear",
			"Every echo finds a shoreline",
			"I am glad you're here"
		]
	},
	{
		code: "000008",
		title: "Paper Lanterns",
		artist: "Noah Vale",
		bpm: 108,
		bars: LOOP,
		melody: [
			81,
			79,
			76,
			79,
			77,
			74,
			76,
			72,
			74,
			76,
			79,
			81,
			79,
			76,
			74,
			72
		],
		lines: [
			"Paper lanterns leave the courtyard",
			"Small fires learning flight",
			"We wrote our wishes on the inside",
			"Then we let them night",
			"Don't chase them past the river",
			"Just keep the melody",
			"Some lights are only beautiful",
			"Because we set them free"
		]
	}
];
var SONGS = new Map(SPECS.map((spec) => [spec.code, expand(spec)]));
function demoSong(code) {
	return SONGS.get(code);
}
var demoTracks = SPECS.map((spec) => ({
	id: `demo:${spec.code}`,
	code: spec.code,
	title: spec.title,
	artist: spec.artist,
	kind: "midi",
	fileName: `${spec.code} – ${spec.title} – ${spec.artist}.mid`,
	origin: "demo",
	bytes: 2400
}));
var THEMES = [
	{
		id: "neon",
		label: "Neon",
		swatch: "#3ad7ff"
	},
	{
		id: "violet",
		label: "Violet",
		swatch: "#c084fc"
	},
	{
		id: "solar",
		label: "Solar",
		swatch: "#ffb020"
	},
	{
		id: "vercel",
		label: "Vercel",
		swatch: "#ededed"
	},
	{
		id: "rose",
		label: "Rose",
		swatch: "#ff4d8d"
	},
	{
		id: "emerald",
		label: "Emerald",
		swatch: "#2ee6a6"
	}
];
var BGVS = [
	{
		id: "city",
		label: "City Nights",
		hint: "Skyline glow, ambient city"
	},
	{
		id: "grid",
		label: "Neon Grid",
		hint: "Floor grid, stage depth"
	},
	{
		id: "stars",
		label: "Starlight",
		hint: "Slow star field"
	},
	{
		id: "ocean",
		label: "Harbor",
		hint: "Tide and horizon"
	},
	{
		id: "solar",
		label: "Solar Dawn",
		hint: "Warm horizon flare"
	},
	{
		id: "haze",
		label: "Stage Haze",
		hint: "Vertical light beams"
	}
];
var ACCEPT_EXT = [
	"mid",
	"midi",
	"kar",
	"mp3",
	"mpeg",
	"mpg",
	"mpe4",
	"mp4",
	"m4v",
	"m4a",
	"aac",
	"wav",
	"webm",
	"ogg"
];
function asDir(handle) {
	return handle;
}
var DB_NAME = "mykaraoke-v3";
var HANDLE_KEY = "library-root";
var sessionBlobs = /* @__PURE__ */ new Map();
var folderHandle = null;
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
			if (!db.objectStoreNames.contains("handles")) db.createObjectStore("handles");
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? /* @__PURE__ */ new Error("Storage unavailable"));
	});
}
async function idbGet(store, key) {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const request = db.transaction(store, "readonly").objectStore(store).get(key);
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}
async function idbPut(store, key, value) {
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readwrite");
		tx.objectStore(store).put(value, key);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
async function idbAll() {
	const db = await openDb();
	return new Promise((resolve, reject) => {
		const tx = db.transaction("blobs", "readonly");
		const request = tx.objectStore("blobs").getAll();
		const keys = tx.objectStore("blobs").getAllKeys();
		let rows = [];
		let ids = [];
		request.onsuccess = () => {
			rows = request.result;
		};
		keys.onsuccess = () => {
			ids = keys.result;
		};
		tx.oncomplete = () => {
			resolve(rows.map((row, index) => ({
				key: String(ids[index] ?? index),
				blob: row.blob,
				name: row.name
			})));
		};
		tx.onerror = () => reject(tx.error);
	});
}
function kindForName(name) {
	const ext = name.split(".").pop()?.toLowerCase() ?? "";
	if ([
		"mid",
		"midi",
		"kar"
	].includes(ext)) return "midi";
	if ([
		"mp3",
		"mpeg",
		"mpg",
		"m4a",
		"aac",
		"wav",
		"ogg"
	].includes(ext)) return "audio";
	if ([
		"mp4",
		"m4v",
		"mpe4",
		"webm",
		"mov"
	].includes(ext)) return "video";
	return null;
}
function parseSongName(fileName, index) {
	const kind = kindForName(fileName);
	if (!kind) return null;
	const base = fileName.replace(/\.[^.]+$/, "");
	let parts = base.split(/\s+[–—-]\s+/).map((part) => part.trim()).filter(Boolean);
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
	if (!code) code = String(1e5 + index).padStart(6, "0");
	return {
		code,
		title,
		artist,
		fileName,
		kind
	};
}
function toTrack(fileName, index, origin, extra) {
	const parsed = parseSongName(fileName, index);
	if (!parsed) return null;
	return {
		id: origin === "blob" ? `blob:${extra.blobKey}` : `fs:${extra.relPath ?? fileName}`,
		...parsed,
		origin,
		...extra
	};
}
async function loadStoredTracks() {
	try {
		return (await idbAll()).map((row, index) => {
			sessionBlobs.set(row.key, row.blob);
			return toTrack(row.name, index, "blob", {
				blobKey: row.key,
				bytes: row.blob.size
			});
		}).filter((track) => Boolean(track));
	} catch {
		return [];
	}
}
async function fileFromPath(root, relPath) {
	const parts = relPath.split("/").filter(Boolean);
	let dir = asDir(root);
	for (let i = 0; i < parts.length - 1; i++) dir = asDir(await dir.getDirectoryHandle(parts[i]));
	return (await dir.getFileHandle(parts[parts.length - 1])).getFile();
}
async function walk(dir, prefix, depth, out) {
	if (out.length >= 1500 || depth > 3) return;
	for await (const entry of dir.values()) {
		if (out.length >= 1500) return;
		if (entry.kind === "file") {
			const file = entry.getFile ? await entry.getFile() : null;
			if (file && kindForName(file.name)) out.push({
				file,
				rel: prefix ? `${prefix}/${file.name}` : file.name
			});
		} else if (entry.kind === "directory") {
			const next = asDir(entry);
			const prefer = /^(songs|bgv|music|karaoke)$/i.test(next.name);
			if (depth === 0 && !prefer && out.length > 0) continue;
			await walk(next, prefix ? `${prefix}/${next.name}` : next.name, depth + 1, out);
			await new Promise((resolve) => setTimeout(resolve, 0));
		}
	}
}
async function scanHandle(root) {
	folderHandle = root;
	const found = [];
	const dir = asDir(root);
	try {
		await walk(asDir(await dir.getDirectoryHandle("songs")), "songs", 1, found);
	} catch {
		await walk(dir, "", 0, found);
	}
	return found.map((item, index) => toTrack(item.file.name, index, "folder", {
		relPath: item.rel,
		bytes: item.file.size
	})).filter((track) => Boolean(track)).sort((a, b) => a.code.localeCompare(b.code, void 0, { numeric: true }) || a.title.localeCompare(b.title));
}
async function restoreFolderTracks() {
	try {
		const handle = await idbGet("handles", HANDLE_KEY);
		if (!handle) return null;
		if (await asDir(handle).queryPermission({ mode: "read" }) !== "granted") return null;
		return scanHandle(handle);
	} catch {
		return null;
	}
}
async function pickFolder() {
	const picker = window.showDirectoryPicker;
	if (!picker) return null;
	const handle = await picker({ mode: "read" });
	await idbPut("handles", HANDLE_KEY, handle);
	const tracks = await scanHandle(handle);
	return {
		tracks,
		note: tracks.length ? `Storage synced · ${tracks.length.toLocaleString()} playable files kept on this device.` : "That folder has no .mid, .mp3, .mpeg, or .mp4 songs."
	};
}
async function importFiles(files) {
	const accepted = files.filter((file) => kindForName(file.name));
	const tracks = [];
	let stored = 0;
	let session = 0;
	for (let index = 0; index < accepted.length && tracks.length < 1500; index++) {
		const file = accepted[index];
		const key = `f-${Date.now().toString(36)}-${index}-${file.size}`;
		if (file.size <= 4e7 && stored < 80) {
			await idbPut("blobs", key, {
				name: file.name,
				blob: file
			});
			stored++;
		} else session++;
		sessionBlobs.set(key, file);
		const track = toTrack(file.name, index, "blob", {
			blobKey: key,
			bytes: file.size
		});
		if (track) tracks.push(track);
		if (index % 40 === 0) await new Promise((resolve) => setTimeout(resolve, 0));
	}
	const skipped = files.length - accepted.length;
	const parts = [`Added ${tracks.length.toLocaleString()} songs`];
	if (stored) parts.push(`${stored} saved for next visit`);
	if (session) parts.push(`${session} ready this session only`);
	if (skipped) parts.push(`${skipped} skipped (unsupported type)`);
	if (!tracks.length) parts[0] = `No playable files. Use ${ACCEPT_EXT.slice(0, 6).join(", ")}`;
	return {
		tracks,
		note: `${parts.join(" · ")}.`
	};
}
async function blobForTrack(track) {
	if (track.origin === "demo") throw new Error("Demo tracks are synthesized");
	if (track.blobKey) {
		const cached = sessionBlobs.get(track.blobKey);
		if (cached) return cached;
		const row = await idbGet("blobs", track.blobKey);
		if (row?.blob) {
			sessionBlobs.set(track.blobKey, row.blob);
			return row.blob;
		}
	}
	if (track.origin === "folder" && track.relPath && folderHandle) return fileFromPath(folderHandle, track.relPath);
	throw new Error("Song file is no longer available. Sync storage again.");
}
function formatBytes(bytes) {
	if (!bytes) return "";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}
function readVar(data, offset) {
	let value = 0;
	let o = offset;
	let b = 0;
	do {
		if (o >= data.length) break;
		b = data[o++];
		value = value << 7 | b & 127;
	} while (b & 128);
	return {
		value,
		next: o
	};
}
function ascii(data, offset, length) {
	let s = "";
	for (let i = 0; i < length; i++) s += String.fromCharCode(data[offset + i] ?? 0);
	return s;
}
function decodeText(bytes) {
	return new TextDecoder("utf-8", { fatal: false }).decode(bytes).replace(/\u0000/g, "");
}
function cleanPiece(raw) {
	const hard = /[\n\r]/.test(raw) || /^[\\/@]/.test(raw.trim());
	return {
		text: raw.replace(/[\n\r]+/g, " ").replace(/^[\s\\/@]+/, "").replace(/\s+/g, " ").trim(),
		hard
	};
}
function groupLyrics(raw, ppq) {
	const out = [];
	let buf = "";
	let beat = 0;
	let last = -99;
	const flush = () => {
		const text = buf.replace(/\s+/g, " ").trim();
		if (text) out.push({
			beat,
			text
		});
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
function markMelody(notes) {
	const buckets = /* @__PURE__ */ new Map();
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
function parseMidi(data) {
	if (data.length < 14 || ascii(data, 0, 4) !== "MThd") throw new Error("Not a MIDI file");
	const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
	const headerLength = view.getUint32(4);
	const tracks = view.getUint16(10);
	const division = view.getUint16(12);
	const ppq = division & 32768 ? 480 : division || 480;
	let offset = 8 + headerLength;
	const events = [];
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
			if (peek === 255) {
				const type = data[offset + 1] ?? 0;
				const len = readVar(data, offset + 2);
				offset = len.next;
				const payload = data.slice(offset, offset + len.value);
				offset += len.value;
				status = 0;
				if (type === 81 && payload.length >= 3) {
					const us = (payload[0] ?? 0) << 16 | (payload[1] ?? 0) << 8 | (payload[2] ?? 0);
					events.push({
						tick,
						kind: "tempo",
						bpm: us > 0 ? Math.round(6e7 / us) : 120
					});
				} else if (type === 1 || type === 5) {
					const text = decodeText(payload);
					if (text.trim()) events.push({
						tick,
						kind: "lyric",
						text
					});
				}
				continue;
			}
			if (peek === 240 || peek === 247) {
				const len = readVar(data, offset + 1);
				offset = len.next + len.value;
				status = 0;
				continue;
			}
			let running = false;
			if (peek & 128) {
				status = peek;
				offset++;
			} else running = true;
			if (!status || status < 128) continue;
			const hi = status & 240;
			const ch = status & 15;
			if (hi === 192 || hi === 208) {
				offset += 1;
				continue;
			}
			const d1 = running ? peek : data[offset++] ?? 0;
			if (running) offset++;
			const d2 = data[offset++] ?? 0;
			if (hi === 144) {
				if (d2 === 0) events.push({
					tick,
					kind: "off",
					ch,
					note: d1
				});
				else events.push({
					tick,
					kind: "on",
					ch,
					note: d1,
					vel: d2
				});
			} else if (hi === 128) events.push({
				tick,
				kind: "off",
				ch,
				note: d1
			});
		}
		offset = end;
	}
	const pending = /* @__PURE__ */ new Map();
	const notes = [];
	let maxTick = 0;
	const lyricRaw = [];
	const tempos = [];
	for (const event of events) {
		maxTick = Math.max(maxTick, event.tick);
		if (event.kind === "tempo") tempos.push({
			beat: event.tick / ppq,
			bpm: event.bpm
		});
		else if (event.kind === "lyric") lyricRaw.push({
			tick: event.tick,
			text: event.text
		});
		else if (event.kind === "on") pending.set(`${event.ch}:${event.note}`, {
			tick: event.tick,
			vel: event.vel
		});
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
				melody: false
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
			melody: false
		});
		maxTick = Math.max(maxTick, start.tick + ppq);
	}
	if (!notes.length) throw new Error("This MIDI has no notes");
	if (!tempos.length || tempos[0].beat > 0) tempos.unshift({
		beat: 0,
		bpm: tempos[0]?.bpm ?? 120
	});
	markMelody(notes);
	return {
		notes,
		lyrics: groupLyrics(lyricRaw, ppq),
		tempos,
		beats: Math.max(4, maxTick / ppq)
	};
}
function songBpm(song) {
	return song.tempos[0]?.bpm || 120;
}
function beatToSec(song, beat) {
	const marks = song.tempos.length ? song.tempos : [{
		beat: 0,
		bpm: 120
	}];
	let sec = 0;
	for (let i = 0; i < marks.length; i++) {
		const start = marks[i].beat;
		const bpm = marks[i].bpm || 120;
		const end = i + 1 < marks.length ? marks[i + 1].beat : Number.POSITIVE_INFINITY;
		if (beat <= start) break;
		const slice = Math.min(beat, end) - start;
		sec += slice * 60 / bpm;
		if (beat <= end) break;
	}
	return sec;
}
function secToBeat(song, sec) {
	const marks = song.tempos.length ? song.tempos : [{
		beat: 0,
		bpm: 120
	}];
	let acc = 0;
	for (let i = 0; i < marks.length; i++) {
		const start = marks[i].beat;
		const bpm = marks[i].bpm || 120;
		const end = i + 1 < marks.length ? marks[i + 1].beat : Number.POSITIVE_INFINITY;
		const span = end - start;
		const spanSec = Number.isFinite(span) ? span * 60 / bpm : Number.POSITIVE_INFINITY;
		if (acc + spanSec >= sec || !Number.isFinite(end)) return start + (sec - acc) * bpm / 60;
		acc += spanSec;
	}
	return marks[marks.length - 1]?.beat ?? 0;
}
function durationSec(song) {
	return beatToSec(song, song.beats);
}
function activeMelody(song, beat) {
	let found = null;
	for (const note of song.notes) {
		if (!note.melody) continue;
		if (beat >= note.beat && beat < note.beat + Math.max(.2, note.dur)) found = note.midi;
	}
	return found;
}
var SETTINGS_KEY = "mykaraoke-settings";
var defaultSettings = {
	theme: "neon",
	singer: "Alex Chen",
	keyShift: 2,
	tempoRatio: 98 / 96,
	micVol: 75,
	echo: 32,
	echoOn: true,
	bgv: "city"
};
function readSettings() {
	if (typeof localStorage === "undefined") return defaultSettings;
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (!raw) return defaultSettings;
		const parsed = JSON.parse(raw);
		return {
			...defaultSettings,
			...parsed
		};
	} catch {
		return defaultSettings;
	}
}
var useBooth = create((set) => ({
	tracks: demoTracks,
	query: "",
	kindFilter: "all",
	queue: demoTracks.slice(0, 5),
	currentId: demoTracks[5]?.id ?? demoTracks[0].id,
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
	durSec: durationSec(demoSong("000006") ?? {
		notes: [],
		lyrics: [],
		tempos: [{
			beat: 0,
			bpm: 96
		}],
		beats: 32
	}),
	tab: "stage",
	notice: "",
	scoreOpen: false,
	syncing: false,
	storageLabel: "House band ready",
	code: "",
	remoteOpen: false,
	meter: [
		.2,
		.35,
		.15,
		.4,
		.25,
		.1,
		.3,
		.2
	],
	videoOn: false,
	editingSinger: false,
	...defaultSettings,
	patch: (partial) => set(partial)
}));
var hooked = false;
function bootSettings() {
	const settings = readSettings();
	useBooth.setState(settings);
	document.documentElement.dataset.theme = settings.theme;
	if (hooked) return;
	hooked = true;
	useBooth.subscribe((state, prev) => {
		if (state.theme !== prev.theme) document.documentElement.dataset.theme = state.theme;
		if (!(state.theme !== prev.theme || state.singer !== prev.singer || state.keyShift !== prev.keyShift || state.tempoRatio !== prev.tempoRatio || state.micVol !== prev.micVol || state.echo !== prev.echo || state.echoOn !== prev.echoOn || state.bgv !== prev.bgv)) return;
		const next = {
			theme: state.theme,
			singer: state.singer,
			keyShift: state.keyShift,
			tempoRatio: state.tempoRatio,
			micVol: state.micVol,
			echo: state.echo,
			echoOn: state.echoOn,
			bgv: state.bgv
		};
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
	});
}
function mergeTracks(blobs, folder) {
	const map = /* @__PURE__ */ new Map();
	for (const track of demoTracks) map.set(track.id, track);
	for (const track of blobs) map.set(track.id, track);
	for (const track of folder) map.set(track.id, track);
	const tracks = [...map.values()].sort((a, b) => a.code.localeCompare(b.code, void 0, { numeric: true }) || a.title.localeCompare(b.title));
	useBooth.setState({
		tracks,
		storageLabel: folder.length ? `Folder synced · ${folder.length.toLocaleString()} files` : blobs.length ? `Saved on this device · ${blobs.length.toLocaleString()} files` : "House band ready"
	});
}
function findByCode(tracks, entry) {
	const digits = entry.replace(/\D/g, "");
	if (!digits) return void 0;
	const padded = digits.padStart(6, "0");
	return tracks.find((track) => track.code === padded || track.code === digits || track.code.replace(/^0+/, "") === digits.replace(/^0+/, ""));
}
var ctx = null;
var music = null;
var micGain = null;
var echoWet = null;
var echoFb = null;
var analyser = null;
var micStream = null;
var noise = null;
var song = null;
var buffer = null;
var bufferSrc = null;
var videoEl = null;
var videoUrl = "";
var generation = 0;
var voices = [];
var raf = 0;
var originCtx = 0;
var originSongSec = 0;
var pausedHold = 0;
var scoreAnchor = 0;
var lastTune = "idle";
var mode = "idle";
var micSource = null;
var finishing = false;
var lastUi = 0;
function state() {
	return useBooth.getState();
}
function publish(partial) {
	useBooth.setState(partial);
}
async function ensure() {
	if (!ctx) {
		ctx = new (window.AudioContext || window.webkitAudioContext)();
		const comp = ctx.createDynamicsCompressor();
		comp.threshold.value = -16;
		comp.knee.value = 20;
		comp.ratio.value = 3.2;
		comp.attack.value = .006;
		comp.release.value = .18;
		music = ctx.createGain();
		music.gain.value = .85;
		micGain = ctx.createGain();
		micGain.gain.value = 0;
		const hip = ctx.createBiquadFilter();
		hip.type = "highpass";
		hip.frequency.value = 90;
		analyser = ctx.createAnalyser();
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = .75;
		const delay = ctx.createDelay(1.2);
		delay.delayTime.value = .28;
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
	if (echoWet) echoWet.gain.value = snap.echoOn ? snap.echo / 100 * .75 : 0;
	if (echoFb) echoFb.gain.value = snap.echoOn ? Math.min(.48, snap.echo / 100 * .5) : 0;
}
function attachVideo(node) {
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
		} catch {}
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
function songSeconds() {
	if (!ctx || mode === "idle") return pausedHold;
	if (state().paused) return pausedHold;
	if (mode === "video" && videoEl) return videoEl.currentTime || 0;
	return originSongSec + (ctx.currentTime - originCtx) * (mode === "audio" ? bufferSrc?.playbackRate.value || ratio() : ratio());
}
function armClock(songSec) {
	if (!ctx) return;
	originCtx = ctx.currentTime;
	originSongSec = songSec;
	scoreAnchor = ctx.currentTime;
}
function trigger(audio, midi, when, dur, vel, ch, melody) {
	if (!music) return;
	const peakBase = melody ? .22 : ch === 1 ? .16 : .055;
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
	const peak = Math.max(.001, peakBase * (vel / 127));
	gain.gain.setValueAtTime(1e-4, when);
	gain.gain.exponentialRampToValueAtTime(peak, when + .018);
	gain.gain.exponentialRampToValueAtTime(1e-4, when + Math.max(.06, dur));
	osc.connect(filter);
	osc2.connect(filter);
	filter.connect(gain);
	gain.connect(music);
	osc.start(when);
	osc2.start(when);
	const stopAt = when + Math.max(.08, dur) + .02;
	osc.stop(stopAt);
	osc2.stop(stopAt);
	voices.push(() => {
		const now = audio.currentTime;
		gain.gain.cancelScheduledValues(now);
		gain.gain.setTargetAtTime(1e-4, now, .012);
		try {
			osc.stop(now + .03);
			osc2.stop(now + .03);
		} catch {}
	});
}
function drum(audio, midi, when, vel) {
	if (!music || !noise) return;
	if (midi === 42 || midi === 44 || midi === 46) {
		const src = audio.createBufferSource();
		src.buffer = noise;
		const filter = audio.createBiquadFilter();
		filter.type = "highpass";
		filter.frequency.value = 7e3;
		const gain = audio.createGain();
		gain.gain.setValueAtTime(.05 * vel, when);
		gain.gain.exponentialRampToValueAtTime(1e-4, when + .045);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(music);
		src.start(when);
		src.stop(when + .05);
		voices.push(() => {
			try {
				src.stop();
			} catch {}
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
		gain.gain.setValueAtTime(.18 * vel, when);
		gain.gain.exponentialRampToValueAtTime(1e-4, when + .16);
		src.connect(filter);
		filter.connect(gain);
		gain.connect(music);
		src.start(when);
		src.stop(when + .18);
		const osc = audio.createOscillator();
		osc.type = "triangle";
		osc.frequency.setValueAtTime(190, when);
		osc.frequency.exponentialRampToValueAtTime(120, when + .08);
		const og = audio.createGain();
		og.gain.setValueAtTime(.12 * vel, when);
		og.gain.exponentialRampToValueAtTime(1e-4, when + .1);
		osc.connect(og);
		og.connect(music);
		osc.start(when);
		osc.stop(when + .12);
		voices.push(() => {
			try {
				src.stop();
				osc.stop();
			} catch {}
		});
		return;
	}
	const osc = audio.createOscillator();
	osc.type = "sine";
	osc.frequency.setValueAtTime(148, when);
	osc.frequency.exponentialRampToValueAtTime(46, when + .12);
	const gain = audio.createGain();
	gain.gain.setValueAtTime(.42 * vel, when);
	gain.gain.exponentialRampToValueAtTime(1e-4, when + .2);
	osc.connect(gain);
	gain.connect(music);
	osc.start(when);
	osc.stop(when + .22);
	voices.push(() => {
		try {
			osc.stop();
		} catch {}
	});
}
function scheduleMidi(fromSec) {
	if (!ctx || !song || !music) return;
	stopVoices();
	const audio = ctx;
	const key = state().keyShift;
	const speed = ratio();
	const now = audio.currentTime;
	for (const note of song.notes) {
		const noteSec = beatToSec(song, note.beat);
		const endSec = beatToSec(song, note.beat + note.dur);
		if (endSec < fromSec - .02) continue;
		const when = originCtx + (noteSec - originSongSec) / speed;
		const dur = Math.max(.05, (endSec - noteSec) / speed);
		const start = Math.max(when, now);
		const remain = dur - Math.max(0, now - when);
		if (remain <= .02) continue;
		trigger(audio, note.ch === 9 ? note.midi : note.midi + key, start, remain, note.vel, note.ch, note.melody);
	}
}
function finishIfNeeded(sec, total) {
	if (finishing || total <= .2) return;
	if (sec < total - .12) return;
	finishing = true;
	const queued = state().queue;
	if (queued.length) {
		const [next, ...rest] = queued;
		publish({
			queue: rest,
			scoreOpen: false
		});
		if (next) playTrack(next);
		return;
	}
	stopInternals(false);
	fanfare();
	publish({
		playing: false,
		paused: false,
		scoreOpen: true,
		timeSec: total,
		lyricPct: 1,
		tune: "idle"
	});
}
function fanfare() {
	if (!ctx) return;
	const now = ctx.currentTime + .02;
	[
		72,
		76,
		79,
		84
	].forEach((midi, index) => trigger(ctx, midi, now + index * .09, .22, 90, 2, true));
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
	if (mode === "audio" && buffer) {}
	const beat = song ? secToBeat(song, Math.max(0, sec)) : 0;
	let lyric = state().lyric;
	let lyricNext = state().lyricNext;
	let lyricPrev = state().lyricPrev;
	let lyricPct = 0;
	if (song && song.lyrics.length) {
		let index = 0;
		for (let i = 0; i < song.lyrics.length; i++) if (song.lyrics[i].beat <= beat + .02) index = i;
		const line = song.lyrics[index];
		const next = song.lyrics[index + 1];
		const prev = song.lyrics[index - 1];
		lyric = line.text;
		lyricNext = next?.text ?? "";
		lyricPrev = prev?.text ?? "";
		const endBeat = next ? next.beat : song.beats;
		lyricPct = Math.max(0, Math.min(1, (beat - line.beat) / Math.max(.2, endBeat - line.beat)));
	} else if (mode !== "midi") lyricPct = Math.max(0, Math.min(1, sec / total));
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
		else tune = level > .08 ? "miss" : "idle";
		lastTune = tune;
	}
	if (!(mode !== "idle" && !state().paused)) {
		publish({
			tune: state().micOn ? tune : "idle",
			micLevel: level,
			meter
		});
		return;
	}
	const delta = Math.min(.2, Math.max(0, ctx.currentTime - scoreAnchor));
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
		score: Math.round(score)
	});
	finishIfNeeded(sec, total);
}
function detectPitch(buf, sampleRate) {
	const size = buf.length;
	let rms = 0;
	for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
	rms = Math.sqrt(rms / size);
	if (rms < .012) return -1;
	const maxLag = Math.floor(sampleRate / 70);
	const minLag = Math.floor(sampleRate / 880);
	let best = -1;
	let bestCorr = 0;
	for (let lag = minLag; lag <= maxLag; lag++) {
		let corr = 0;
		for (let i = 0; i < size - lag; i += 2) corr += buf[i] * buf[i + lag];
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
async function startMidi(track, parsed) {
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
		notice: ""
	});
	finishing = false;
	armClock(0);
	scheduleMidi(0);
	scoreAnchor = audio.currentTime;
	ensureLoop();
}
async function startAudio(track, data) {
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
		tune: "idle"
	});
	publish({ baseBpm: 100 });
	finishing = false;
	armClock(0);
	spawnBuffer(0);
	scoreAnchor = audio.currentTime;
	ensureLoop();
}
function spawnBuffer(offset) {
	if (!ctx || !buffer || !music) return;
	const src = ctx.createBufferSource();
	src.buffer = buffer;
	src.playbackRate.value = ratio();
	src.detune.value = state().keyShift * 100;
	src.connect(music);
	const startAt = Math.max(0, Math.min(offset, Math.max(0, buffer.duration - .05)));
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
async function startVideo(track, file) {
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
		lyricPct: 0
	});
	await videoEl.play();
	publish({ durSec: Number.isFinite(videoEl.duration) ? videoEl.duration : 0 });
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
		} catch {}
		spawnBuffer(sec);
	} else if (mode === "video" && videoEl) {
		const shift = state().keyShift;
		videoEl.preservesPitch = shift === 0;
		videoEl.playbackRate = shift === 0 ? ratio() : ratio() * 2 ** (shift / 12);
	}
}
async function playTrack(track) {
	try {
		publish({
			notice: "",
			scoreOpen: false
		});
		if (track.origin === "demo" && track.kind === "midi") {
			const parsed = demoSong(track.code);
			if (!parsed) throw new Error("Missing demo arrangement");
			await startMidi(track, parsed);
			return;
		}
		const blob = await blobForTrack(track);
		if (track.kind === "midi") {
			await startMidi(track, parseMidi(new Uint8Array(await blob.arrayBuffer())));
			return;
		}
		if (track.kind === "audio") {
			await startAudio(track, await blob.arrayBuffer());
			return;
		}
		await startVideo(track, blob);
	} catch (error) {
		publish({
			notice: error instanceof Error ? error.message : "Could not play that song",
			playing: false
		});
	}
}
function stopInternals(resetScoreCard) {
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
		durSec: total
	});
}
async function togglePlay() {
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
		} catch {}
	}
	stopVoices();
	await ctx.suspend();
	publish({ paused: true });
}
async function stopPlayback() {
	if (ctx && ctx.state === "suspended") await ctx.resume();
	stopInternals(false);
	const current = state().tracks.find((track) => track.id === state().currentId);
	if (current) publish({
		lyric: current.kind === "midi" ? state().lyric : current.title,
		timeSec: 0,
		lyricPct: 0
	});
}
async function playNext() {
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
async function playPrev() {
	const snap = state();
	const index = snap.tracks.findIndex((track) => track.id === snap.currentId);
	const prev = snap.tracks[index - 1] ?? snap.tracks[snap.tracks.length - 1];
	if (prev) await playTrack(prev);
}
function setKey(value) {
	publish({ keyShift: Math.max(-6, Math.min(6, Math.round(value))) });
	applyTransportToLive();
}
function setTempoRatio(tempoRatio) {
	publish({ tempoRatio: Math.max(.7, Math.min(1.35, tempoRatio)) });
	applyTransportToLive();
}
function setMicVol(micVol) {
	publish({ micVol });
	applyMix();
}
function setEcho(echo) {
	publish({ echo });
	applyMix();
}
async function toggleMic() {
	if (state().micOn) {
		micStream?.getTracks().forEach((track) => track.stop());
		micStream = null;
		micSource?.disconnect();
		micSource = null;
		publish({
			micOn: false,
			tune: "idle",
			micLevel: 0
		});
		applyMix();
		return;
	}
	try {
		await ensure();
		micStream = await navigator.mediaDevices.getUserMedia({ audio: {
			echoCancellation: true,
			noiseSuppression: false,
			autoGainControl: false
		} });
		micSource?.disconnect();
		micSource = ctx.createMediaStreamSource(micStream);
		micSource.connect(micGain);
		publish({
			micOn: true,
			notice: "Mic live. Headphones keep the echo from feeding back."
		});
		applyMix();
		ensureLoop();
	} catch {
		publish({
			notice: "Microphone permission was blocked.",
			micOn: false
		});
	}
}
function toggleEcho() {
	publish({ echoOn: !state().echoOn });
	applyMix();
}
function nudgeBpm(delta) {
	const snap = state();
	const base = snap.baseBpm || 100;
	setTempoRatio(Math.round(base * snap.tempoRatio + delta) / base);
}
function displayedBpm() {
	const snap = state();
	return Math.round((snap.baseBpm || 100) * snap.tempoRatio);
}
var TABS = [
	{
		id: "stage",
		label: "Stage"
	},
	{
		id: "queue",
		label: "Queue"
	},
	{
		id: "booth",
		label: "Booth"
	},
	{
		id: "songs",
		label: "Songs"
	},
	{
		id: "code",
		label: "Code"
	}
];
var HOSTS = [
	"Lisa",
	"Kevin",
	"David",
	"Sarah",
	"Tom"
];
function clock(sec) {
	if (!Number.isFinite(sec) || sec < 0) sec = 0;
	const total = Math.floor(sec);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function trackLength(track) {
	if (track.origin === "demo") {
		const song = demoSong(track.code);
		if (song) return clock(durationSec(song));
	}
	return formatBytes(track.bytes) || track.kind.toUpperCase();
}
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		className,
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "1.5",
				y: "1.5",
				width: "45",
				height: "45",
				rx: "14",
				fill: "currentColor",
				opacity: "0.16"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "2",
				y: "2",
				width: "44",
				height: "44",
				rx: "13",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.6"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "18",
				y: "9",
				width: "12",
				height: "18",
				rx: "6",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M15 22a9 9 0 0 0 18 0",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.2",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M24 31v5.5M18.5 36.5h11",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "2.2",
				strokeLinecap: "round"
			})
		]
	});
}
function useFiltered() {
	const tracks = useBooth((s) => s.tracks);
	const query = useBooth((s) => s.query);
	const kindFilter = useBooth((s) => s.kindFilter);
	return (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return tracks.filter((track) => {
			if (kindFilter !== "all" && track.kind !== kindFilter) return false;
			if (!q) return true;
			return track.title.toLowerCase().includes(q) || track.artist.toLowerCase().includes(q) || track.code.includes(q.replace(/\D/g, "") || q) || track.fileName.toLowerCase().includes(q);
		});
	}, [
		tracks,
		query,
		kindFilter
	]);
}
function KaraokeApp() {
	const videoRef = (0, import_react.useRef)(null);
	const fileRef = (0, import_react.useRef)(null);
	const folderRef = (0, import_react.useRef)(null);
	const tab = useBooth((s) => s.tab);
	const notice = useBooth((s) => s.notice);
	const remoteOpen = useBooth((s) => s.remoteOpen);
	const scoreOpen = useBooth((s) => s.scoreOpen);
	(0, import_react.useEffect)(() => {
		bootSettings();
		attachVideo(videoRef.current);
		let alive = true;
		(async () => {
			const blobs = await loadStoredTracks();
			const folder = await restoreFolderTracks() ?? [];
			if (!alive) return;
			mergeTracks(blobs, folder);
		})();
		const onKey = (event) => {
			const target = event.target;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
			if (event.code === "Space") {
				event.preventDefault();
				togglePlay();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => {
			alive = false;
			window.removeEventListener("keydown", onKey);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-3 px-3 py-3 sm:px-5 sm:py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchRow, {}),
			notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted",
				children: notice
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "console-shell flex min-h-0 flex-1 flex-col gap-3 rounded-card border border-line bg-surface/88 p-3 sm:p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Masthead, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-5 gap-1 lg:hidden",
						children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBooth.setState({ tab: item.id }),
							className: `h-10 rounded-full text-xs font-semibold ${tab === item.id ? "bg-primary text-ink" : "bg-deep text-muted"}`,
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `${tab === "stage" || tab === "queue" || tab === "booth" ? "grid" : "hidden lg:grid"} min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_minmax(0,0.92fr)]`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "stage" ? "min-h-72 lg:min-h-0" : "hidden lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stage, { videoRef })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "queue" ? "" : "hidden lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueueCard, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: tab === "booth" ? "" : "hidden lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sitting, {})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: tab === "songs" ? "" : "hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongBrowser, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: tab === "code" ? "lg:hidden" : "hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Remote, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Transport, {
						onSync: () => void syncStorage(folderRef),
						onAdd: () => fileRef.current?.click()
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				multiple: true,
				accept: ".mid,.midi,.kar,.mp3,.mpeg,.mpg,.mpe4,.mp4,.m4v,.m4a,.aac,.wav,.webm,.ogg",
				className: "hidden",
				onChange: (event) => {
					const files = [...event.target.files ?? []];
					event.target.value = "";
					takeFiles(files);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: folderRef,
				type: "file",
				multiple: true,
				className: "hidden",
				accept: ".mid,.midi,.kar,.mp3,.mpeg,.mpg,.mp4,.m4a,.wav",
				onChange: (event) => {
					const files = [...event.target.files ?? []];
					event.target.value = "";
					takeFiles(files);
				},
				webkitdirectory: "",
				directory: ""
			}),
			remoteOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-30 hidden items-end justify-center bg-deep/70 p-4 lg:flex lg:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[90dvh] w-full max-w-md overflow-auto rounded-card border border-line bg-surface p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-bold",
							children: "Song code"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Close code pad",
							onClick: () => useBooth.setState({ remoteOpen: false }),
							className: "grid size-10 place-items-center rounded-full bg-deep",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Remote, {})]
				})
			}) : null,
			scoreOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreCard, {}) : null
		]
	});
}
async function syncStorage(folderRef) {
	useBooth.setState({
		syncing: true,
		notice: ""
	});
	try {
		const picked = await pickFolder();
		if (!picked) {
			useBooth.setState({ syncing: false });
			folderRef.current?.click();
			return;
		}
		mergeTracks(useBooth.getState().tracks.filter((track) => track.origin === "blob"), picked.tracks);
		useBooth.setState({
			syncing: false,
			notice: picked.note,
			tab: "songs"
		});
	} catch (error) {
		const aborted = error instanceof DOMException && error.name === "AbortError";
		useBooth.setState({
			syncing: false,
			notice: aborted ? "" : "Could not read that folder."
		});
	}
}
async function takeFiles(files) {
	if (!files.length) return;
	useBooth.setState({ syncing: true });
	const result = await importFiles(files);
	const folder = useBooth.getState().tracks.filter((track) => track.origin === "folder");
	const blobs = await loadStoredTracks();
	const memory = result.tracks.filter((track) => !blobs.some((saved) => saved.blobKey === track.blobKey));
	mergeTracks([...blobs, ...memory], folder);
	useBooth.setState({
		syncing: false,
		notice: result.note,
		tab: "songs"
	});
}
function SearchRow() {
	const query = useBooth((s) => s.query);
	const kindFilter = useBooth((s) => s.kindFilter);
	const filtered = useFiltered();
	const [open, setOpen] = (0, import_react.useState)(false);
	const hits = query.trim() ? filtered.slice(0, 8) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex h-12 items-center gap-2 rounded-full border border-line bg-surface/80 px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: query,
					onChange: (event) => {
						useBooth.setState({ query: event.target.value });
						setOpen(true);
					},
					onFocus: () => setOpen(true),
					onBlur: () => setTimeout(() => setOpen(false), 160),
					onKeyDown: (event) => {
						if (event.key === "Enter" && filtered[0]) playTrack(filtered[0]);
					},
					placeholder: "Search title, artist or code...",
					className: "w-full bg-transparent text-base outline-none placeholder:text-muted"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Filter by file type",
					onMouseDown: (event) => event.preventDefault(),
					onClick: () => {
						const order = [
							"all",
							"midi",
							"audio",
							"video"
						];
						const next = order[(order.indexOf(kindFilter) + 1) % order.length];
						useBooth.setState({ kindFilter: next });
					},
					className: "rounded-full px-2 text-xs font-semibold text-primary",
					children: kindFilter
				})
			]
		}), open && hits.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lg",
			children: hits.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onMouseDown: (event) => event.preventDefault(),
				onClick: () => void playTrack(track),
				className: "flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-raised",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-semibold",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-xs text-muted",
							children: [
								track.code,
								" · ",
								track.artist
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted uppercase",
						children: track.kind
					})
				]
			}) }, track.id))
		}) : null]
	});
}
function Masthead() {
	const score = useBooth((s) => s.score);
	const singer = useBooth((s) => s.singer);
	const editing = useBooth((s) => s.editingSinger);
	const currentId = useBooth((s) => s.currentId);
	const current = useBooth((s) => s.tracks).find((track) => track.id === currentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-12 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-xl leading-none font-extrabold text-balance",
					children: ["MyKaraoke ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-primary",
						children: "v3"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: "v3.0.2 · live booth"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:ml-auto sm:text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1 text-xs tracking-widest text-muted sm:justify-end",
					children: ["SCORE ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3 text-primary" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl leading-none font-extrabold text-primary tabular-nums",
					children: score.toLocaleString()
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-2xl border border-line bg-deep/70 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Now singing"
						}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoFocus: true,
							defaultValue: singer,
							onBlur: (event) => useBooth.setState({
								singer: event.target.value.trim() || "Guest",
								editingSinger: false
							}),
							onKeyDown: (event) => {
								if (event.key === "Enter") event.target.blur();
							},
							className: "w-full bg-transparent text-sm font-semibold outline-none"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBooth.setState({ editingSinger: true }),
							className: "block max-w-40 truncate text-sm font-semibold",
							children: singer
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-2xl border border-line bg-deep/70 px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Song"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold",
							children: current ? `${current.title} · ${current.artist}` : "Nothing cued"
						})]
					})]
				})]
			})
		]
	});
}
function Stage({ videoRef }) {
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
	const current = useBooth((s) => s.tracks).find((track) => track.id === currentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex h-full min-h-72 flex-col gap-3 rounded-card border border-line bg-deep/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tv, { className: "size-4 text-primary" }), " Sing TV Frame"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-56 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-stage p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StageBg, { id: bgv }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					ref: videoRef,
					playsInline: true,
					className: videoOn ? "absolute inset-0 h-full w-full object-cover" : "hidden"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex items-start justify-between text-xs text-fg/80",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full bg-deep/70 px-2 py-1",
						children: BGVS.find((item) => item.id === bgv)?.label
					}), tune !== "idle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2 py-1 ${tune === "hit" ? "bg-ok text-ink" : tune === "close" ? "bg-primary text-ink" : "bg-deep/80 text-fg"}`,
						children: tune === "hit" ? "In tune" : tune === "close" ? "Close" : "Find the note"
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 px-1 text-center",
					children: [
						lyricPrev ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-sm text-fg/55",
							children: lyricPrev
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 text-xs tracking-widest text-primary/80",
							children: "LYRICS"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl leading-tight font-bold text-balance text-primary sm:text-4xl",
							children: lyric || current?.title || "Pick a song"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mt-3 h-1.5 w-36 overflow-hidden rounded-full bg-fg/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full bg-primary",
								style: { width: `${Math.round(lyricPct * 100)}%` }
							})
						}),
						lyricNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-fg/75",
							children: lyricNext
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 flex items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-fg/75 tabular-nums",
						children: [
							clock(timeSec),
							" / ",
							clock(durSec)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							if (current) playTrack(current);
						},
						className: "inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-ink",
						children: [playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }), "[ Sing ]"]
					})]
				})
			]
		})]
	});
}
function StageBg({ id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `bgv bgv-${id}`,
		"aria-hidden": true,
		children: [
			id === "city" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "skyline",
				children: [
					46,
					72,
					38,
					64,
					54,
					80,
					42,
					68,
					50,
					76,
					36,
					60
				].map((height, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { height: `${height}%` } }, index))
			}) : null,
			id === "grid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-floor" }) : null,
			id === "ocean" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tide",
				style: { bottom: "18%" }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "tide",
				style: {
					bottom: "8%",
					animationDelay: "1.2s"
				}
			})] }) : null,
			id === "stars" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StarField, {}) : null
		]
	});
}
function StarField() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;
		const dots = Array.from({ length: 70 }, () => ({
			x: Math.random(),
			y: Math.random(),
			r: Math.random() * 1.5 + .3,
			s: Math.random() * .35 + .08
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
				const y = (dot.y + frame * 35e-5 * dot.s) % 1 * height;
				context.fillStyle = `rgba(231,246,255,${.3 + dot.s})`;
				context.beginPath();
				context.arc(dot.x * width, y, dot.r, 0, Math.PI * 2);
				context.fill();
			}
			rafId = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(rafId);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "absolute inset-0 h-full w-full"
	});
}
function QueueCard() {
	const queue = useBooth((s) => s.queue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex h-full flex-col rounded-card border border-line bg-deep/50 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-2 flex items-center gap-2 text-sm font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-4 text-primary" }), " Receive Queue"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
			className: "flex flex-1 flex-col gap-2 overflow-auto",
			children: [queue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "py-8 text-center text-sm text-muted",
				children: "Queue is clear. Reserve a song or enter a code."
			}) : null, queue.map((track, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-2xl border border-line bg-surface/80 px-3 py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "pt-0.5 text-sm font-semibold text-muted tabular-nums",
							children: [index + 1, "."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								index === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-bold tracking-wide text-primary",
									children: "NOW IN QUEUE"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate font-semibold",
									children: [
										"“",
										track.title,
										"”"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted",
									children: [
										track.artist,
										" · ",
										trackLength(track)
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: ["Queued by ", index < HOSTS.length && track.origin === "demo" ? HOSTS[index] : "you"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Remove ${track.title}`,
							onClick: () => useBooth.setState({ queue: queue.filter((_, item) => item !== index) }),
							className: "grid size-9 place-items-center rounded-full text-muted hover:text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				})
			}, `${track.id}-${index}`))]
		})]
	});
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "flex h-full flex-col gap-3 rounded-card border border-line bg-deep/50 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), " Sitting Feature Adjust"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between text-sm",
						children: ["Key ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
							className: "font-display text-lg text-primary tabular-nums",
							children: keyShift > 0 ? `+${keyShift}` : keyShift
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: -6,
						max: 6,
						step: 1,
						value: keyShift,
						"aria-label": "Key",
						onChange: (event) => setKey(Number(event.target.value)),
						className: "w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "-6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+6" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between text-sm",
						children: ["Tempo ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
							className: "font-display text-lg text-primary tabular-nums",
							children: [displayedBpm() || bpm, " BPM"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 70,
						max: 140,
						step: 1,
						value: Math.min(140, Math.max(70, bpm)),
						"aria-label": "Tempo",
						onChange: (event) => setTempoRatio(Number(event.target.value) / (baseBpm || 100)),
						className: "w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex justify-between text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "70" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "100" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "140" })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						label: "Key down",
						onClick: () => setKey(keyShift - 1),
						text: "−"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						label: "Key up",
						onClick: () => setKey(keyShift + 1),
						text: "+"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						label: "Tempo down",
						onClick: () => nudgeBpm(-2),
						text: "− BPM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Step, {
						label: "Tempo up",
						onClick: () => nudgeBpm(2),
						text: "+ BPM"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center justify-between text-sm",
						children: ["Mic volume ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
							className: "tabular-nums",
							children: [micVol, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: micVol,
						"aria-label": "Mic volume",
						onChange: (event) => setMicVol(Number(event.target.value)),
						className: "w-full"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 flex h-6 items-end gap-1",
						"aria-hidden": true,
						children: meter.map((value, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
							className: "block w-full rounded-sm bg-primary",
							style: {
								height: `${Math.max(8, Math.round((micOn ? value : .08) * 24))}px`,
								opacity: micOn ? .45 + value : .25
							}
						}, index))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center justify-between text-sm",
					children: ["Echo ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
						className: "tabular-nums",
						children: [echo, "%"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 0,
					max: 100,
					value: echo,
					"aria-label": "Echo",
					onChange: (event) => setEcho(Number(event.target.value)),
					className: "w-full"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block text-sm",
				children: [
					"BGV selection",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: bgv,
						"aria-label": "Background visuals",
						onChange: (event) => useBooth.setState({ bgv: event.target.value }),
						className: "mt-1 h-11 w-full rounded-xl border border-line bg-deep px-3",
						children: BGVS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: item.id,
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-xs text-muted",
						children: scene?.hint
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs tracking-widest text-muted",
				children: "SIX LOOKS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2",
				children: THEMES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useBooth.setState({ theme: item.id }),
					className: `flex h-11 items-center justify-center gap-2 rounded-full border text-xs font-semibold ${theme === item.id ? "border-primary bg-primary text-ink" : "border-line bg-deep text-fg"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
						className: "size-2.5 rounded-full",
						style: { background: item.swatch }
					}), item.label]
				}, item.id))
			})] })
		]
	});
}
function Step({ label, text, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "h-11 flex-1 rounded-full border border-line bg-surface text-sm font-semibold",
		children: text
	});
}
function SongBrowser() {
	const filtered = useFiltered();
	const query = useBooth((s) => s.query);
	const shown = filtered.slice(0, query.trim() ? 200 : 60);
	const storageLabel = useBooth((s) => s.storageLabel);
	const yours = shown.filter((track) => track.origin !== "demo");
	const house = shown.filter((track) => track.origin === "demo");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-card border border-line bg-deep/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-sm font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-4 text-primary" }), " Songs"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted",
				children: storageLabel
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[50dvh] space-y-3 overflow-auto pr-1",
			children: [
				yours.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongGroup, {
					title: "On this device",
					tracks: yours
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SongGroup, {
					title: yours.length ? "House band" : `House band · ${shown.length}`,
					tracks: house.length ? house : shown
				}),
				filtered.length > shown.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted",
					children: [
						"Showing ",
						shown.length,
						" of ",
						filtered.length,
						". Type a title, artist, or code to narrow."
					]
				}) : null,
				shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-muted",
					children: "No songs match. Sync a folder of .mid, .mp3, .mpeg, or .mp4 files."
				}) : null
			]
		})]
	});
}
function SongGroup({ title, tracks }) {
	if (!tracks.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mb-1 text-xs tracking-widest text-muted uppercase",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "flex flex-col",
		children: tracks.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex items-center gap-3 border-b border-line/70 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: track.fileName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							trackLength(track),
							" · ",
							track.kind.toUpperCase(),
							" · ",
							track.code
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void playTrack(track),
					className: "h-10 rounded-full bg-primary px-3 text-xs font-bold text-ink",
					children: "Sing"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => reserve(track),
					className: "h-10 rounded-full border border-line px-3 text-xs font-semibold",
					children: "Reserve"
				})
			]
		}, track.id))
	})] });
}
function reserve(track) {
	const queue = useBooth.getState().queue;
	if (queue.some((item) => item.id === track.id)) {
		useBooth.setState({ notice: `${track.title} is already in the queue.` });
		return;
	}
	useBooth.setState({
		queue: [...queue, track],
		notice: `Reserved ${track.title}.`
	});
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
	const press = (digit) => useBooth.setState({ code: (code + digit).slice(0, 6) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-2 text-xs tracking-widest text-muted",
				children: "SUGGESTIONS"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: artists.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => useBooth.setState({
						query: track.artist,
						tab: "songs",
						remoteOpen: false
					}),
					className: "flex w-full items-center gap-3 rounded-2xl border border-line bg-deep px-3 py-2 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-10 place-items-center rounded-full bg-primary text-sm font-bold text-ink",
						children: track.artist.slice(0, 1)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate font-semibold",
							children: track.artist
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-muted",
							children: ["Singer · ", track.kind === "midi" ? "MIDI" : track.kind]
						})]
					})]
				}) }, track.artist))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-card border border-line bg-raised/70 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-16 shrink-0 place-items-center rounded-xl bg-deep text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-7" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-display text-2xl font-bold",
								children: current ? current.title : "No song"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									playing ? paused ? "Paused" : "Now playing" : "Cued",
									" · ",
									clock(timeSec),
									" / ",
									clock(durSec)
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 h-1.5 overflow-hidden rounded-full bg-deep",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-primary",
							style: { width: `${durSec ? Math.min(100, timeSec / durSec * 100) : 0}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-center justify-between gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "KEY"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Round, {
											onClick: () => setKey(keyShift - 1),
											label: "Key down",
											children: "−"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-10 font-display text-lg font-bold text-primary tabular-nums",
											children: keyShift > 0 ? `+${keyShift}` : keyShift
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Round, {
											onClick: () => setKey(keyShift + 1),
											label: "Key up",
											children: "+"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "TEMPO"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex items-center gap-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Round, {
											onClick: () => nudgeBpm(-2),
											label: "Tempo down",
											children: "−"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "w-16 text-sm font-bold tabular-nums",
											children: [displayedBpm(), " BPM"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Round, {
											onClick: () => nudgeBpm(2),
											label: "Tempo up",
											children: "+"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": playing && !paused ? "Pause" : "Play",
								onClick: () => void togglePlay(),
								className: "grid size-14 place-items-center rounded-full bg-primary text-ink",
								children: playing && !paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-6" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-6" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 text-center text-xs tracking-widest text-muted",
					children: ["SONG CODE · ", code || "ENTER CODE"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-2",
					children: [
						[
							"1",
							"2",
							"3",
							"4",
							"5",
							"6",
							"7",
							"8",
							"9"
						].map((digit) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => press(digit),
							className: "h-14 rounded-2xl bg-deep text-xl font-semibold",
							children: digit
						}, digit)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBooth.setState({ code: "" }),
							className: "h-14 rounded-2xl bg-deep text-sm font-semibold text-danger",
							children: "Cancel"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => press("0"),
							className: "h-14 rounded-2xl bg-deep text-xl font-semibold",
							children: "0"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => enterCode(false),
							className: "flex h-14 items-center justify-center gap-1 rounded-2xl bg-primary font-bold text-ink",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }), " Enter"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 grid grid-cols-3 gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => enterCode(true),
							className: "h-12 rounded-2xl border border-line text-xs font-bold",
							children: "Reserve"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => useBooth.setState({ scoreOpen: true }),
							className: "h-12 rounded-2xl bg-primary text-xs font-bold text-ink",
							children: "Score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								useBooth.setState({
									code: "",
									score: 0
								});
								stopPlayback();
							},
							className: "h-12 rounded-2xl border border-line text-xs font-bold",
							children: "Clear"
						})
					]
				})
			] })
		]
	});
}
function Round({ children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: "grid size-11 place-items-center rounded-full bg-deep text-lg font-bold",
		children
	});
}
function enterCode(queueOnly) {
	const { code, tracks } = useBooth.getState();
	const track = findByCode(tracks, code);
	if (!track) {
		useBooth.setState({ notice: code ? `No song for code ${code}.` : "Enter a song code." });
		return;
	}
	if (queueOnly) reserve(track);
	else playTrack(track);
	useBooth.setState({
		code: "",
		remoteOpen: false,
		tab: "stage"
	});
}
function Transport({ onSync, onAdd }) {
	const playing = useBooth((s) => s.playing);
	const paused = useBooth((s) => s.paused);
	const micOn = useBooth((s) => s.micOn);
	const echoOn = useBooth((s) => s.echoOn);
	const queue = useBooth((s) => s.queue);
	const syncing = useBooth((s) => s.syncing);
	const bgv = useBooth((s) => s.bgv);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2 overflow-x-auto pb-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: playing && !paused ? "Pause" : "Play",
				onClick: () => void togglePlay(),
				active: playing && !paused,
				children: [playing && !paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), " Play"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Stop",
				onClick: () => void stopPlayback(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-4" }), " Stop"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Next",
				onClick: () => void playNext(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipForward, { className: "size-4" }), " Next"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Previous",
				onClick: () => void playPrev(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkipBack, { className: "size-4" }), " Prev"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Microphone",
				onClick: () => void toggleMic(),
				active: micOn,
				children: [micOn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicOff, { className: "size-4" }), " Mic"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Echo",
				onClick: toggleEcho,
				active: echoOn,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Waves, { className: "size-4" }), " Echo"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Background",
				onClick: () => {
					const next = BGVS[(BGVS.findIndex((item) => item.id === bgv) + 1) % BGVS.length];
					useBooth.setState({ bgv: next.id });
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), " BGV"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Received queue",
				onClick: () => useBooth.setState({ tab: "queue" }),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-4" }),
					" Received",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-5 place-items-center rounded-full bg-primary text-xs font-bold text-ink",
						children: queue.length
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Songs",
				onClick: () => useBooth.setState({ tab: "songs" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListMusic, { className: "size-4" }), " Songs"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Song code",
				onClick: () => useBooth.setState(window.matchMedia("(min-width: 1024px)").matches ? { remoteOpen: true } : { tab: "code" }),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, { className: "size-4" }), " Code"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Sync storage folder",
				onClick: onSync,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderSync, { className: `size-4 ${syncing ? "animate-spin" : ""}` }), " Sync"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
				label: "Add songs from this device",
				onClick: onAdd,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "size-4" }), " Add"]
			})
		]
	});
}
function Pill({ children, onClick, label, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: `inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${active ? "border-primary bg-primary text-ink" : "border-line bg-deep text-fg"}`,
		children
	});
}
function ScoreCard() {
	const score = useBooth((s) => s.score);
	const singer = useBooth((s) => s.singer);
	const currentId = useBooth((s) => s.currentId);
	const current = useBooth((s) => s.tracks).find((track) => track.id === currentId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-40 grid place-items-center bg-deep/75 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-card border border-line bg-surface p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mx-auto size-8 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs tracking-widest text-muted",
					children: "PERFORMANCE"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-5xl font-extrabold text-primary tabular-nums",
					children: score.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm",
					children: [singer, current ? ` · ${current.title}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => useBooth.setState({ scoreOpen: false }),
						className: "h-11 flex-1 rounded-full bg-primary font-bold text-ink",
						children: "Close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => useBooth.setState({ score: 0 }),
						className: "inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-line font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Delete, { className: "size-4" }), " Reset"]
					})]
				})
			]
		})
	});
}
var SplitComponent = KaraokeApp;
//#endregion
export { SplitComponent as component };
