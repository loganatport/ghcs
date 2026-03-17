import { LyricLine } from '../types';

const BASE = 'https://lrclib.net/api';

/**
 * Parse an LRC-format string into timed lyric lines.
 *
 * LRC example:
 *   [00:14.73]Is this the real life?
 *   [00:20.12]Is this just fantasy?
 */
function parseLrc(lrc: string, songDurationMs: number): LyricLine[] {
  const entries: { startMs: number; text: string }[] = [];

  // Match [mm:ss.xx] or [mm:ss.xxx] tags
  const re = /\[(\d{2}):(\d{2})\.(\d{2,3})\]([^\[]*)/g;
  let match: RegExpExecArray | null;

  while ((match = re.exec(lrc)) !== null) {
    const [, mm, ss, frac, text] = match;
    const ms =
      parseInt(mm, 10) * 60_000 +
      parseInt(ss, 10) * 1_000 +
      (frac.length === 2 ? parseInt(frac, 10) * 10 : parseInt(frac, 10));
    const trimmed = text.trim();
    entries.push({ startMs: ms, text: trimmed });
  }

  if (entries.length === 0) return [];

  return entries.map((entry, i): LyricLine => ({
    startMs: entry.startMs,
    endMs: i + 1 < entries.length ? entries[i + 1].startMs : songDurationMs,
    text: entry.text,
  }));
}

/**
 * Fetch time-synced lyrics from LRCLIB.
 * Falls back to plain lyrics (single line per sentence) if synced unavailable.
 * Returns [] if the track is not found.
 */
export async function fetchLyrics(
  title: string,
  artist: string,
  album: string,
  durationMs: number,
): Promise<LyricLine[]> {
  const params = new URLSearchParams({
    track_name: title,
    artist_name: artist,
    album_name: album,
    duration: String(Math.round(durationMs / 1000)),
  });

  const res = await fetch(`${BASE}/get?${params}`);

  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`LRCLIB ${res.status}`);

  const json = await res.json();

  if (json.syncedLyrics) {
    return parseLrc(json.syncedLyrics, durationMs);
  }

  // Plain lyrics fallback: show one line at a time, evenly spaced
  if (json.plainLyrics) {
    const lines: string[] = json.plainLyrics
      .split('\n')
      .map((l: string) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    const msPerLine = durationMs / lines.length;
    return lines.map((text, i): LyricLine => ({
      startMs: Math.round(i * msPerLine),
      endMs: Math.round((i + 1) * msPerLine),
      text,
    }));
  }

  return [];
}
