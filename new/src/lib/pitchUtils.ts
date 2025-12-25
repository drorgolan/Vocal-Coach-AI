// src/lib/pitchUtils.ts - COMPLETE PITCH UTILITIES

// Note frequencies (A4 = 440Hz)
export const noteFrequencies: Record<string, number> = {
  'C0': 16.35, 'C#0': 17.32, 'D0': 18.35, 'D#0': 19.45, 'E0': 20.60, 'F0': 21.83,
  'F#0': 23.12, 'G0': 24.50, 'G#0': 25.96, 'A0': 27.50, 'A#0': 29.14, 'B0': 30.87,
  'C1': 32.70, 'C#1': 34.65, 'D1': 36.71, 'D#1': 38.89, 'E1': 41.20, 'F1': 43.65,
  'F#1': 46.25, 'G1': 49.00, 'G#1': 51.91, 'A1': 55.00, 'A#1': 58.27, 'B1': 61.74,
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31,
  'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
  'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
  'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
  'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91,
  'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
};

// Get note name from frequency
export const getNoteName = (frequency: number | null): string => {
  if (!frequency || frequency < 16 || frequency > 2000) return '-';
  
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  
  const halfSteps = 12 * Math.log2(frequency / C0);
  const noteIndex = Math.round(halfSteps) % 12;
  const octave = Math.floor(Math.round(halfSteps) / 12);
  
  return `${noteNames[noteIndex]}${octave}`;
};

// Calculate cents offset from perfect pitch
export const getCentsOffset = (frequency: number | null): number => {
  if (!frequency || frequency < 16 || frequency > 2000) return 0;
  
  const A4 = 440;
  const C0 = A4 * Math.pow(2, -4.75);
  const halfSteps = 12 * Math.log2(frequency / C0);
  const nearestNote = Math.round(halfSteps);
  
  return Math.round((halfSteps - nearestNote) * 100);
};

// Check if pitch is on target (within tolerance)
export const isPitchOnTarget = (
  actualFrequency: number | null,
  targetFrequency: number,
  toleranceCents: number = 25
): boolean => {
  if (!actualFrequency) return false;
  
  const cents = getCentsOffset(actualFrequency);
  const targetCents = getCentsOffset(targetFrequency);
  
  return Math.abs(cents - targetCents) <= toleranceCents;
};

// Calculate pitch accuracy percentage
export const calculatePitchAccuracy = (
  actualFrequency: number | null,
  targetFrequency: number
): number => {
  if (!actualFrequency) return 0;
  
  const cents = Math.abs(getCentsOffset(actualFrequency) - getCentsOffset(targetFrequency));
  
  // Perfect = 0 cents, worst acceptable = 50 cents
  if (cents >= 50) return 0;
  
  return Math.round((1 - cents / 50) * 100);
};

// Get frequency from note name
export const getFrequencyFromNote = (noteName: string): number | null => {
  return noteFrequencies[noteName] || null;
};

// Check if frequency is in vocal range
export const isVocalRange = (frequency: number | null): boolean => {
  if (!frequency) return false;
  return frequency >= 80 && frequency <= 1000; // Typical vocal range
};

// Format frequency for display
export const formatFrequency = (frequency: number | null): string => {
  if (!frequency) return '-';
  return `${frequency.toFixed(1)} Hz`;
};

// Get pitch color based on accuracy
export const getPitchColor = (centsOffset: number): string => {
  const absCents = Math.abs(centsOffset);
  if (absCents < 10) return 'text-green-500';
  if (absCents < 30) return 'text-yellow-500';
  return 'text-red-500';
};

// Calculate pitch stability score
export interface PitchHistoryPoint {
  frequency: number;
  timestamp: number;
}

export const calculateStability = (history: PitchHistoryPoint[]): number => {
  if (history.length < 10) return 0;
  
  const frequencies = history.map(p => p.frequency);
  const avg = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
  const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / frequencies.length;
  
  // Lower variance = higher stability
  const stability = Math.max(0, 100 - Math.sqrt(variance));
  return Math.round(stability);
};

// Detect if singing or just talking
export const isSinging = (
  frequency: number | null,
  audioLevel: number,
  minAudioLevel: number = 0.02
): boolean => {
  if (!frequency || audioLevel < minAudioLevel) return false;
  return isVocalRange(frequency);
};

// Get vocal range category
export const getVocalRangeCategory = (frequency: number | null): string => {
  if (!frequency) return 'Unknown';
  
  if (frequency < 130) return 'Bass';
  if (frequency < 196) return 'Tenor';
  if (frequency < 262) return 'Alto';
  if (frequency < 392) return 'Soprano';
  return 'High Soprano';
};

// Compare two pitches and get the difference in semitones
export const getSemitoneDifference = (freq1: number, freq2: number): number => {
  return Math.round(12 * Math.log2(freq1 / freq2));
};