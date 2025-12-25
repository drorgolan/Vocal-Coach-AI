import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PitchData } from '@/hooks/usePitchDetection';

interface Chord {
  note: string;
  time: number; // seconds from start
}

interface ChordScrollerProps {
  isActive: boolean;
  pitchData: PitchData | null;
  onScoreChange?: (score: number, total: number) => void;
}

// Demo chord progression
const DEMO_CHORDS: Chord[] = [
  { note: 'C', time: 0 },
  { note: 'G', time: 2 },
  { note: 'A', time: 4 },
  { note: 'F', time: 6 },
  { note: 'C', time: 8 },
  { note: 'G', time: 10 },
  { note: 'E', time: 12 },
  { note: 'A', time: 14 },
  { note: 'D', time: 16 },
  { note: 'G', time: 18 },
  { note: 'C', time: 20 },
  { note: 'F', time: 22 },
];

function getChordStatus(targetNote: string, detectedNote: string | null): 'waiting' | 'hit' | 'close' | 'miss' {
  if (!detectedNote) return 'waiting';
  
  const target = targetNote.replace(/[0-9]/g, '').toUpperCase();
  const detected = detectedNote.replace(/[0-9]/g, '').toUpperCase();
  
  if (target === detected) return 'hit';
  
  // Check if it's close (semitone away)
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const targetIdx = notes.indexOf(target);
  const detectedIdx = notes.indexOf(detected);
  
  if (targetIdx === -1 || detectedIdx === -1) return 'miss';
  
  const diff = Math.abs(targetIdx - detectedIdx);
  if (diff === 1 || diff === 11) return 'close';
  
  return 'miss';
}

const statusColors = {
  waiting: 'bg-muted border-border',
  hit: 'bg-success/30 border-success',
  close: 'bg-warning/30 border-warning',
  miss: 'bg-destructive/30 border-destructive',
};

const statusPoints = {
  waiting: 0,
  hit: 100,
  close: 50,
  miss: 0,
};

export default function ChordScroller({ isActive, pitchData, onScoreChange }: ChordScrollerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [chordStatuses, setChordStatuses] = useState<Record<number, 'waiting' | 'hit' | 'close' | 'miss'>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Timer for scrolling
  useEffect(() => {
    if (!isActive) {
      startTimeRef.current = null;
      setElapsedTime(0);
      setChordStatuses({});
      return;
    }
    
    startTimeRef.current = Date.now();
    
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime((Date.now() - startTimeRef.current) / 1000);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // Update chord status based on pitch
  useEffect(() => {
    if (!isActive || !pitchData) return;
    
    const currentChordIndex = DEMO_CHORDS.findIndex((chord, idx) => {
      const nextChord = DEMO_CHORDS[idx + 1];
      return elapsedTime >= chord.time && (!nextChord || elapsedTime < nextChord.time);
    });
    
    if (currentChordIndex === -1) return;
    
    const chord = DEMO_CHORDS[currentChordIndex];
    const status = getChordStatus(chord.note, pitchData.note);
    
    setChordStatuses(prev => {
      // Only update if it's a better result
      const currentStatus = prev[currentChordIndex];
      if (!currentStatus || 
          (status === 'hit') || 
          (status === 'close' && currentStatus !== 'hit')) {
        return { ...prev, [currentChordIndex]: status };
      }
      return prev;
    });
  }, [isActive, pitchData, elapsedTime]);
  
  // Calculate and report score
  useEffect(() => {
    const totalPossible = Object.keys(chordStatuses).length * 100;
    const score = Object.values(chordStatuses).reduce((sum, status) => sum + statusPoints[status], 0);
    onScoreChange?.(score, totalPossible);
  }, [chordStatuses, onScoreChange]);
  
  // Calculate voice cursor Y position based on cents
  const voiceCursorY = pitchData 
    ? 50 - (pitchData.cents / 50) * 40 // Map cents to percentage
    : 50;
  
  return (
    <div className="relative w-full h-40 overflow-hidden rounded-xl bg-card/50 border border-border">
      {/* Voice cursor - vertical line that moves based on pitch */}
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-primary/50 z-10" />
      
      {/* Voice pitch indicator */}
      {isActive && pitchData && (
        <motion.div
          className="absolute left-14 w-5 h-5 rounded-full bg-primary glow-primary z-20"
          animate={{ top: `${voiceCursorY}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ marginTop: '-10px' }}
        />
      )}
      
      {/* Scrolling chords container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center"
        style={{ paddingLeft: '80px' }}
      >
        <motion.div 
          className="flex items-center gap-4 h-full"
          animate={{ x: -elapsedTime * 60 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0 }}
        >
          {DEMO_CHORDS.map((chord, idx) => {
            const status = chordStatuses[idx] || 'waiting';
            const isCurrent = elapsedTime >= chord.time && 
              (idx === DEMO_CHORDS.length - 1 || elapsedTime < DEMO_CHORDS[idx + 1].time);
            
            return (
              <motion.div
                key={idx}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 flex items-center justify-center font-bold text-xl transition-colors ${statusColors[status]} ${isCurrent ? 'ring-2 ring-primary scale-110' : ''}`}
                style={{ marginLeft: idx === 0 ? chord.time * 60 : (chord.time - DEMO_CHORDS[idx - 1].time - 2) * 60 }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isCurrent ? 1 : 0.7 }}
              >
                {chord.note}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 flex gap-2 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-success/50" /> Hit
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-warning/50" /> Close
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-destructive/50" /> Miss
        </span>
      </div>
      
      {/* Current detected note */}
      {pitchData && (
        <div className="absolute top-2 left-2 px-2 py-1 rounded bg-primary/20 text-primary text-sm font-mono">
          {pitchData.noteName} ({pitchData.cents > 0 ? '+' : ''}{pitchData.cents}¢)
        </div>
      )}
    </div>
  );
}
