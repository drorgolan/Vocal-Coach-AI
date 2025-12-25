// src/hooks/useAudioRecorder.ts - FIXED VERSION
import { useCallback, useEffect, useRef, useState } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioLevel: number;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  recordingUrl: string | null;
  clearRecording: () => void;
  stream: MediaStream | null;
}

const pickMimeType = () => {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  if (typeof MediaRecorder === "undefined") return null;
  return types.find(t => MediaRecorder.isTypeSupported(t)) ?? null;
};

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number>();

  const clearRecording = useCallback(() => {
    if (recordingUrl) {
      // Don't use URL.revokeObjectURL in artifacts - it can cause issues
      // Just clear the reference
      setRecordingUrl(null);
    }
  }, [recordingUrl]);

  const updateLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    setAudioLevel(avg / 255);
    rafRef.current = requestAnimationFrame(updateLevel);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      clearRecording();
      setError(null);

      // Request microphone access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false
        }
      });
      setStream(mediaStream);

      // Create audio context (only after user interaction)
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      await ctx.resume();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      ctx.createMediaStreamSource(mediaStream).connect(analyser);

      const mime = pickMimeType();
      const recorder = new MediaRecorder(mediaStream, mime ? { mimeType: mime } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      recorder.start();
      setIsRecording(true);
      updateLevel();
      return true;
    } catch (e: any) {
      console.error('Recording error:', e);
      setError(e.message || "Microphone permission denied");
      return false;
    }
  }, [clearRecording, updateLevel]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return new Promise<Blob | null>(resolve => {
      const rec = recorderRef.current;
      if (!rec) return resolve(null);

      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        
        stream?.getTracks().forEach(t => t.stop());
        audioCtxRef.current?.close();
        setStream(null);
        resolve(blob);
      };
      rec.stop();
    });
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      stream?.getTracks().forEach(t => t.stop());
      audioCtxRef.current?.close();
    };
  }, [stream]);

  return {
    isRecording,
    audioLevel,
    startRecording,
    stopRecording,
    error,
    recordingUrl,
    clearRecording,
    stream
  };
};