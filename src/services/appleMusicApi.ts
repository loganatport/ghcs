import { APPLE_MUSIC_DEVELOPER_TOKEN, APPLE_MUSIC_STOREFRONT } from '../config/appleMusic';
import { LyricLine, Song } from '../types';

const BASE = 'https://api.music.apple.com/v1';

// Fallback accent colors when artwork bgColor is unavailable
const ACCENT_COLORS = [
  '#c0392b', '#8e44ad', '#e67e22', '#f39c12',
  '#27ae60', '#16a085', '#2c3e50', '#9b59b6',
];

function accentColor(index: number, bgColor?: string): string {
  if (bgColor && /^[0-9a-fA-F]{6}$/.test(bgColor)) return `#${bgColor}`;
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

function artworkUrl(template: string, size = 300): string {
  return template.replace('{w}', String(size)).replace('{h}', String(size));
}

export interface AppleMusicSong {
  amId: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  previewUrl: string | null;
  artworkUrl: string | null;
  genre: string;
  color: string;
}

export async function searchAppleMusic(
  query: string,
  limit = 20,
): Promise<AppleMusicSong[]> {
  if (!query.trim()) return [];

  const token = APPLE_MUSIC_DEVELOPER_TOKEN;
  if (!token || token === 'YOUR_DEVELOPER_TOKEN_HERE') {
    throw new Error(
      'Apple Music developer token not configured. ' +
        'See src/config/appleMusic.ts for setup instructions.',
    );
  }

  const url =
    `${BASE}/catalog/${APPLE_MUSIC_STOREFRONT}/search` +
    `?term=${encodeURIComponent(query)}&types=songs&limit=${limit}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Apple Music API ${res.status}: ${body}`);
  }

  const json = await res.json();
  const items: any[] = json?.results?.songs?.data ?? [];

  return items.map((item, index): AppleMusicSong => {
    const a = item.attributes ?? {};
    return {
      amId: item.id,
      title: a.name ?? 'Unknown',
      artist: a.artistName ?? 'Unknown',
      album: a.albumName ?? '',
      durationMs: a.durationInMillis ?? 30000,
      previewUrl: a.previews?.[0]?.url ?? null,
      artworkUrl: a.artwork?.url ? artworkUrl(a.artwork.url) : null,
      genre: a.genreNames?.[0] ?? 'Unknown',
      color: accentColor(index, a.artwork?.bgColor),
    };
  });
}

/**
 * Convert an AppleMusicSong + fetched lyrics into the app's Song type.
 * durationMs is capped at 30 000 ms (the preview length) and lyrics are
 * filtered to lines that fall within that window.
 */
export function toSong(am: AppleMusicSong, lyrics: LyricLine[]): Song {
  const durationMs = Math.min(am.durationMs, 30_000);
  const trimmedLyrics = lyrics
    .filter((l) => l.startMs < durationMs)
    .map((l) => ({ ...l, endMs: Math.min(l.endMs, durationMs) }));

  return {
    id: `am_${am.amId}`,
    title: am.title,
    artist: am.artist,
    durationMs,
    genre: am.genre,
    emoji: '🎵',
    color: am.color,
    previewUrl: am.previewUrl ?? undefined,
    artworkUrl: am.artworkUrl ?? undefined,
    lyrics: trimmedLyrics,
  };
}
