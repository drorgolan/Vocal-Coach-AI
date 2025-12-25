// src/pages/Practice.tsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { usePracticeController } from "../hooks/usePracticeController";
import { LyricHighlighter } from "../components/LyricHighlighter";
import { useUnifiedLyrics } from "@/hooks/useUnifiedLyrics";
import { KaraokePitchCanvas, WordScore } from "@/components/KareokePitchCanvas";
import { LyricLine } from "@/types/lyrics";


async function loadCachedLyrics(songId: string) {
  const res = await fetch(`/lyrics-cache/${songId}.json`);
  if (res.ok) return await res.json();
  return null;
}

async function analyzeLyrics(songId: string, rawLyrics: string) {
  await fetch("/analyze-lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ songId, lyrics: rawLyrics }),
  });

  // After saving, reload the cached file
  return await loadCachedLyrics(songId);
}


// -----------------------------
// Types
// -----------------------------
interface PracticeSong {
  title: string;
  artist: string;
  videoId: string;
  audioUrl: string; // backing track audio URL
  duration?: number;
}

interface LyricSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  chord: string;
}

type SegmentQuality = "good" | "almost" | "bad" | null;

// -----------------------------
// Pitch utilities
// -----------------------------
function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

function midiToHz(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Simple autocorrelation-based pitch detection
function detectPitch(
  timeDomain: Float32Array,
  sampleRate: number
): number | null {
  const SIZE = timeDomain.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);
  let bestOffset = -1;
  let bestCorrelation = 0;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    const val = timeDomain[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null; // too quiet

  let lastCorrelation = 1;
  for (let offset = 1; offset < MAX_SAMPLES; offset++) {
    let correlation = 0;

    for (let i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(timeDomain[i] - timeDomain[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;

    if (correlation > 0.9 && correlation > lastCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    } else if (bestCorrelation > 0.9 && correlation < lastCorrelation) {
      const pitch = sampleRate / bestOffset;
      return pitch;
    }
    lastCorrelation = correlation;
  }

  if (bestCorrelation > 0.9 && bestOffset !== -1) {
    const pitch = sampleRate / bestOffset;
    return pitch;
  }

  return null;
}

// -----------------------------
// Very simple chord guesser
// -----------------------------
const CHORD_ROOTS = [
  { name: "C", midi: 60 },
  { name: "D", midi: 62 },
  { name: "E", midi: 64 },
  { name: "F", midi: 65 },
  { name: "G", midi: 67 },
  { name: "A", midi: 69 },
  { name: "B", midi: 71 },
  { name: "Am", midi: 69 },
  { name: "Em", midi: 64 },
  { name: "Dm", midi: 62 },
];

function guessChordFromPitchHz(pitchHz: number | null): string {
  if (!pitchHz) return "C";
  const midi = hzToMidi(pitchHz);
  let best = CHORD_ROOTS[0].name;
  let bestDist = Infinity;
  for (const c of CHORD_ROOTS) {
    const d = Math.abs(c.midi - midi);
    if (d < bestDist) {
      bestDist = d;
      best = c.name;
    }
  }
  return best;
}

// -----------------------------
// Auto timing from audio energy
// -----------------------------
async function computeSegmentsFromAudio(
  audioUrl: string,
  lyricsLines: string[]
): Promise<LyricSegment[]> {
  const context = new AudioContext();
  const res = await fetch(audioUrl, { mode: "cors" });
  const arrayBuffer = await res.arrayBuffer();
  const buffer = await context.decodeAudioData(arrayBuffer);

  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  const totalDuration = buffer.duration;

  const frameDuration = 0.2; // seconds
  const frameSize = Math.floor(sampleRate * frameDuration);
  const energies: number[] = [];

  for (let i = 0; i < channelData.length; i += frameSize) {
    let sum = 0;
    const end = Math.min(i + frameSize, channelData.length);
    for (let j = i; j < end; j++) {
      const v = channelData[j];
      sum += v * v;
    }
    const rms = Math.sqrt(sum / (end - i));
    energies.push(rms);
  }

  const maxEnergy = Math.max(...energies);
  const threshold = maxEnergy * 0.3;

  const speechFrames: number[] = [];
  for (let i = 0; i < energies.length; i++) {
    if (energies[i] > threshold) {
      speechFrames.push(i);
    }
  }

  if (speechFrames.length === 0 || lyricsLines.length === 0) {
    const segmentDuration = totalDuration / Math.max(lyricsLines.length, 1);
    const segments = lyricsLines.map((line, index) => ({
      id: String(index + 1),
      startTime: index * segmentDuration,
      endTime: (index + 1) * segmentDuration,
      text: line,
      chord: "C",
    }));
    context.close();
    return segments;
  }

  const firstSpeechTime = speechFrames[0] * frameDuration;
  const lastSpeechTime =
    speechFrames[speechFrames.length - 1] * frameDuration;
  const singingDuration = Math.max(lastSpeechTime - firstSpeechTime, 4);
  const segmentDuration = singingDuration / lyricsLines.length;

  const segments: LyricSegment[] = lyricsLines.map((line, index) => {
    const startTime = firstSpeechTime + index * segmentDuration;
    const endTime = firstSpeechTime + (index + 1) * segmentDuration;
    return {
      id: String(index + 1),
      startTime,
      endTime,
      text: line,
      chord: "C",
    };
  });

  const fftSize = 2048;
  const tmpBuffer = new Float32Array(fftSize);
  for (const seg of segments) {
    const segCenter = (seg.startTime + seg.endTime) / 2;
    const segIndex = Math.floor(segCenter * sampleRate);

    for (let i = 0; i < fftSize; i++) {
      const idx = segIndex + i - fftSize / 2;
      tmpBuffer[i] = channelData[idx] || 0;
    }

    const pitch = detectPitch(tmpBuffer, sampleRate);
    const chord = guessChordFromPitchHz(pitch);
    seg.chord = chord;
  }

  context.close();
  return segments;
}

// -----------------------------
// Chord progression visualizer
// -----------------------------
interface ChordVisualizerProps {
  script: LyricSegment[];
  currentTime: number;
  duration: number;
  segmentScores: Record<string, SegmentQuality>;
}

const ChordVisualizer: React.FC<ChordVisualizerProps> = ({
  script,
  currentTime,
  duration,
  segmentScores,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#050012";
    ctx.fillRect(0, 0, w, h);

    script.forEach((seg) => {
      const startX = (seg.startTime / (duration || 1)) * w;
      const endX = (seg.endTime / (duration || 1)) * w;
      const width = Math.max(4, endX - startX);

      const quality = segmentScores[seg.id];
      let color = "rgba(148,163,184,0.6)";
      if (quality === "good") color = "rgba(16,185,129,0.9)";
      else if (quality === "almost") color = "rgba(249,115,22,0.9)";
      else if (quality === "bad") color = "rgba(239,68,68,0.9)";

      ctx.fillStyle = color;
      ctx.fillRect(startX, h * 0.45, width, h * 0.2);

      ctx.fillStyle = "#e5e7eb";
      ctx.font = "10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(seg.chord, startX + width / 2, h * 0.4);
    });

    const x = (currentTime / (duration || 1)) * w;
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }, [script, currentTime, duration, segmentScores]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 rounded-xl bg-black/70 border border-white/10"
    />
  );
};

// -----------------------------
// Main component
// -----------------------------
const Practice: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const song = state as PracticeSong | null;
if (!song) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-gray-300">No song selected.</p>
    </div>
  );
}
const [wordScores, setWordScores] = useState<Record<string, WordScore>>({});
const [cachedLyrics, setCachedLyrics] = useState(null);
const [pitchTargets, setPitchTargets] = useState<any[]>([]); // ✅ FIXED

useEffect(() => {
  if (!song?.videoId) return;

  loadCachedLyrics(song.videoId).then((data) => {
    if (data) {
      setCachedLyrics(data);
      setLines(data.lines);
      setPitchTargets(data.pitchTargets);
    }
  });
}, [song?.videoId]);


// Build the actual URL that should hit your server
// Change this to match your real backend route
const audioUrl =
  song.audioUrl || `http://localhost:3001/audio?id=${song.videoId}`;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytRef = useRef<HTMLIFrameElement | null>(null);

  const [script, setScript] = useState<LyricSegment[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [musicVolume, setMusicVolume] = useState(0.7);
  const [micMonitorVolume, setMicMonitorVolume] = useState(0.5);

  const [pitch, setPitch] = useState<number | null>(null);
  const [segmentScores, setSegmentScores] = useState<
    Record<string, SegmentQuality>
  >({});
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [lastScoredSegmentId, setLastScoredSegmentId] =
    useState<string | null>(null);

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isAutotuneProcessing, setIsAutotuneProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pitchDataRef = useRef<Float32Array | null>(null);
  const pitchAnimationRef = useRef<number | null>(null);

  const tunedContextRef = useRef<AudioContext | null>(null);
  const tunedBufferRef = useRef<AudioBuffer | null>(null);
  const [hasTunedVersion, setHasTunedVersion] = useState(false);

  const [userLyrics, setUserLyrics] = useState<string>("");

  if (!song) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-gray-300">No song selected.</p>
      </div>
    );
  }
  const [lyricsOffset, setLyricsOffset] = useState(0); // in seconds
  // Unified lyrics (captions → API → manual)
 // ----------------------------
