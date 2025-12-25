interface Props {
  videoId: string;
  autoplay?: boolean;
  muted?: boolean;
}

export default function KaraokePlayer({
  videoId,
  autoplay = false,
  muted = false,
}: Props) {
  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: autoplay ? "1" : "0",
    mute: muted ? "1" : "0",
    controls: "0",
    modestbranding: "1",
  });

  return (
    <div className="aspect-video w-full rounded overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params}`}
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}
