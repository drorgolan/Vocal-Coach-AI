// src/pages/Songs.tsx - FIXED VERSION
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SongCard from "@/components/SongCard";
import { karaokeSongs } from "@/data/karaokeSongs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Songs = () => {
  const [query, setQuery] = useState("");

  const filtered = karaokeSongs.filter(
    s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Song Library
        </h1>

        {/* Search Bar */}
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search song or artist..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Song Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((song, index) => (
            <SongCard
              key={song.videoId}
              title={song.title}
              artist={song.artist}
              videoId={song.videoId}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center mt-12">
            <p className="text-gray-400 text-lg">No songs found</p>
            <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Songs;