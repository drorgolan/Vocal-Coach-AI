// src/types/lyrics.ts

export type LyricWord = {
  id: string;
  text: string;
  start: number; // seconds
  end: number;   // seconds
};

export type LyricLine = {
  id: string;
  text: string;
  start: number;
  dur: number;
  // optional word-level timing
  words?: LyricWord[];
};

export type CaptionLine = {
  start: number;
  dur: number;
  text: string;
  // if caption source already supports words later
  words?: LyricWord[];
};

export type LyricSource = "captions" | "api" | "manual" | "whisper" | "none";
