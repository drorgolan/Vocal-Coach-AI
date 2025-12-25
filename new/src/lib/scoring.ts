// src/lib/scoring.ts - COMPLETE SCORING SYSTEM

import { calculatePitchAccuracy } from './pitchUtils';

export interface PitchDataPoint {
  time: number;
  targetHz: number;
  actualHz: number;
  accuracy: number;
}

export interface SessionScore {
  scorePercentage: number;
  notesHit: number;
  notesMissed: number;
  perfectNotes: number;
  averagePitchAccuracy: number;
  maxCombo: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  points: number;
}

// Calculate score from pitch data
export const calculateSessionScore = (
  pitchData: PitchDataPoint[],
  duration: number
): SessionScore => {
  if (pitchData.length === 0) {
    return {
      scorePercentage: 0,
      notesHit: 0,
      notesMissed: 0,
      perfectNotes: 0,
      averagePitchAccuracy: 0,
      maxCombo: 0,
      grade: 'F',
      points: 0,
    };
  }

  // Calculate average accuracy
  const totalAccuracy = pitchData.reduce((sum, point) => sum + point.accuracy, 0);
  const averageAccuracy = totalAccuracy / pitchData.length;

  // Count notes
  let notesHit = 0;
  let notesMissed = 0;
  let perfectNotes = 0;
  let currentCombo = 0;
  let maxCombo = 0;

  pitchData.forEach((point) => {
    if (point.accuracy >= 50) {
      notesHit++;
      currentCombo++;
      maxCombo = Math.max(maxCombo, currentCombo);

      if (point.accuracy >= 95) {
        perfectNotes++;
      }
    } else {
      notesMissed++;
      currentCombo = 0;
    }
  });

  // Calculate score percentage
  const hitRate = notesHit / (notesHit + notesMissed);
  const comboBonus = Math.min(maxCombo / 50, 0.2); // Up to 20% bonus
  const perfectBonus = (perfectNotes / pitchData.length) * 0.1; // Up to 10% bonus

  const scorePercentage = Math.min(
    100,
    (hitRate * 0.7 + // 70% from hit rate
      averageAccuracy / 100 * 0.3) * // 30% from accuracy
      100 *
      (1 + comboBonus + perfectBonus)
  );

  // Determine grade
  const grade = getGrade(scorePercentage);

  // Calculate points
  const basePoints = Math.round(scorePercentage * 10);
  const comboPoints = maxCombo * 5;
  const perfectPoints = perfectNotes * 10;
  const durationBonus = Math.round(duration / 60); // 1 point per minute

  const totalPoints = basePoints + comboPoints + perfectPoints + durationBonus;

  return {
    scorePercentage: Math.round(scorePercentage * 100) / 100,
    notesHit,
    notesMissed,
    perfectNotes,
    averagePitchAccuracy: Math.round(averageAccuracy * 100) / 100,
    maxCombo,
    grade,
    points: totalPoints,
  };
};

// Get grade from score
export const getGrade = (score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

// Get grade color
export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'S': return 'text-yellow-400';
    case 'A': return 'text-green-400';
    case 'B': return 'text-blue-400';
    case 'C': return 'text-orange-400';
    case 'D': return 'text-red-400';
    case 'F': return 'text-gray-400';
    default: return 'text-white';
  }
};

// Calculate points for level progression
export const calculateLevelFromPoints = (totalPoints: number): {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
} => {
  // Level formula: Points needed = 100 * level^1.5
  let level = 1;
  let pointsForCurrentLevel = 0;

  while (pointsForCurrentLevel <= totalPoints) {
    level++;
    pointsForCurrentLevel = Math.floor(100 * Math.pow(level, 1.5));
  }

  level--; // Go back one level
  const currentLevelPoints = Math.floor(100 * Math.pow(level, 1.5));
  const nextLevelPoints = Math.floor(100 * Math.pow(level + 1, 1.5));

  const pointsInCurrentLevel = totalPoints - currentLevelPoints;
  const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;
  const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;

  return {
    level,
    currentLevelPoints: pointsInCurrentLevel,
    nextLevelPoints: pointsNeededForNextLevel,
    progress: Math.min(100, Math.max(0, progress)),
  };
};

// Check if achievement is unlocked
export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
}

export const checkAchievementUnlock = (
  achievement: Achievement,
  userStats: {
    totalSessions?: number;
    totalPoints?: number;
    streakDays?: number;
    highestAccuracy?: number;
    perfectSessions?: number;
  }
): boolean => {
  switch (achievement.requirement_type) {
    case 'practice_count':
      return (userStats.totalSessions || 0) >= achievement.requirement_value;
    case 'total_points':
      return (userStats.totalPoints || 0) >= achievement.requirement_value;
    case 'streak_days':
      return (userStats.streakDays || 0) >= achievement.requirement_value;
    case 'accuracy_threshold':
      return (userStats.highestAccuracy || 0) >= achievement.requirement_value;
    case 'perfect_sessions':
      return (userStats.perfectSessions || 0) >= achievement.requirement_value;
    default:
      return false;
  }
};

// Calculate streak
export const calculateStreak = (lastPracticeDate: string | null): number => {
  if (!lastPracticeDate) return 0;

  const last = new Date(lastPracticeDate);
  const today = new Date();
  
  // Reset time to midnight for comparison
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  // If last practice was today, maintain streak
  if (diffDays === 0) return 1;
  
  // If last practice was yesterday, continue streak
  if (diffDays === 1) return 1;
  
  // Otherwise, streak is broken
  return 0;
};

// Format score for display
export const formatScore = (score: number): string => {
  return `${score.toFixed(1)}%`;
};

// Get performance message
export const getPerformanceMessage = (score: number): string => {
  if (score >= 95) return '🎉 Outstanding! Perfect performance!';
  if (score >= 85) return '⭐ Excellent! You nailed it!';
  if (score >= 75) return '👍 Great job! Keep it up!';
  if (score >= 65) return '👌 Good effort! You\'re improving!';
  if (score >= 50) return '💪 Nice try! Practice makes perfect!';
  return '📚 Keep practicing! You\'ll get there!';
};