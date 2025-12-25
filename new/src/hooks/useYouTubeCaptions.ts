// hooks/useYouTubeCaptions.ts
import { useEffect, useState } from "react";
import type { CaptionLine } from "../types/lyrics";

function parseYouTubeCaptionsXml(xml: string): CaptionLine[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const nodes = Array.from(doc.getElementsByTagName("text"));

  return nodes
    .map((node) => {
      const start = parseFloat(node.getAttribute("start") || "0");
      const dur = parseFloat(node.getAttribute("dur") || "0");
      const text = (node.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return null;
      return { start, dur, text };
    })
    .filter((x): x is CaptionLine => x !== null);
}

export function useYouTubeCaptions(videoId: string | null, lang = "en") {
  const [captions, setCaptions] = useState<CaptionLine[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) {
      setCaptions(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchCaptions() {
      setIsLoading(true);
      setError(null);

      try {
        const url = `https://www.youtube.com/api/timedtext?lang=${encodeURIComponent(
          lang
        )}&v=${encodeURIComponent(videoId)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const xml = await res.text();
        const parsed = parseYouTubeCaptionsXml(xml);

        if (!cancelled) {
          if (parsed.length === 0) {
            setCaptions(null);
          } else {
            setCaptions(parsed);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load captions");
          setCaptions(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchCaptions();

    return () => {
      cancelled = true;
    };
  }, [videoId, lang]);

  return { captions, isLoading, error };
}
