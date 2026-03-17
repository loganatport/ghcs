// ── Lyrics & Songs ────────────────────────────────────────────────────────────

export interface LyricLine {
  startMs: number;
  endMs: number;
  text: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  genre: string;
  emoji: string;
  color: string; // gradient accent color
  lyrics: LyricLine[];
}

// ── Users & Friends ───────────────────────────────────────────────────────────

export interface Friend {
  id: string;
  username: string;
  avatarColor: string;
  initials: string;
}

// ── Videos ───────────────────────────────────────────────────────────────────

export interface MyVideo {
  id: string;
  videoUri: string;
  songId: string;
  recordedAt: number;
}

export interface ReceivedVideo {
  id: string;
  sender: Friend;
  songId: string;
  sentAt: number;
  watched: boolean;
  // In a real app this would be a remote URL; here we use a placeholder
  videoUri?: string;
}

// ── Navigation Params ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  Recording: { song: Song };
  Preview: { videoUri: string; song: Song };
  VideoPlayer: { video: ReceivedVideo; song: Song };
};

export type TabParamList = {
  Feed: undefined;
  Songs: undefined;
  Profile: undefined;
};
