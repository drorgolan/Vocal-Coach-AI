// src/hooks/useWhisperLyrics.ts
import { useEffect, useState } from "react";
import type { LyricLine } from "@/types/lyrics";

export function useWhisperLyrics(videoId: string | null) {
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/whisper-transcript?videoId=${videoId}`);
        if (!res.ok) throw new Error("Whisper failed");
        const data = await res.json();
        if (!cancelled) {
          setLines(data.lines || null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Whisper error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return { lines, loading, error };
}
