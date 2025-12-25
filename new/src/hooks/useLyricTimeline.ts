// hooks/useLyricTimeline.ts
import { useMemo } from "react";
import type { LyricLine } from "../types/lyrics";

export type TimelineState = {
  currentLineIndex: number;
  currentLine: LyricLine | null;
  nextLine: LyricLine | null;
  previousLine: LyricLine | null;
};

export function useLyricTimeline(
  lines: LyricLine[] | null,
  currentTime: number // in seconds, from your audio/video player
): TimelineState {
  return useMemo(() => {
    if (!lines || lines.length === 0) {
      return {
        currentLineIndex: -1,
        currentLine: null,
        nextLine: null,
        previousLine: null,
      };
    }

    const idx = lines.findIndex((line, i) => {
      const start = line.start;
      const end =
        i < lines.length - 1
          ? lines[i + 1].start
          : line.start + line.dur + 2; // padding for last line
      return currentTime >= start && currentTime < end;
    });

    if (idx === -1) {
      return {
        currentLineIndex: -1,
        currentLine: null,
        nextLine: lines[0] || null,
        previousLine: null,
      };
    }

    return {
      currentLineIndex: idx,
      currentLine: lines[idx],
      nextLine: lines[idx + 1] || null,
      previousLine: lines[idx - 1] || null,
    };
  }, [lines, currentTime]);
}
