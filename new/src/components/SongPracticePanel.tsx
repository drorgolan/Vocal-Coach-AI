// components/SongPracticePanel.tsx
import React, { useState } from "react";
import { useSongLyrics } from "../hooks/useSongLyrics";
import { useLyricTimeline } from "../hooks/useLyricTimeline";
import { LyricHighlighter } from "./LyricHighlighter";

// Assume you already have currentTime from your player:
type Props = {
  videoId: string;
  artist: string;
  title: string;
  currentTime: number; // seconds
};

export const SongPracticePanel: React.FC<Props> = ({
  videoId,
  artist,
  title,
  currentTime,
}) => {
  const [manualLyrics, setManualLyrics] = useState<string>("");

  const { lines, source, isLoading, needsManualInput } = useSongLyrics({
    videoId,
    artist,
    title,
    manualLyrics,
  });

  const { currentLineIndex } = useLyricTimeline(lines, currentTime);

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div style={{ flex: 1 }}>
        <h3>Lyrics ({source})</h3>
        {isLoading && <div>Loading lyrics…</div>}
        {!isLoading && lines.length > 0 && (
          <LyricHighlighter lines={lines} currentLineIndex={currentLineIndex} />
        )}
        {!isLoading && lines.length === 0 && (
          <div>No lyrics found yet.</div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <h3>Manual lyrics (fallback)</h3>
        <textarea
          value={manualLyrics}
          onChange={(e) => setManualLyrics(e.target.value)}
          placeholder={
            needsManualInput
              ? "Paste lyrics here…"
              : "You can override lyrics by pasting here…"
          }
          style={{
            width: "100%",
            height: 260,
            resize: "vertical",
            background: "#111",
            color: "#eee",
            padding: 8,
          }}
        />
        <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
          Source priority: YouTube captions → Lyrics API → Manual.
        </p>
      </div>
    </div>
  );
};
