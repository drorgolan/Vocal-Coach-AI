// src/components/SongCard.tsx - FIXED VERSION
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SongCardProps {
  title: string;
  artist: string;
  genre?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  videoId: string;
  index?: number;
}

const SongCard = ({ title, artist, genre, difficulty, videoId, index = 0 }: SongCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleClick = () => {
    // Navigate to practice page with song data
    navigate('/practice', {
      state: {
        title,
        artist,
        videoId,
        genre,
        difficulty
      }
    });
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-500/20 text-green-400';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'Hard': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => {
        setIsHovered(true);
        // Show preview after 500ms hover
        setTimeout(() => setShowPreview(true), 500);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPreview(false);
      }}
      onClick={handleClick}
    >
      {/* Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 hover:border-purple-500/50 transition-all hover:scale-105">
        {/* Thumbnail */}
        <div className="relative mb-3 rounded-lg overflow-hidden aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Info */}
        <h3 className="font-bold text-white mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-2">{artist}</p>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {genre && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
              {genre}
            </span>
          )}
          {difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Hover Preview (YouTube iframe) */}
      {showPreview && isHovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute left-full ml-4 top-0 z-50 w-80 bg-black/95 border border-white/20 rounded-xl overflow-hidden shadow-2xl"
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-900/80 to-pink-900/80">
            <p className="text-white font-semibold text-sm mb-1">{title}</p>
            <p className="text-gray-300 text-xs">{artist}</p>
            <p className="text-gray-400 text-xs mt-2">
              👆 Click card to practice this song
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongCard;