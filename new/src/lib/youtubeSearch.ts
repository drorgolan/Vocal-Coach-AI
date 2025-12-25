export interface YouTubeResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
}

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYouTube(query: string): Promise<YouTubeResult[]> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(
      query
    )}&key=${API_KEY}`
  );

  const json = await res.json();

  return json.items.map((item: any) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium.url,
  }));
}
