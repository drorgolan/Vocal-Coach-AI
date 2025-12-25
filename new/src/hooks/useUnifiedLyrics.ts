// src/hooks/useUnifiedLyrics.ts
import { useMemo } from "react";
import { useYouTubeCaptions } from "./useYouTubeCaptions";
import { useLyricsFallback } from "./useLyricsFallback";
import { useLyricTimeline } from "./useLyricTimeline";
import { useWhisperLyrics } from "./useWhisperLyrics";
import type { LyricLine, LyricWord } from "../types/lyrics";

/* --------------------------------------------------
   1. Plain text → timed lines (fallback/manual)
   -------------------------------------------------- */
function plainLyricsToLyricLines(lyrics: string): LyricLine[] {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return lines.map((text, index) => {
    const start = index * 4;
    const dur = 4;

    const words = text.split(/\s+/).map((w, i) => {
      const wStart = start + (dur / lines.length) * i;
      const wEnd = wStart + dur / lines.length;
      return {
        id: `manual-w-${index}-${i}`,
        text: w,
        start: wStart,
        end: wEnd,
      };
    });

    return {
      id: `manual-${index}`,
      text,
      start,
      dur,
      words,
    };
  });
}

/* --------------------------------------------------
   2. Captions → line + word-level timing
   -------------------------------------------------- */
function captionLineToLyricLine(line: any): LyricLine {
  const start = line.start ?? 0;
  const dur = line.dur ?? (line.end ? line.end - start : 2);

  const rawWords = line.words ?? line.text.split(/\s+/);

  const words: LyricWord[] = rawWords.map((w: any, i: number) => {
    const text = typeof w === "string" ? w : w.text;
    const wStart = w.start ?? (start + (dur / rawWords.length) * i);
    const wEnd = w.end ?? (wStart + dur / rawWords.length);

    return {
      id: `cap-w-${start}-${i}`,
      text,
      start: wStart,
      end: wEnd,
    };
  });

  return {
    id: `cap-${start}`,
    text: line.text,
    start,
    dur,
    words,
  };
}

/* --------------------------------------------------
   3. Unified hook
   -------------------------------------------------- */
export function useUnifiedLyrics({
  videoId,
  artist,
  title,
  manualLyrics,
  currentTime,
}: {
  videoId: string | null;
  artist: string | null;
  title: string | null;
  manualLyrics: string | null;
  currentTime: number;
}) {
  // A. Captions
  const { captions, isLoading: captionsLoading } = useYouTubeCaptions(videoId);

  // B. Whisper fallback
  const whisper = useWhisperLyrics(videoId);

  // C. External lyrics API
  const { lyrics: fallbackLyrics, loading: fallbackLoading } =
    useLyricsFallback(artist || "", title || "");

  /* --------------------------------------------------
     4. Choose best available source
     -------------------------------------------------- */
  const { lines, source } = useMemo(() => {
    // 1. Captions → best
    if (captions && captions.length > 0) {
      return {
        lines: captions.map((c) => captionLineToLyricLine(c)),
        source: "captions" as const,
      };
    }

    // 2. Whisper → second best
    if (Array.isArray(whisper.lines) && whisper.lines.length > 0) {
      return {
        lines: whisper.lines,
        source: "whisper" as const,
      };
    }

    // 3. External lyrics API
    if (fallbackLyrics && fallbackLyrics.trim().length > 0) {
      return {
        lines: plainLyricsToLyricLines(fallbackLyrics),
        source: "api" as const,
      };
    }

    // 4. Manual lyrics
    if (manualLyrics && manualLyrics.trim().length > 0) {
  return {
    lines: plainLyricsToLyricLines(manualLyrics),
    source: "manual" as const,
  };
}


    // 5. Nothing available
    return {
      lines: [] as LyricLine[],
      source: "none" as const,
    };
  }, [captions, whisper.lines, fallbackLyrics, manualLyrics]);

  /* --------------------------------------------------
     5. Timeline sync
     -------------------------------------------------- */
  const timeline = useLyricTimeline(lines, currentTime);

  const isLoading = captionsLoading || fallbackLoading || whisper.loading;
  const needsManualInput = source === "none";

  return {
    lines,
    source,
    isLoading,
    needsManualInput,
    timeline,
  };
}
