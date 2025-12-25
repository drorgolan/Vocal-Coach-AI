import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Link2, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioUrlPlayerProps {
  className?: string;
}

type LoadedSource =
  | { kind: "url"; url: string; label: string }
  | { kind: "file"; url: string; label: string };

const AudioUrlPlayer = forwardRef<HTMLDivElement, AudioUrlPlayerProps>(({ className }, ref) => {
  const [url, setUrl] = useState("");
  const [loaded, setLoaded] = useState<LoadedSource | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadedUrl = loaded?.url ?? null;
  const loadedLabel = useMemo(() => loaded?.label ?? "", [loaded]);

  const clearLoaded = () => {
    setLoaded((prev) => {
      if (prev?.kind === "file") URL.revokeObjectURL(prev.url);
      return null;
    });
  };

  const handleLoadUrl = () => {
    const next = url.trim();
    if (!next) return;

    clearLoaded();
    setLoaded({ kind: "url", url: next, label: next });
    toast.success("Track loaded. Press play.");

    // Ensure audio element reloads on next tick.
    setTimeout(() => audioRef.current?.load(), 0);
  };

  const handlePickFile = (file: File | null) => {
    if (!file) return;

    clearLoaded();
    const objectUrl = URL.createObjectURL(file);
    setLoaded({ kind: "file", url: objectUrl, label: file.name });
    toast.success("Local file loaded. Press play.");
    setTimeout(() => audioRef.current?.load(), 0);
  };

  const handleOpen = () => {
    if (!loadedUrl) return;
    window.open(loadedUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      if (loaded?.kind === "file") URL.revokeObjectURL(loaded.url);
    };
  }, [loaded]);

  return (
    <div ref={ref} className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">File / Direct Audio URL</h3>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste a direct MP3/WAV URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLoadUrl()}
            className="flex-1"
          />
          <Button onClick={handleLoadUrl} disabled={!url.trim()}>
            Load
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full" asChild>
            <label>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
              />
              <span className="inline-flex items-center justify-center w-full">
                <Upload className="w-4 h-4 mr-2" />
                Choose Audio File (from your device)
              </span>
            </label>
          </Button>

          {loadedUrl && (
            <Button variant="outline" size="icon" onClick={clearLoaded} aria-label="Clear loaded track">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {loadedUrl ? (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground truncate" title={loadedLabel}>
              Loaded: {loadedLabel}
            </div>

            <audio
              ref={audioRef}
              src={loadedUrl}
              controls
              preload="metadata"
              playsInline
              className="w-full"
              onError={() => toast.error("Could not play this source. Try a different file or a direct MP3/WAV link.")}
            />

            {loaded?.kind === "url" && (
              <Button variant="outline" size="sm" className="w-full" onClick={handleOpen}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Source
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Tip: “Audio URL” must be a direct MP3/WAV link (not a webpage). Local files are best for reliable playback.
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            Use a local audio file or a direct MP3/WAV link for karaoke backing tracks.
          </p>
        )}
      </div>
    </div>
  );
});

AudioUrlPlayer.displayName = "AudioUrlPlayer";

export default AudioUrlPlayer;
