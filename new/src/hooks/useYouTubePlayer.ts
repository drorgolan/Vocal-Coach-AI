// src/hooks/useYouTubePlayer.ts - FIXED VERSION
import { useState } from "react";

export const useYouTubeSearch = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (q: string) => {
    setLoading(true);
    
    try {
      // Use Invidious API (no API key needed)
      const res = await fetch(
        `https://yewtu.be/api/v1/search?q=${encodeURIComponent(q + " karaoke")}&type=video`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();

      const mapped = data.slice(0, 10).map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        channel: v.author || 'Unknown',
      }));

      setResults(mapped);
    } catch (error) {
      console.error('YouTube search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, search, loading };
};