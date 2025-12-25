// hooks/useSongLyrics.ts
import { useEffect, useMemo, useState } from "react";
import { useYouTubeCaptions } from "./useYouTubeCaptions";
import type { CaptionLine, LyricLine, LyricSource } from "../types/lyrics";

// Replace this with your actual lyrics API call
async function fetchLyricsFromApi(artist: string, title: string): Promise<string | null> {
  // Example (you'll plug in your API):
  // const res = await fetch(`/api/lyrics?artist=${...}&title=${...}`);
  // if (!res.ok) return null;
  // const json = await res.json();
  // return json.lyrics || null;
  return null;
}

function captionLinesToLyricLines(lines: CaptionLine[]): LyricLine[] {
  return lines.map((line, index) => ({
    ...line,
    id: `caption-${index}-${line.start.toFixed(2)}`,
  }));
}

function plainLyricsToLyricLines(lyrics: string): LyricLine[] {
  const lines = lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((text, index) => ({
    id: `manual-${index}`,
    text,
    start: index * 3, // naive spacing; you can improve this later
    dur: 3,
  }));
}

type UseSongLyricsParams = {
  videoId: string | null;
  artist: string | null;
  title: string | null;
  manualLyrics: string | null; // user input
};

export function useSongLyrics({
  videoId,
  artist,
  title,
  manualLyrics,
}: UseSongLyricsParams) {
  const { captions, isLoading: captionsLoading } = useYouTubeCaptions(videoId);

  const [apiLyrics, setApiLyrics] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Fetch from lyrics API only if no captions
  useEffect(() => {
    if (captions && captions.length > 0) {
      setApiLyrics(null);
      setApiError(null);
      setApiLoading(false);
      return;
    }
    if (!artist || !title) {
      setApiLyrics(null);
      setApiError(null);
      setApiLoading(false);
      return;
    }

    let cancelled = false;
    async function run() {
      setApiLoading(true);
      setApiError(null);
      try {
        const text = await fetchLyricsFromApi(artist, title);
        if (!cancelled) {
          setApiLyrics(text);
        }
      } catch (err: any) {
        if (!cancelled) {
          setApiError(err?.message || "Failed to load lyrics");
        }
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [captions, artist, title]);

  const { lines, source }: { lines: LyricLine[]; source: LyricSource } =
    useMemo(() => {
      if (captions && captions.length > 0) {
        return { lines: captionLinesToLyricLines(captions), source: "captions" };
      }

      if (apiLyrics && apiLyrics.trim().length > 0) {
        return { lines: plainLyricsToLyricLines(apiLyrics), source: "api" };
      }

      if (manualLyrics && manualLyrics.trim().length > 0) {
        return { lines: plainLyricsToLyricLines(manualLyrics), source: "manual" };
      }

      return { lines: [], source: "none" };
    }, [captions, apiLyrics, manualLyrics]);

  const isLoading = captionsLoading || apiLoading;

  const needsManualInput = source === "none";

  return {
    lines,
    source,
    isLoading,
    apiError,
    needsManualInput,
  };
}


// src/hooks/useSongLyrics.ts (or a utils file)

// naive word-level split: distribute line duration across words
function addWordTimingToLine(line: CaptionLine): LyricLine {
  const words = line.text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return {
      id: `line-${line.start.toFixed(2)}`,
      text: line.text,
      start: line.start,
      dur: line.dur,
    };
  }

  const wordDur = line.dur / words.length;

  const wordObjs = words.map((w, index) => {
    const start = line.start + index * wordDur;
    const end = start + wordDur;
    return {
      id: `w-${line.start.toFixed(2)}-${index}`,
      text: w,
      start,
      end,
    };
  });

  return {
    id: `line-${line.start.toFixed(2)}`,
    text: line.text,
    start: line.start,
    dur: line.dur,
    words: wordObjs,
  };
}

export function captionLinesToLyricLines(lines: CaptionLine[]): LyricLine[] {
  return lines.map(addWordTimingToLine);
}
