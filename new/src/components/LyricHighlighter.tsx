// components/LyricHighlighter.tsx
import React, { useEffect, useRef } from "react";
import type { LyricLine } from "../types/lyrics";

type LyricHighlighterProps = {
  lines: LyricLine[];
  currentLineIndex: number;
  currentTime: number;
  className?: string;
};

export const LyricHighlighter: React.FC<LyricHighlighterProps> = ({
  lines,
  currentLineIndex,
  currentTime,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Smooth scroll to active line
  useEffect(() => {
    if (!activeLineRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const active = activeLineRef.current;

    const offset =
      active.offsetTop -
      container.offsetTop -
      container.clientHeight / 2 +
      active.clientHeight / 2;

    container.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, [currentLineIndex]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflowY: "auto",
        maxHeight: "300px",
        padding: "8px 0",
      }}
    >
      {lines.map((line, index) => {
        const isActive = index === currentLineIndex;
        const ref = isActive ? activeLineRef : undefined;

        const lineStart = line.start;
        const lineEnd = line.start + line.dur;
        const lineProgress =
          currentTime <= lineStart
            ? 0
            : currentTime >= lineEnd
            ? 1
            : (currentTime - lineStart) / (lineEnd - lineStart || 1);

        return (
          <div
            key={line.id}
            ref={ref}
            style={{
              padding: "4px 12px",
              fontSize: "16px",
              lineHeight: 1.5,
              opacity: isActive ? 1 : 0.6,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#fff" : "#ccc",
              background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
              borderRadius: 4,
              transition: "all 120ms ease-out",
            }}
          >
            {/* WORD-LEVEL KARAOKE */}
            {line.words && line.words.length > 0 ? (
              line.words.map((w) => {
                const wordMid = (w.start + w.end) / 2;
                const filled = currentTime >= wordMid;

                return (
                  <span
                    key={w.id}
                    style={{
                      color: filled ? "#f472b6" : "#ccc", // pink highlight
                      transition: "color 120ms linear",
                    }}
                  >
                    {w.text}{" "}
                  </span>
                );
              })
            ) : (
              // LINE-LEVEL GRADIENT FILL
              <span
                style={{
                  background: isActive
                    ? `linear-gradient(to right, #f472b6 ${lineProgress * 100}%, #ffffff20 0%)`
                    : "transparent",
                  WebkitBackgroundClip: isActive ? "text" : "initial",
                  WebkitTextFillColor: isActive ? "transparent" : "inherit",
                  transition: "background-size 120ms linear",
                }}
              >
                {line.text}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
