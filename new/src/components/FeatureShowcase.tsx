import { motion } from 'framer-motion';
import { Mic, Music, Trophy, TrendingUp, Gamepad2, Users } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Real-Time Pitch Detection',
    description: 'See your pitch accuracy live as you sing, with visual guides to help you hit every note.',
    color: 'primary',
  },
  {
    icon: Music,
    title: 'Karaoke Mode',
    description: 'Sing along with YouTube backing tracks, complete with scrolling lyrics and chord charts.',
    color: 'secondary',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Watch your vocal skills improve over time with detailed analytics and session history.',
    color: 'accent',
  },
  {
    icon: Gamepad2,
    title: 'Game Mode',
    description: 'Turn practice into play with points, achievements, and fun challenges.',
    color: 'primary',
  },
  {
    icon: Trophy,
    title: 'Competitions',
    description: 'Compete with singers worldwide in weekly challenges and climb the leaderboard.',
    color: 'secondary',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with other singers, share performances, and learn together.',
    color: 'accent',
  },
];

const colorClasses = {
  primary: 'from-primary to-primary/50',
  secondary: 'from-secondary to-secondary/50',
  accent: 'from-accent to-accent/50',
};

const FeatureShowcase = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Level Up</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From practice to performance, we've got all the tools to help you become the singer you've always wanted to be.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="glass-card p-6 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;
