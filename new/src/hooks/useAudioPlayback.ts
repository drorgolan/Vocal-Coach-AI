// src/hooks/useAudioPlayback.ts - NEW FILE
export const useAudioPlayback = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainRef = useRef<GainNode | null>(null);
  const musicGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const setupAudioMixer = async (micStream: MediaStream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Microphone monitoring (user can hear themselves)
    const micSource = ctx.createMediaStreamSource(micStream);
    const micGain = ctx.createGain();
    micGain.gain.value = 0.5; // Adjustable mic monitoring volume

    micSource.connect(micGain);
    
    // Music/backing track gain
    const musicGain = ctx.createGain();
    musicGain.gain.value = 0.7; // Backing track volume

    // Master output
    const masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;

    // Connect everything to speakers
    micGain.connect(masterGain);
    musicGain.connect(masterGain);
    masterGain.connect(ctx.destination);

    micSourceRef.current = micSource;
    micGainRef.current = micGain;
    musicGainRef.current = musicGain;
    masterGainRef.current = masterGain;
  };

  const setMicMonitorVolume = (volume: number) => {
    if (micGainRef.current) {
      micGainRef.current.gain.value = volume;
    }
  };

  const setMusicVolume = (volume: number) => {
    if (musicGainRef.current) {
      musicGainRef.current.gain.value = volume;
    }
  };

  return {
    setupAudioMixer,
    setMicMonitorVolume,
    setMusicVolume,
    musicGainNode: musicGainRef.current
  };
};