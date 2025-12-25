import { motion } from 'framer-motion';
import SongCard from './SongCard';

const mockSongs = [
  { title: 'Bohemian Rhapsody', artist: 'Queen', genre: 'Rock', difficulty: 'Hard' as const },
  { title: 'Someone Like You', artist: 'Adele', genre: 'Pop', difficulty: 'Medium' as const },
  { title: 'Shallow', artist: 'Lady Gaga', genre: 'Pop', difficulty: 'Medium' as const },
  { title: 'Perfect', artist: 'Ed Sheeran', genre: 'Pop', difficulty: 'Easy' as const },
  { title: 'Hallelujah', artist: 'Leonard Cohen', genre: 'Folk', difficulty: 'Medium' as const },
  { title: 'Billie Jean', artist: 'Michael Jackson', genre: 'Pop', difficulty: 'Hard' as const },
];

const FeaturedSongs = () => {
  return (
    <section id="songs" className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Featured <span className="gradient-text">Songs</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Choose from thousands of songs across all genres. Each track comes with lyrics, chords, and karaoke backing.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mockSongs.map((song, index) => (
            <SongCard key={index} {...song} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSongs;
