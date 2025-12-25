// src/services/youtube.ts
export interface YouTubeResult {
  videoId: string;
  title: string;
  author: string;
}

const INVIDIOUS_INSTANCES = [
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://invidious.projectsegfau.lt",
];

export async function searchKaraoke(
  songName: string
): Promise<YouTubeResult[]> {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(
        `${base}/api/v1/search?q=${encodeURIComponent(
          songName + " karaoke"
        )}&type=video`
      );

      if (!res.ok) continue;

      const data = await res.json();

      return data.map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        author: v.author,
      }));
    } catch {
      continue;
    }
  }

  throw new Error("All karaoke servers are down");
}
