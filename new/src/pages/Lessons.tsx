// src/pages/Lessons.tsx - VOCAL COACH LESSONS
import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, Star, TrendingUp, ChevronRight, Award, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  objectives: string[];
  exercises: {
    name: string;
    duration: string;
  }[];
}

const Lessons = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const lessons: Lesson[] = [
    {
      id: 1,
      title: "Proper Breathing Technique",
      description: "Master diaphragmatic breathing for powerful, controlled vocals",
      duration: "12 min",
      level: "Beginner",
      category: "Fundamentals",
      objectives: [
        "Understand diaphragmatic breathing",
        "Practice breath control exercises",
        "Improve breath support for singing"
      ],
      exercises: [
        { name: "Breath awareness", duration: "3 min" },
        { name: "Diaphragm engagement", duration: "4 min" },
        { name: "Sustained notes", duration: "5 min" }
      ]
    },
    {
      id: 2,
      title: "Pitch Accuracy Training",
      description: "Hit notes precisely with real-time feedback",
      duration: "15 min",
      level: "Beginner",
      category: "Pitch Control",
      objectives: [
        "Develop pitch recognition",
        "Train muscle memory for accurate notes",
        "Improve intonation consistency"
      ],
      exercises: [
        { name: "Scale practice", duration: "5 min" },
        { name: "Interval training", duration: "5 min" },
        { name: "Song practice", duration: "5 min" }
      ]
    },
    {
      id: 3,
      title: "Vocal Warm-Up Routine",
      description: "Essential daily exercises to prepare your voice",
      duration: "10 min",
      level: "Beginner",
      category: "Warm-Up",
      objectives: [
        "Safely warm up vocal cords",
        "Prepare for extended singing",
        "Prevent vocal strain"
      ],
      exercises: [
        { name: "Lip trills", duration: "2 min" },
        { name: "Sirens", duration: "3 min" },
        { name: "Humming scales", duration: "5 min" }
      ]
    },
    {
      id: 4,
      title: "Range Extension",
      description: "Safely expand your vocal range higher and lower",
      duration: "18 min",
      level: "Intermediate",
      category: "Range Development",
      objectives: [
        "Extend upper register",
        "Strengthen lower register",
        "Smooth register transitions"
      ],
      exercises: [
        { name: "Head voice exercises", duration: "6 min" },
        { name: "Chest voice exercises", duration: "6 min" },
        { name: "Register blending", duration: "6 min" }
      ]
    },
    {
      id: 5,
      title: "Vibrato Control",
      description: "Learn to control and apply vibrato effectively",
      duration: "20 min",
      level: "Intermediate",
      category: "Advanced Technique",
      objectives: [
        "Develop natural vibrato",
        "Control vibrato speed and width",
        "Apply vibrato musically"
      ],
      exercises: [
        { name: "Vibrato initiation", duration: "7 min" },
        { name: "Speed control", duration: "7 min" },
        { name: "Musical application", duration: "6 min" }
      ]
    },
    {
      id: 6,
      title: "Belt Technique",
      description: "Master powerful high notes with proper technique",
      duration: "25 min",
      level: "Advanced",
      category: "Advanced Technique",
      objectives: [
        "Learn safe belting mechanics",
        "Build power and projection",
        "Avoid vocal strain"
      ],
      exercises: [
        { name: "Belt foundation", duration: "8 min" },
        { name: "Power building", duration: "9 min" },
        { name: "Song application", duration: "8 min" }
      ]
    },
    {
      id: 7,
      title: "Tone Quality & Resonance",
      description: "Develop rich, resonant vocal tone",
      duration: "16 min",
      level: "Intermediate",
      category: "Tone Development",
      objectives: [
        "Understand vocal resonance",
        "Eliminate nasal tone",
        "Develop fuller sound"
      ],
      exercises: [
        { name: "Resonance placement", duration: "5 min" },
        { name: "Tone exercises", duration: "6 min" },
        { name: "Application", duration: "5 min" }
      ]
    },
    {
      id: 8,
      title: "Articulation & Diction",
      description: "Sing with clarity and precision",
      duration: "14 min",
      level: "Beginner",
      category: "Fundamentals",
      objectives: [
        "Improve consonant clarity",
        "Master vowel shaping",
        "Enhance overall diction"
      ],
      exercises: [
        { name: "Consonant drills", duration: "5 min" },
        { name: "Vowel exercises", duration: "5 min" },
        { name: "Tongue twisters", duration: "4 min" }
      ]
    }
  ];

  const categories = ['All', 'Fundamentals', 'Pitch Control', 'Warm-Up', 'Range Development', 'Advanced Technique', 'Tone Development'];

  const filteredLessons = selectedCategory === 'All' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const startLesson = (lesson: Lesson) => {
    // Navigate to practice page with lesson data
    navigate('/practice', { state: { lesson } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">Vocal Coach Lessons</h1>
              <p className="text-muted-foreground text-lg mt-1">
                Professional training from beginner to advanced
              </p>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={selectedCategory === category ? 'gradient-primary text-primary-foreground' : ''}
            >
              {category}
            </Button>
          ))}
        </motion.div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 border border-border/50 hover:border-primary/50 transition-all hover:scale-[1.02] cursor-pointer group"
              onClick={() => startLesson(lesson)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold group-hover:text-primary transition">
                      {lesson.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {lesson.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {lesson.duration}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(lesson.level)}`}>
                      {lesson.level}
                    </span>
                  </div>

                  {/* Objectives */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      Learning Objectives:
                    </h4>
                    <ul className="space-y-1">
                      {lesson.objectives.map((objective, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Exercises */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Exercises:
                    </h4>
                    <div className="space-y-1">
                      {lesson.exercises.map((exercise, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>{idx + 1}. {exercise.name}</span>
                          <span className="text-xs">{exercise.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <Button 
                className="w-full gradient-primary group-hover:scale-105 transition"
                onClick={() => startLesson(lesson)}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Lesson
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No lessons found in this category</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSelectedCategory('All')}
            >
              View All Lessons
            </Button>
          </div>
        )}

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 glass-card p-6 border border-border/50"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Your Progress
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Lessons Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">0</div>
              <div className="text-sm text-muted-foreground">Practice Hours</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-500">0</div>
              <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Lessons;