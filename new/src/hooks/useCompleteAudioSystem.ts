// src/hooks/useCompleteAudioSystem.ts - FIXED VERSION
import { useState, useRef, useCallback, useEffect } from "react";

interface AudioSystemState {
  isRecording: boolean;
  isPlayingMusic: boolean;
  audioLevel: number;
  pitch: number | null;
  toneStability: number;
  error: string | null;
  micMonitorVolume: number;
  musicVolume: number;
}

export const useCompleteAudioSystem = () => {
  const [state, setState] = useState<AudioSystemState>({
    isRecording: false,
    isPlayingMusic: false,
    audioLevel: 0,
    pitch: null,
    toneStability: 0,
    error: null,
    micMonitorVolume: 0.5,
    musicVolume: 0.7,
  });

  // Audio Context & Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Microphone chain
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const micMonitorGainRef = useRef<GainNode | null>(null);
  
  // Music chain
  const musicSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const musicAnalyserRef = useRef<AnalyserNode | null>(null);
  
  // Master output
  const masterGainRef = useRef<GainNode | null>(null);
  
  // Analysis
  const rafRef = useRef<number | null>(null);
  const pitchHistory = useRef<number[]>([]);

  /* ---------------- PITCH DETECTION ---------------- */
  const detectPitch = (buffer: Float32Array, sampleRate: number): number | null => {
    let bestOffset = -1;
    let bestCorr = 0;
    const bufferSize = buffer.length;

    const minOffset = Math.floor(sampleRate / 1000); // 1000Hz
    const maxOffset = Math.floor(sampleRate / 80);   // 80Hz

    for (let offset = minOffset; offset < Math.min(maxOffset, bufferSize / 2); offset++) {
      let corr = 0;
      for (let i = 0; i < bufferSize - offset; i++) {
        corr += buffer[i] * buffer[i + offset];
      }
      
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOffset = offset;
      }
    }

    if (bestOffset > 0 && bestCorr > 0.01) {
      return sampleRate / bestOffset;
    }
    
    return null;
  };

  /* ---------------- ANALYSIS LOOP ---------------- */
  const analyze = useCallback(() => {
    if (!micAnalyserRef.current || !audioCtxRef.current) return;

    const analyser = micAnalyserRef.current;
    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(buffer);

    // Calculate RMS audio level
    const rms = Math.sqrt(
      buffer.reduce((sum, val) => sum + val * val, 0) / bufferLength
    );
    const level = Math.min(1, rms * 5);

    // Pitch detection
    let detectedPitch: number | null = null;
    let stability = 0;

    if (rms > 0.01) {
      const freq = detectPitch(buffer, audioCtxRef.current.sampleRate);
      
      if (freq && freq > 80 && freq < 1000) {
        detectedPitch = freq;
        
        pitchHistory.current.push(freq);
        if (pitchHistory.current.length > 30) {
          pitchHistory.current.shift();
        }

        if (pitchHistory.current.length >= 10) {
          const avg = pitchHistory.current.reduce((a, b) => a + b, 0) / pitchHistory.current.length;
          const variance = pitchHistory.current.reduce((sum, val) => sum + (val - avg) ** 2, 0) / pitchHistory.current.length;
          stability = Math.max(0, 100 - Math.sqrt(variance));
        }
      }
    }

    setState(prev => ({
      ...prev,
      audioLevel: level,
      pitch: detectedPitch,
      toneStability: Math.round(stability)
    }));

    rafRef.current = requestAnimationFrame(analyze);
  }, []);

  /* ---------------- START RECORDING WITH MONITORING ---------------- */
  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Create audio context (MUST be after user interaction)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await audioCtx.resume();
      audioCtxRef.current = audioCtx;

      // Get microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      // Microphone source
      const micSource = audioCtx.createMediaStreamSource(stream);
      micSourceRef.current = micSource;

      // Microphone analyzer (for pitch detection)
      const micAnalyser = audioCtx.createAnalyser();
      micAnalyser.fftSize = 2048;
      micAnalyser.smoothingTimeConstant = 0.8;
      micAnalyserRef.current = micAnalyser;

      // Microphone monitor gain (so you can hear yourself)
      const micMonitorGain = audioCtx.createGain();
      micMonitorGain.gain.value = state.micMonitorVolume;
      micMonitorGainRef.current = micMonitorGain;

      // Master output gain
      const masterGain = audioCtx.createGain();
      masterGain.gain.value = 1.0;
      masterGainRef.current = masterGain;

      // Connect microphone chain
      micSource.connect(micAnalyser); // For pitch detection
      micSource.connect(micMonitorGain); // For monitoring (hearing yourself)
      micMonitorGain.connect(masterGain); // To speakers
      masterGain.connect(audioCtx.destination); // Final output

      setState(prev => ({ ...prev, isRecording: true }));
      analyze();

    } catch (e) {
      const err = e as Error;
      setState(prev => ({ 
        ...prev, 
        error: `Microphone access denied: ${err.message}` 
      }));
    }
  }, [analyze, state.micMonitorVolume]);

  /* ---------------- STOP RECORDING ---------------- */
  const stopRecording = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    // Don't close audio context if music is playing
    if (!state.isPlayingMusic && audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      audioLevel: 0,
      pitch: null,
      toneStability: 0
    }));
    pitchHistory.current = [];
  }, [state.isPlayingMusic]);

  /* ---------------- CONNECT MUSIC/BACKING TRACK ---------------- */
  const connectMusicElement = useCallback((audioElement: HTMLAudioElement) => {
    if (!audioCtxRef.current) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;
    }

    const ctx = audioCtxRef.current;

    // Create music source from <audio> element
    const musicSource = ctx.createMediaElementSource(audioElement);
    musicSourceRef.current = musicSource;

    // Music gain control
    const musicGain = ctx.createGain();
    musicGain.gain.value = state.musicVolume;
    musicGainRef.current = musicGain;

    // Music analyzer (optional, for visualization)
    const musicAnalyser = ctx.createAnalyser();
    musicAnalyser.fftSize = 2048;
    musicAnalyserRef.current = musicAnalyser;

    // Master gain (if not created yet)
    if (!masterGainRef.current) {
      const masterGain = ctx.createGain();
      masterGain.gain.value = 1.0;
      masterGainRef.current = masterGain;
      masterGain.connect(ctx.destination);
    }

    // Connect music chain
    musicSource.connect(musicAnalyser);
    musicAnalyser.connect(musicGain);
    musicGain.connect(masterGainRef.current);

  }, [state.musicVolume]);

  /* ---------------- VOLUME CONTROLS ---------------- */
  const setMicMonitorVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, micMonitorVolume: volume }));
    if (micMonitorGainRef.current && audioCtxRef.current) {
      micMonitorGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setState(prev => ({ ...prev, musicVolume: volume }));
    if (musicGainRef.current && audioCtxRef.current) {
      musicGainRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
    }
  }, []);

  /* ---------------- CLEANUP ---------------- */
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    connectMusicElement,
    setMicMonitorVolume,
    setMusicVolume,
    audioContext: audioCtxRef.current,
    micAnalyser: micAnalyserRef.current,
    musicAnalyser: musicAnalyserRef.current,
  };
};