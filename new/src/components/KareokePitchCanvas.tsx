// components/KaraokePitchCanvas.tsx
import React, { useEffect, useRef } from "react";
import type { LyricLine } from "../types/lyrics";

export  type WordScore = "good" | "almost" | "bad" | null;

interface Props {
  lines: LyricLine[];
  currentTime: number;
  pitchHz: number | null;
  duration: number;
  wordScores: Record<string, WordScore>;
}

export const KaraokePitchCanvas: React.FC<Props> = ({
  lines,
  currentTime,
  pitchHz,
  duration,
  wordScores,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resize canvas to match CSS size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#050012";
    ctx.fillRect(0, 0, w, h);

    // Time window (4 seconds)
    const windowSize = 4;
    const half = windowSize / 2;
    const tMin = currentTime - half;
    const tMax = currentTime + half;

    const timeToX = (t: number) => ((t - tMin) / (tMax - tMin)) * w;

    // Pitch range (MIDI 40–80)
    const midiMin = 40;
    const midiMax = 80;

    const hzToMidi = (hz: number) => 69 + 12 * Math.log2(hz / 440);
    const midiToY = (m: number) =>
      h - ((m - midiMin) / (midiMax - midiMin)) * h;

    // Draw word bars
    lines.forEach((line) => {
      if (!line.words) return;

      line.words.forEach((word, i) => {
        const x1 = timeToX(word.start);
        const x2 = timeToX(word.end);

        if (x2 < 0 || x1 > w) return;

        // TEMP: place words on rows (later: use target pitch)
        const row = i % 4;
        const y = h * 0.25 + row * (h * 0.15);

        const score = wordScores[word.id];
        let color = "rgba(148,163,184,0.6)";
        if (score === "good") color = "rgba(16,185,129,0.9)";
        else if (score === "almost") color = "rgba(249,115,22,0.9)";
        else if (score === "bad") color = "rgba(239,68,68,0.9)";

        ctx.fillStyle = color;
        ctx.fillRect(x1, y - 8, x2 - x1, 16);

        ctx.fillStyle = "#e5e7eb";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(word.text, (x1 + x2) / 2, y - 12);
      });
    });

    // Draw pitch bubble
    if (pitchHz && pitchHz > 50 && pitchHz < 1000) {
      const midi = hzToMidi(pitchHz);
      const x = timeToX(currentTime);
      const y = midiToY(Math.max(midiMin, Math.min(midiMax, midi)));

      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#f472b6";
      ctx.shadowColor = "#f472b6";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw center time line
    const cx = timeToX(currentTime);
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.stroke();
  }, [lines, currentTime, pitchHz, duration, wordScores]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-xl bg-black/70 border border-white/10"
    />
  );
};
