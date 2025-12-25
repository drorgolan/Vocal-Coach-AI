import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useYouTubeSearch } from "@/hooks/useYouTubePlayer";


interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (song: any) => void;
}

const SongPickerModal = ({ open, onClose, onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const { results, search, loading } = useYouTubeSearch();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Search Karaoke</h2>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Song name + karaoke"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button onClick={() => search(query)}>Search</Button>
        </div>

        {loading && <p>Searching…</p>}

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.videoId}
              className="p-3 border rounded cursor-pointer hover:bg-muted"
              onClick={() => onSelect(r)}
            >
              <p className="font-semibold">{r.title}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongPickerModal;
