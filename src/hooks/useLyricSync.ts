import { useMemo } from 'react';
import { LyricLine } from '../types';

/**
 * Returns the index of the currently active lyric line based on positionMs.
 * Returns -1 if no line is active yet.
 */
export function useLyricSync(lyrics: LyricLine[], positionMs: number): number {
  return useMemo(() => {
    let activeIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (positionMs >= lyrics[i].startMs && positionMs < lyrics[i].endMs) {
        activeIndex = i;
        break;
      }
    }
    return activeIndex;
  }, [lyrics, positionMs]);
}
