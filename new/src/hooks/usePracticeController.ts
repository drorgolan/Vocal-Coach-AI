// hooks/usePracticeController.ts
import { useEffect, useState } from "react";
import type { LyricLine } from "../types/lyrics";

export function usePracticeController(
  lines: LyricLine[],
  currentTime: number,
  setCurrentTime: (t: number) => void
) {
  const [loopStart, setLoopStart] = useState<number | null>(null);
  const [loopEnd, setLoopEnd] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Jump to a specific line
  function jumpToLine(index: number) {
    if (!lines[index]) return;
    setCurrentTime(lines[index].start);
  }

  // Set loop range by line indexes
  function setLoopByLines(startIndex: number, endIndex: number) {
    if (!lines[startIndex] || !lines[endIndex]) return;
    setLoopStart(lines[startIndex].start);
    setLoopEnd(lines[endIndex].start + lines[endIndex].dur);
    setIsLooping(true);
  }

  // Clear loop
  function clearLoop() {
    setLoopStart(null);
    setLoopEnd(null);
    setIsLooping(false);
  }

  // Loop logic
  useEffect(() => {
    if (!isLooping || loopStart == null || loopEnd == null) return;

    if (currentTime >= loopEnd) {
      setCurrentTime(loopStart);
    }
  }, [currentTime, isLooping, loopStart, loopEnd, setCurrentTime]);

  return {
    jumpToLine,
    setLoopByLines,
    clearLoop,
    isLooping,
    loopStart,
    loopEnd,
  };
}
