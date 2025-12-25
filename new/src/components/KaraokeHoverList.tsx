import { useState } from "react";
import YouTube from "react-youtube";
import { karaokeSongs, KaraokeSong } from "@/data/karaokeSongs";

interface Props {
  onSelect: (song: KaraokeSong) => void;
}

const KaraokeHoverList = ({ onSelect }: Props) => {
  const [hoveredSong, setHoveredSong] = useState<KaraokeSong | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Song Library</h3>

      <div className="max-h-[320px] overflow-y-auto space-y-2">
        {karaokeSongs.map((song) => (
          <div
            key={song.videoId}
            className="p-3 rounded-lg bg-card hover:bg-accent cursor-pointer transition"
            onMouseEnter={() => setHoveredSong(song)}
            onMouseLeave={() => setHoveredSong(null)}
            onClick={() => onSelect(song)}
          >
            <p className="font-medium">{song.title}</p>
            <p className="text-sm text-muted-foreground">{song.artist}</p>
          </div>
        ))}
      </div>

      {/* 🎤 Hover Karaoke Preview */}
      {hoveredSong && (
        <div className="mt-4 rounded-lg overflow-hidden border">
          <YouTube
            videoId={hoveredSong.videoId}
            opts={{
              height: "180",
              width: "100%",
              playerVars: {
                autoplay: 1,
                mute: 1,
                controls: 0,
                modestbranding: 1,
              },
            }}
          />
          <p className="text-sm text-center mt-1 text-muted-foreground">
            Hover preview
          </p>
        </div>
      )}
    </div>
  );
};

export default KaraokeHoverList;
