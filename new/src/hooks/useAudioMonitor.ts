import { useCallback, useEffect, useRef, useState } from "react";

type MonitorFxMode = "off" | "vocal";

interface StartOptions {
  volume: number; // 0..1
  fxMode: MonitorFxMode;
}

interface UseAudioMonitorReturn {
  isMonitoring: boolean;
  start: (stream: MediaStream, options: StartOptions) => Promise<void>;
  stop: () => void;
  setVolume: (volume: number) => void;
  setFxMode: (mode: MonitorFxMode) => void;
}

const createSoftClipper = (audioContext: AudioContext) => {
  const shaper = audioContext.createWaveShaper();
  const n = 2048;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = Math.tanh(2.2 * x);
  }
  shaper.curve = curve;
  shaper.oversample = "2x";
  return shaper;
};

export const useAudioMonitor = (): UseAudioMonitorReturn => {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const presenceFilterRef = useRef<BiquadFilterNode | null>(null);
  const shaperRef = useRef<WaveShaperNode | null>(null);

  const fxModeRef = useRef<MonitorFxMode>("off");

  const teardown = useCallback(() => {
    try {
      sourceRef.current?.disconnect();
    } catch {
      // ignore
    }
    sourceRef.current = null;

    try {
      compressorRef.current?.disconnect();
    } catch {
      // ignore
    }
    compressorRef.current = null;

    try {
      presenceFilterRef.current?.disconnect();
    } catch {
      // ignore
    }
    presenceFilterRef.current = null;

    try {
      shaperRef.current?.disconnect();
    } catch {
      // ignore
    }
    shaperRef.current = null;

    try {
      gainRef.current?.disconnect();
    } catch {
      // ignore
    }
    gainRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsMonitoring(false);
  }, []);

  const connectGraph = useCallback(
    (audioContext: AudioContext, stream: MediaStream, options: StartOptions) => {
      const source = audioContext.createMediaStreamSource(stream);
      const gain = audioContext.createGain();
      gain.gain.value = Math.max(0, Math.min(1, options.volume));

      sourceRef.current = source;
      gainRef.current = gain;

      if (options.fxMode === "vocal") {
        const compressor = audioContext.createDynamicsCompressor();
        compressor.threshold.value = -24;
        compressor.knee.value = 24;
        compressor.ratio.value = 8;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        const presence = audioContext.createBiquadFilter();
        presence.type = "peaking";
        presence.frequency.value = 3200;
        presence.Q.value = 1.0;
        presence.gain.value = 3.5;

        const shaper = createSoftClipper(audioContext);

        compressorRef.current = compressor;
        presenceFilterRef.current = presence;
        shaperRef.current = shaper;

        source.connect(compressor);
        compressor.connect(presence);
        presence.connect(shaper);
        shaper.connect(gain);
        gain.connect(audioContext.destination);
      } else {
        source.connect(gain);
        gain.connect(audioContext.destination);
      }
    },
    []
  );

  const start = useCallback(
    async (stream: MediaStream, options: StartOptions) => {
      teardown();

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      fxModeRef.current = options.fxMode;

      await audioContext.resume().catch(() => undefined);
      connectGraph(audioContext, stream, options);
      setIsMonitoring(true);
    },
    [connectGraph, teardown]
  );

  const stop = useCallback(() => {
    teardown();
  }, [teardown]);

  const setVolume = useCallback((volume: number) => {
    const gain = gainRef.current;
    if (!gain) return;
    gain.gain.value = Math.max(0, Math.min(1, volume));
  }, []);

  const setFxMode = useCallback(
    (mode: MonitorFxMode) => {
      fxModeRef.current = mode;
      // Changing FX live would require rebuilding the graph. Keep it simple.
    },
    []
  );

  useEffect(() => stop, [stop]);

  return { isMonitoring, start, stop, setVolume, setFxMode };
};
