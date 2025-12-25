import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturedSongs from '@/components/FeaturedSongs';
import FeatureShowcase from '@/components/FeatureShowcase';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturedSongs />
      <FeatureShowcase />
    </div>
  );
};

export default Index;
