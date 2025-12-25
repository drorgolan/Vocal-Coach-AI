import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const leaderboardData = [
  { rank: 1, username: 'VocalMaster99', score: 98750, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1', trend: 'up' },
  { rank: 2, username: 'SingingStar', score: 95420, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2', trend: 'up' },
  { rank: 3, username: 'MelodyQueen', score: 92180, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3', trend: 'down' },
  { rank: 4, username: 'PitchPerfect', score: 89650, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4', trend: 'up' },
  { rank: 5, username: 'VoiceVirtuoso', score: 87200, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5', trend: 'same' },
  { rank: 6, username: 'NoteNinja', score: 84500, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6', trend: 'up' },
  { rank: 7, username: 'TuneWarrior', score: 81300, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7', trend: 'down' },
  { rank: 8, username: 'HarmonyHero', score: 78900, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8', trend: 'up' },
  { rank: 9, username: 'ChordChamp', score: 75600, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9', trend: 'same' },
  { rank: 10, username: 'RhythmRider', score: 72400, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=10', trend: 'down' },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-400" />;
    case 2:
      return <Medal className="w-6 h-6 text-gray-300" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">{rank}</span>;
  }
};

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50';
    case 2:
      return 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border-gray-400/50';
    case 3:
      return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50';
    default:
      return 'bg-muted/30 border-border';
  }
};

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Leaderboard</h1>
          <p className="text-muted-foreground text-lg">
            Compete with singers worldwide and climb the ranks
          </p>
        </motion.div>

        <Tabs defaultValue="global" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="global">Global</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="global">
            <div className="space-y-3">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-4 flex items-center gap-4 border ${getRankStyle(entry.rank)}`}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <img
                    src={entry.avatar}
                    alt={entry.username}
                    className="w-12 h-12 rounded-full bg-muted"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      {entry.score.toLocaleString()} points
                    </p>
                  </div>
                  
                  <div className={`flex items-center gap-1 ${
                    entry.trend === 'up' ? 'text-green-500' : 
                    entry.trend === 'down' ? 'text-red-500' : 
                    'text-muted-foreground'
                  }`}>
                    {entry.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                    {entry.trend === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                    {entry.trend === 'same' && <span className="text-xs">—</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly">
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">Weekly leaderboard resets every Monday</p>
              <p className="text-sm text-muted-foreground mt-2">Sign in to see your ranking</p>
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <div className="glass-card p-8 text-center">
              <p className="text-muted-foreground">Sign in to see your friends' rankings</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Leaderboard;
