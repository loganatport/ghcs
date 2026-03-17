# KaraokeSnap 🎤

A Snapchat-style mobile app where friends can record karaoke lip-sync videos and send them to each other.

## Features

- 🎵 **8 built-in songs** across Rock, Pop, Funk, Soul, and Disco
- 🎤 **Live karaoke recording** — front camera + synchronized lyrics overlay
- 3-2-1 countdown before recording starts
- Real-time progress bar while recording
- 📺 **Preview & share** recorded video with the native share sheet
- 💾 **Save to camera roll** with one tap
- 📬 **Friends inbox** — receive karaoke videos from friends (mock data pre-seeded)
- 👤 **Profile** — view your past recordings in a grid layout
- 🔴 Pull-to-refresh the feed for "new" videos
- Dark theme throughout

## Tech Stack

| Library | Purpose |
|---|---|
| Expo SDK 51 | Mobile app framework |
| React Navigation v6 | Screen navigation (stack + bottom tabs) |
| expo-camera | Front-facing video recording |
| expo-av | Video playback (preview & feed) |
| expo-media-library | Save video to camera roll |
| expo-sharing | Native OS share sheet |
| Zustand | Global state management |
| AsyncStorage | Persistent storage (videos, username) |
| TypeScript | Type safety throughout |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (iOS or Android)

### Install & Run

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. Camera and microphone access is required for recording.

## Project Structure

```
src/
├── navigation/
│   ├── RootNavigator.tsx    # Stack navigator (modal screens)
│   └── TabNavigator.tsx     # Bottom tabs (Feed / Record / Profile)
├── screens/
│   ├── FeedScreen.tsx       # Inbox of received karaoke videos
│   ├── SongSelectScreen.tsx # Browse & filter songs
│   ├── RecordingScreen.tsx  # Camera + live lyrics + record button
│   ├── PreviewScreen.tsx    # Preview recorded video + share/save
│   ├── VideoPlayerScreen.tsx # Full-screen video player
│   └── ProfileScreen.tsx    # My recordings grid + username
├── components/
│   ├── LyricsOverlay.tsx    # Animated synced lyrics (prev/active/next)
│   ├── CountdownOverlay.tsx # 3-2-1 animated countdown
│   ├── RecordButton.tsx     # Pulsing record/stop button
│   ├── SongCard.tsx         # Song list item
│   ├── VideoCard.tsx        # Feed video item
│   └── PermissionGate.tsx   # Camera/mic permission request UI
├── hooks/
│   ├── useLyricSync.ts      # Derives active lyric index from positionMs
│   ├── useAudioPlayer.ts    # Karaoke beat ticker + position tracking
│   ├── useRecording.ts      # expo-camera recording lifecycle
│   └── usePermissions.ts    # Camera + mic + media library permissions
├── store/
│   ├── useAppStore.ts       # Zustand store (videos, username, feed)
│   └── storage.ts           # AsyncStorage typed helpers
├── data/
│   ├── songs.ts             # 8 songs with timestamped lyrics
│   └── mockFriends.ts       # Mock friends + pre-seeded received videos
└── types/
    └── index.ts             # All shared TypeScript interfaces
```

## How Lyric Sync Works

Each song has an array of `LyricLine` objects with `startMs` and `endMs` timestamps:

```typescript
{ startMs: 3000, endMs: 7500, text: 'Is this the real life?' }
```

While recording, a ticker increments `positionMs` every 100ms. `useLyricSync` returns the index of the line whose time window contains `positionMs`. The `LyricsOverlay` renders 3 lines (previous, active, next) with a pulse animation on each change.

## Adding Real Audio

The app uses a visual ticker for lyric sync (no audio files bundled). To add real backing tracks:

1. Add `.mp3` files to `assets/songs/`
2. In `useAudioPlayer.ts`, replace `playTicker()` with `expo-av` `Audio.Sound`:

```typescript
const { sound } = await Audio.Sound.createAsync(song.audioAsset);
await sound.playAsync();
// Poll sound.getStatusAsync() every 100ms for positionMillis
```

3. Add `audioAsset: require('../../assets/songs/xxx.mp3')` to each song in `songs.ts`

## Adding Real Friends

Replace `MOCK_RECEIVED_VIDEOS` in `mockFriends.ts` with a real API call. The `ReceivedVideo` type supports remote `videoUri` URLs — just update `VideoPlayerScreen` to load them via `expo-av`'s `source={{ uri }}`.

## Screenshots

| Feed | Song Select | Recording | Preview |
|---|---|---|---|
| Friends' videos inbox | Browse & filter songs | Camera + live lyrics | Save & share |