// Unified lyrics pipeline
// ----------------------------
let { lines, source, isLoading, needsManualInput, timeline } =
  useUnifiedLyrics({
    videoId: song.videoId,
    artist: song.artist,
    title: song.title,
    manualLyrics: userLyrics,
    currentTime,
  });

// ----------------------------
//  Override with cached lyrics
// ----------------------------
if (cachedLyrics) {
  lines = cachedLyrics.lines;
  pitchTargets = cachedLyrics.pitchTargets;
}

// ✅ Debug log MUST be here — AFTER the hook returns values
console.log("UNIFIED LYRICS DEBUG:", {
  lines,
  source,
  isLoading,
  needsManualInput,
});


  const currentLineIndex = timeline.currentLineIndex;

  const practice = usePracticeController(lines, currentTime, (t) => {
    if (audioRef.current) {
      audioRef.current.currentTime = t;
    }
    setCurrentTime(t);
  });

  //const [lines, setLines] = useState<LyricLine[]>([]);
 


  // Audio event wiring
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const handleLoaded = () => {
      setDuration(audioEl.duration || song?.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audioEl.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioEl.addEventListener("loadedmetadata", handleLoaded);
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.removeEventListener("loadedmetadata", handleLoaded);
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, [song?.duration]);

  // Auto-timing: build script from lines + audio
  useEffect(() => {
    if (!lines || lines.length === 0 || !song?.audioUrl) return;

    const textLines = lines
      .map((l) => l.text.trim())
      .filter((l) => l.length > 0);

    if (textLines.length === 0) return;

    (async () => {
      try {
        const segments = await computeSegmentsFromAudio(
          song.audioUrl,
          textLines
        );
        setScript(segments);
      } catch (err) {
        console.error("Auto timing failed, falling back to equal split", err);
        const totalDuration = song.duration || duration || 180;
        const segmentDuration = totalDuration / textLines.length;
        const segments: LyricSegment[] = textLines.map((line, index) => ({
          id: String(index + 1),
          startTime: index * segmentDuration,
          endTime: (index + 1) * segmentDuration,
          text: line,
          chord: "C",
        }));
        setScript(segments);
      }
    })();
  }, [lines, song?.audioUrl, song?.duration, duration]);

  // Track active segment + scoring
  useEffect(() => {
    const active = script.find(
      (s) => currentTime >= s.startTime && currentTime < s.endTime
    );
    setActiveSegmentId(active?.id || null);

    const justFinished = script.find(
      (s) =>
        currentTime >= s.endTime &&
        currentTime < s.endTime + 0.25 &&
        s.id !== lastScoredSegmentId
    );

    if (justFinished && pitch) {
      const chord = justFinished.chord;
      const rootChord =
        CHORD_ROOTS.find((c) => c.name === chord) || CHORD_ROOTS[0];
      const rootHz = midiToHz(rootChord.midi);
      const centsOff = 1200 * Math.log2(pitch / rootHz);
      const absCents = Math.abs(centsOff);

      let quality: SegmentQuality = "bad";
      if (absCents < 40) quality = "good";
      else if (absCents < 100) quality = "almost";

      setSegmentScores((prev) => ({
        ...prev,
        [justFinished.id]: quality,
      }));
      setLastScoredSegmentId(justFinished.id);
    }
  }, [currentTime, script, pitch, lastScoredSegmentId]);

  // Pitch tracking setup
  const startPitchTracking = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    const sourceNode = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const data = new Float32Array(bufferLength);

    analyserRef.current = analyser;
    pitchDataRef.current = data;

    const gain = ctx.createGain();
    gain.gain.value = micMonitorVolume;
    sourceNode.connect(gain);
    gain.connect(ctx.destination);
    micGainRef.current = gain;

    sourceNode.connect(analyser);

    const updatePitch = () => {
      if (!analyserRef.current || !pitchDataRef.current) {
        pitchAnimationRef.current = requestAnimationFrame(updatePitch);
        return;
      }
      analyserRef.current.getFloatTimeDomainData(pitchDataRef.current);
      const detected = detectPitch(pitchDataRef.current, ctx.sampleRate);
      if (detected && detected > 50 && detected < 1000) {
        setPitch(detected);
      } else {
        setPitch(null);
      }
      pitchAnimationRef.current = requestAnimationFrame(updatePitch);
    };

    if (!pitchAnimationRef.current) {
      pitchAnimationRef.current = requestAnimationFrame(updatePitch);
    }
  };

  const stopPitchTracking = () => {
    if (pitchAnimationRef.current) {
      cancelAnimationFrame(pitchAnimationRef.current);
      pitchAnimationRef.current = null;
    }
    analyserRef.current = null;
    pitchDataRef.current = null;
  };

  const handlePlayPause = async () => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    if (isPlaying) {
      audioEl.pause();
      setIsPlaying(false);
    } else {
      try {
        audioEl.volume = musicVolume;
        await audioEl.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Playback error:", err);
        toast.error("Could not start playback. Check audio file.");
      }
    }
  };

  const handleRecordingToggle = async () => {
    if (isRecording) {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        setIsRecording(false);
        stopPitchTracking();
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        recordedChunksRef.current = [];
        setRecordedBlob(blob);
        stopPitchTracking();
        toast.success("Recording saved");
      };

      recorder.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      startPitchTracking(stream);
      recorder.start();
      setIsRecording(true);
      toast.success("Recording started - sing along!");
    } catch (err) {
      console.error("Mic error:", err);
      toast.error("Could not access microphone");
    }
  };

  const handleMusicVolumeChange = (v: number) => {
    setMusicVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  const handleMicVolumeChange = (v: number) => {
    setMicMonitorVolume(v);
    if (micGainRef.current) {
      micGainRef.current.gain.value = v;
    }
  };

  const handleAutotune = async () => {
    if (!recordedBlob) {
      toast.error("Record your voice first before autotuning.");
      return;
    }

    setIsAutotuneProcessing(true);
    toast.message("Analyzing and tuning your recording...");

    try {
      if (!tunedContextRef.current) {
        tunedContextRef.current = new AudioContext();
      }
      const ctx = tunedContextRef.current;

      const arrayBuffer = await recordedBlob.arrayBuffer();
      const buffer = await ctx.decodeAudioData(arrayBuffer);

      const channelData = buffer.getChannelData(0);
      const frameSize = 2048;
      const hopSize = 1024;

      let sumMidi = 0;
      let countMidi = 0;

      for (let i = 0; i + frameSize < channelData.length; i += hopSize) {
        const frame = channelData.slice(i, i + frameSize);
        const detectedHz = detectPitch(frame, ctx.sampleRate);
        if (detectedHz) {
          const midi = hzToMidi(detectedHz);
          sumMidi += midi;
          countMidi++;
        }
      }

      if (countMidi === 0) {
        toast.error("Could not detect pitch to autotune.");
        setIsAutotuneProcessing(false);
        return;
      }

      const avgMidi = sumMidi / countMidi;
      const targetMidi = CHORD_ROOTS[0].midi;
      const diffSemitones = targetMidi - avgMidi;
      const ratio = Math.pow(2, diffSemitones / 12);

      tunedBufferRef.current = buffer;

      const tunedSource = ctx.createBufferSource();
      tunedSource.buffer = tunedBufferRef.current;
      tunedSource.playbackRate.value = ratio;
      tunedSource.connect(ctx.destination);

      tunedSource.start();
      setHasTunedVersion(true);
      toast.success("Autotune (demo) applied. Playing tuned recording.");
    } catch (err) {
      console.error(err);
      toast.error("Autotune failed");
    } finally {
      setIsAutotuneProcessing(false);
    }
  };

  const handlePlayTunedAgain = async () => {
    if (!tunedContextRef.current || !tunedBufferRef.current) {
      toast.error("No tuned version prepared yet.");
      return;
    }
    const ctx = tunedContextRef.current;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    const src = ctx.createBufferSource();
    src.buffer = tunedBufferRef.current;
    src.connect(ctx.destination);
    src.start();
  };

  const activeSegment = script.find((s) => s.id === activeSegmentId);
  const progressWithinActive =
    activeSegment && duration > 0
      ? (currentTime - activeSegment.startTime) /
        (activeSegment.endTime - activeSegment.startTime || 1)
      : 0;
useEffect(() => {
  if (!audioRef.current) return;
  if (!audioUrl) return;

  console.log("[Practice] Setting audio src to", audioUrl);
  audioRef.current.src = audioUrl;
  audioRef.current.load();
}, [audioUrl]);




  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 space-y-6">
        <audio
  ref={audioRef}
  crossOrigin="anonymous"
  style={{ display: "none" }}
  src={audioUrl}
/>


        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/songs")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {song.title}
            </h1>
            <p className="text-gray-400">{song.artist}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr,3fr] gap-6">
          {/* Left: Video + controls */}
          <div className="space-y-4">
            <div className="aspect-video max-h-[260px] rounded-xl overflow-hidden bg-black/50">
              <iframe
                ref={ytRef}
                src={`https://www.youtube.com/embed/${song.videoId}?controls=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handlePlayPause}
                  className="bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Music Volume</span>
                  </div>
                  <Slider
                    value={[musicVolume * 100]}
                    onValueChange={([v]) => handleMusicVolumeChange(v / 100)}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Time: {currentTime.toFixed(1)}s /{" "}
                {duration ? duration.toFixed(1) : "?"}s
              </div>
            </div>
          </div>

          {/* Right: Recording + Lyrics + Chords */}
          <div className="space-y-4">
            {/* Recording */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Recording</h3>

              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                onClick={handleRecordingToggle}
                className="w-full mb-4"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Mic Monitor Volume
                  </span>
                </div>
                <Slider
                  value={[micMonitorVolume * 100]}
                  onValueChange={([v]) => handleMicVolumeChange(v / 100)}
                  max={100}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Pitch</div>
                <div className="text-xl font-semibold text-purple-300">
                  {pitch ? `${pitch.toFixed(1)} Hz` : "-"}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  disabled={!recordedBlob || isAutotuneProcessing}
                  onClick={handleAutotune}
                >
                  <Wand2 className="w-4 h-4" />
                  {isAutotuneProcessing ? "Autotuning..." : "Autotune Recording"}
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={!hasTunedVersion}
                  onClick={handlePlayTunedAgain}
                >
                  Play Tuned Version
                </Button>
              </div>
            </div>

            {/* Practice controls */}
            <div style={{ marginTop: 16 }} className="space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  currentLineIndex >= 0 &&
                  practice.jumpToLine(currentLineIndex)
                }
                disabled={currentLineIndex < 0}
              >
                Practice this line
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  currentLineIndex >= 0 &&
                  practice.setLoopByLines(
                    currentLineIndex,
                    currentLineIndex + 1
                  )
                }
                disabled={currentLineIndex < 0}
              >
                Loop this + next line
              </Button>

              {practice.isLooping && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={practice.clearLoop}
                >
                  Stop looping
                </Button>
              )}
            </div>

            {/* Lyrics + Chords */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Lyrics & Chords</h3>

              {isLoading && (
                <p className="text-sm text-gray-400 mb-2">
                  Loading lyrics / captions...
                </p>
              )}

              {/* Manual lyrics fallback UI */}
              {needsManualInput && (
                <div className="mb-4">
                  <p className="text-sm text-gray-300 mb-2">
                  {!cachedLyrics && (
                    <button
                      onClick={async () => {
                        const result = await analyzeLyrics(song.videoId, userLyrics);
                        if (result) {
                          setCachedLyrics(result);
                          setLines(result.lines);
                          setPitchTargets(result.pitchTargets);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                    >
                      Analyze & Save Lyrics
                    </button>
                  )}

                  </p>
                  <textarea
                    className="w-full h-32 rounded-md bg-black/40 border border-white/10 p-2 text-sm text-gray-100"
                    placeholder="Paste lyrics here, one line per phrase..."
                    value={userLyrics}
                    onChange={(e) => setUserLyrics(e.target.value)}
                  />
                </div>
              )}
              <div className="mt-2 text-xs text-gray-400">
                Lyrics offset: {lyricsOffset.toFixed(2)}s
              </div>
              <Slider
                value={[lyricsOffset * 100 + 500]} // map -5s..+5s to 0..1000
                onValueChange={([v]) => setLyricsOffset((v - 500) / 100)}
                min={0}
                max={1000}
                step={1}
              />

              <LyricHighlighter
                lines={lines}
                currentLineIndex={currentLineIndex}
                currentTime={currentTime - lyricsOffset}
              />


              <div className="relative space-y-2 mt-4">
                {script.map((segment) => {
                  const isActive = segment.id === activeSegmentId;
                  const quality = segmentScores[segment.id];
                  const defaultColor = isActive ? "text-white" : "text-gray-400";

                  const qualityColor =
                    quality === "good"
                      ? "text-green-400"
                      : quality === "almost"
                      ? "text-orange-400"
                      : quality === "bad"
                      ? "text-red-400"
                      : defaultColor;

                  const isBallOnThisLine =
                    isActive && activeSegment && segment.id === activeSegment.id;

                  return (
                    <div
                      key={segment.id}
                      className={`flex items-baseline gap-3 py-1 transition-colors ${qualityColor}`}
                    >
                      <span className="text-xs font-mono text-purple-300 w-10">
                        {segment.chord}
                      </span>
                      <span className="relative flex-1">
                        {segment.text}
                        {isBallOnThisLine && (
                          <span
                            className="absolute -top-3 w-3 h-3 rounded-full bg-pink-400 shadow-lg shadow-pink-500/60"
                            style={{
                              left: `${Math.max(
                                0,
                                Math.min(100, progressWithinActive * 100)
                              )}%`,
                              transform:
                                "translateX(-50%) translateY(-100%)",
                            }}
                          />
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
<KaraokePitchCanvas
  lines={lines}
  currentTime={currentTime}
  pitchHz={pitch}
  duration={duration || 1}
  wordScores={{}} // we will fill this later
/>

            {/* <ChordVisualizer
              script={script}
              currentTime={currentTime}
              duration={duration || 1}
              segmentScores={segmentScores}
            /> */}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-4">How to Practice</h3>
          <ol className="space-y-2 text-gray-300">
            <li>1. Click "Start Recording" to enable your microphone.</li>
            <li>
              2. Click Play to start the backing track and sing along with the
              YouTube video.
            </li>
            <li>
              3. Follow the bouncing ball and chords; after each line you’ll see
              your score color.
            </li>
            <li>
              4. When finished, stop the recording and click "Autotune
              Recording".
            </li>
            <li>
              5. Use "Play Tuned Version" and the chord progression bar to
              review your performance.
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
};

export default Practice;
