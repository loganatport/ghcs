import { create } from 'zustand';
import { MyVideo, ReceivedVideo } from '../types';
import { MOCK_RECEIVED_VIDEOS } from '../data/mockFriends';
import { KEYS, getItem, setItem } from './storage';

interface AppStore {
  myVideos: MyVideo[];
  receivedVideos: ReceivedVideo[];
  username: string;
  hasSeeded: boolean;

  loadAll: () => Promise<void>;
  addMyVideo: (video: MyVideo) => Promise<void>;
  markWatched: (videoId: string) => Promise<void>;
  setUsername: (name: string) => Promise<void>;
  refreshFeed: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  myVideos: [],
  receivedVideos: [],
  username: 'You',
  hasSeeded: false,

  loadAll: async () => {
    const [myVideos, receivedVideos, username, hasSeeded] = await Promise.all([
      getItem<MyVideo[]>(KEYS.MY_VIDEOS),
      getItem<ReceivedVideo[]>(KEYS.RECEIVED_VIDEOS),
      getItem<string>(KEYS.USERNAME),
      getItem<boolean>(KEYS.HAS_SEEDED),
    ]);

    let feed = receivedVideos;
    if (!hasSeeded) {
      feed = MOCK_RECEIVED_VIDEOS;
      await setItem(KEYS.RECEIVED_VIDEOS, feed);
      await setItem(KEYS.HAS_SEEDED, true);
    }

    set({
      myVideos: myVideos ?? [],
      receivedVideos: feed ?? [],
      username: username ?? 'You',
      hasSeeded: true,
    });
  },

  addMyVideo: async (video) => {
    const updated = [video, ...get().myVideos];
    set({ myVideos: updated });
    await setItem(KEYS.MY_VIDEOS, updated);
  },

  markWatched: async (videoId) => {
    const updated = get().receivedVideos.map((v) =>
      v.id === videoId ? { ...v, watched: true } : v
    );
    set({ receivedVideos: updated });
    await setItem(KEYS.RECEIVED_VIDEOS, updated);
  },

  setUsername: async (name) => {
    set({ username: name });
    await setItem(KEYS.USERNAME, name);
  },

  refreshFeed: () => {
    // Simulate receiving new videos by reshuffling and marking some unwatched
    const shuffled = [...MOCK_RECEIVED_VIDEOS]
      .sort(() => Math.random() - 0.5)
      .map((v, i) => ({ ...v, watched: i > 1, sentAt: Date.now() - i * 600_000 }));
    set({ receivedVideos: shuffled });
    setItem(KEYS.RECEIVED_VIDEOS, shuffled);
  },
}));
