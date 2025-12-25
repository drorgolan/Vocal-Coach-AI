import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface KaraokeSearchModelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (videoId: string, title: string) => void;
}

const KaraokeSearchModel = ({
  open,
  onClose,
  onSelect,
}: KaraokeSearchModelProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const search = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      // NOTE: YouTube Data API REQUIRED (client-side)
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          query + " karaoke"
        )}&maxResults=5&key=YOUR_API_KEY`
      );

      const json = await res.json();

      if (!json.items) throw new Error("No results");

      setResults(json.items);
    } catch (e) {
      console.error(e);
      toast.error("Search failed (YouTube API required)");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-background rounded-xl w-full max-w-lg p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          onClick={onClose}
        >
          <X />
        </Button>

        <h2 className="text-xl font-bold mb-4">Search Karaoke</h2>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Song name or artist"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={search} disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id.videoId}
              onClick={() => {
                onSelect(r.id.videoId, r.snippet.title);
                onClose();
              }}
              className="w-full text-left p-2 rounded hover:bg-muted"
            >
              🎤 {r.snippet.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KaraokeSearchModel;
