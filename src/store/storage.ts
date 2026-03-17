import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MY_VIDEOS: '@karaoke/my-videos',
  RECEIVED_VIDEOS: '@karaoke/received-videos',
  USERNAME: '@karaoke/username',
  HAS_SEEDED: '@karaoke/has-seeded',
} as const;

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export { KEYS, getItem, setItem };
