import { forwardRef, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WaveVisualizerProps {
  active?: boolean;
  barCount?: number;
  className?: string;
  audioLevel?: number;
}

const WaveVisualizer = forwardRef<HTMLDivElement, WaveVisualizerProps>(
  ({ active = false, barCount = 12, className = '', audioLevel = 0 }, ref) => {
    const barsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
      if (!active) return;

      const updateBars = () => {
        barsRef.current.forEach((bar, i) => {
          if (!bar) return;
          
          // Create variation based on position and audio level
          const baseHeight = 8;
          const maxAdditional = audioLevel > 0 ? audioLevel * 56 : 48;
          const variation = Math.sin(Date.now() / 200 + i * 0.5) * 0.5 + 0.5;
          const height = baseHeight + variation * maxAdditional * (audioLevel > 0 ? audioLevel : Math.random());
          
          bar.style.height = `${height}px`;
        });
      };

      const interval = setInterval(updateBars, 50);
      return () => clearInterval(interval);
    }, [active, audioLevel]);

    return (
      <div ref={ref} className={`flex items-end justify-center gap-1 h-16 ${className}`}>
        {Array.from({ length: barCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { barsRef.current[i] = el; }}
            className="w-1 rounded-full bg-gradient-to-t from-primary to-secondary transition-all duration-75"
            style={{ height: 8 }}
          />
        ))}
      </div>
    );
  }
);

WaveVisualizer.displayName = 'WaveVisualizer';

export default WaveVisualizer;
