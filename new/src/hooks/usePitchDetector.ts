import { useCallback, useRef, useState } from "react";

export interface PitchData {
  noteName: string;
  cents: number;
  frequency: number;
}

export const usePitchDetection = () => {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const start = useCallback(async (stream: MediaStream) => {
    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;
    source.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);

    const detect = () => {
      analyser.getFloatTimeDomainData(buffer);

      const freq = autoCorrelate(buffer, audioContext.sampleRate);
      if (freq !== -1) {
        const note = frequencyToNote(freq);
        const cents = centsOffFromPitch(freq, note.frequency);

        setPitchData({
          noteName: note.name,
          cents,
          frequency: freq,
        });
      }

      rafRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    sourceRef.current?.disconnect();
    analyserRef.current?.disconnect();
    audioContextRef.current?.close();

    rafRef.current = null;
    sourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;

    setPitchData(null);
  }, []);

  return {
    pitchData,
    start,
    stop,
  };
};

/* ------------------ helpers ------------------ */

function autoCorrelate(buffer: Float32Array, sampleRate: number) {
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) return -1;

  for (let offset = 8; offset < 1000; offset++) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i++) {
      correlation += buffer[i] * buffer[i + offset];
    }
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  return bestOffset > 0 ? sampleRate / bestOffset : -1;
}

function frequencyToNote(freq: number) {
  const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
  const index = Math.round(noteNum) + 69;
  const name = noteStrings[index % 12];
  const frequency = 440 * Math.pow(2, (index - 69) / 12);
  return { name, frequency };
}

function centsOffFromPitch(freq: number, refFreq: number) {
  return Math.floor(1200 * Math.log2(freq / refFreq));
}
