import { useEffect, useState } from "react";

export function useLyricsFallback(artist: string, title: string) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clean = (s: string) =>
    s.replace(/ *\([^)]*\) */g, "").replace(/feat\..*/i, "").trim();

  const a = clean(artist);
  const t = clean(title);

  const sources = [
    // 1. lyrics.ovh
    async () => {
      const res = await fetch(`https://api.lyrics.ovh/v1/${a}/${t}`);
      if (!res.ok) throw new Error("lyrics.ovh failed");
      const data = await res.json();
      return data.lyrics;
    },

    // 2. Vagalume (free, no key needed)
    async () => {
      const res = await fetch(
        `https://api.vagalume.com.br/search.php?art=${a}&mus=${t}`
      );
      if (!res.ok) throw new Error("vagalume failed");
      const data = await res.json();
      if (!data.mus || !data.mus[0]?.text) throw new Error("no lyrics");
      return data.mus[0].text;
    },

    // 3. ChartLyrics
    async () => {
      const res = await fetch(
        `https://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?artist=${a}&song=${t}`
      );
      if (!res.ok) throw new Error("chartlyrics failed");
      const text = await res.text();
      const match = text.match(/<Lyric>([\s\S]*?)<\/Lyric>/);
      if (!match) throw new Error("no lyrics");
      return match[1];
    },

    // 4. LyricsGenius unofficial mirror
    async () => {
      const res = await fetch(
        `https://some-free-genius-proxy.com/lyrics?artist=${a}&title=${t}`
      );
      if (!res.ok) throw new Error("genius proxy failed");
      const data = await res.json();
      return data.lyrics;
    },
  ];

  useEffect(() => {
    if (!artist || !title) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      for (let i = 0; i < sources.length; i++) {
        try {
          const text = await sources[i]();
          if (!cancelled) {
            setLyrics(text);
            setLoading(false);
          }
          return;
        } catch (err) {
          console.warn(`Lyrics source ${i + 1} failed`);
        }
      }

      if (!cancelled) {
        setError("All lyric sources failed");
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [artist, title]);

  return { lyrics, loading, error };
}
