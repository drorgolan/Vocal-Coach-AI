// src/hooks/usePracticeSession.ts - COMPLETE SESSION MANAGEMENT
import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { calculateSessionScore, type PitchDataPoint, type SessionScore } from '@/lib/scoring';
import { calculatePitchAccuracy } from '@/lib/pitchUtils';
import type { Tables } from '@/integrations/supabase/types';

type Song = Tables<'songs'>;

interface SessionState {
  isActive: boolean;
  startTime: Date | null;
  currentScore: SessionScore | null;
  pitchData: PitchDataPoint[];
}

export const usePracticeSession = (song: Song | null, userId: string | null) => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    startTime: null,
    currentScore: null,
    pitchData: [],
  });

  const sessionIdRef = useRef<string | null>(null);

  // Start new practice session
  const startSession = useCallback(async () => {
    if (!userId || !song) {
      toast.error('Please sign in to track your progress');
      return;
    }

    try {
      const startTime = new Date();
      
      // Create session in database
      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          user_id: userId,
          song_id: song.id,
          started_at: startTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      sessionIdRef.current = data.id;
      
      setSessionState({
        isActive: true,
        startTime,
        currentScore: null,
        pitchData: [],
      });

      toast.success('Practice session started!');
    } catch (error: any) {
      console.error('Failed to start session:', error);
      toast.error('Failed to start session: ' + error.message);
    }
  }, [userId, song]);

  // Record pitch data point
  const recordPitch = useCallback((
    targetHz: number,
    actualHz: number | null,
    timestamp: number
  ) => {
    if (!sessionState.isActive || !actualHz) return;

    const accuracy = calculatePitchAccuracy(actualHz, targetHz);
    
    const dataPoint: PitchDataPoint = {
      time: timestamp,
      targetHz,
      actualHz,
      accuracy,
    };

    setSessionState(prev => ({
      ...prev,
      pitchData: [...prev.pitchData, dataPoint],
    }));
  }, [sessionState.isActive]);

  // End session and save results
  const endSession = useCallback(async () => {
    if (!sessionState.isActive || !sessionIdRef.current || !sessionState.startTime) {
      return;
    }

    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - sessionState.startTime.getTime()) / 1000);

      // Calculate final score
      const score = calculateSessionScore(sessionState.pitchData, duration);

      // Update session in database
      const { error: updateError } = await supabase
        .from('practice_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration,
          score_percentage: score.scorePercentage,
          pitch_accuracy_series: sessionState.pitchData,
          average_pitch_accuracy: score.averagePitchAccuracy,
          notes_hit: score.notesHit,
          notes_missed: score.notesMissed,
          perfect_notes: score.perfectNotes,
          max_combo: score.maxCombo,
        })
        .eq('id', sessionIdRef.current);

      if (updateError) throw updateError;

      // Update user points
      if (userId) {
        const { data: currentPoints, error: pointsError } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!pointsError && currentPoints) {
          await supabase
            .from('user_points')
            .update({
              total_points: currentPoints.total_points + score.points,
              weekly_points: currentPoints.weekly_points + score.points,
              monthly_points: currentPoints.monthly_points + score.points,
              last_practice_date: endTime.toISOString().split('T')[0],
            })
            .eq('user_id', userId);
        }

        // Update leaderboard
        await updateLeaderboard(userId, song!.id, score.scorePercentage);
      }

      setSessionState(prev => ({
        ...prev,
        isActive: false,
        currentScore: score,
      }));

      toast.success(`Session complete! Grade: ${score.grade} - ${score.points} points earned!`);
      
      return score;
    } catch (error: any) {
      console.error('Failed to end session:', error);
      toast.error('Failed to save session: ' + error.message);
    }
  }, [sessionState, userId, song]);

  // Update leaderboard entry
  const updateLeaderboard = async (
    userId: string,
    songId: string,
    score: number
  ) => {
    try {
      // Check if user already has a score for this song
      const { data: existing } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', userId)
        .eq('song_id', songId)
        .eq('timeframe', 'all_time')
        .single();

      if (existing) {
        // Update if new score is higher
        if (score > existing.score) {
          await supabase
            .from('leaderboard')
            .update({ score, updated_at: new Date().toISOString() })
            .eq('id', existing.id);
        }
      } else {
        // Insert new entry
        await supabase
          .from('leaderboard')
          .insert({
            user_id: userId,
            song_id: songId,
            score,
            timeframe: 'all_time',
          });
      }
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  };

  // Get current session stats
  const getCurrentStats = useCallback(() => {
    if (!sessionState.isActive || !sessionState.startTime) {
      return null;
    }

    const duration = Math.floor((Date.now() - sessionState.startTime.getTime()) / 1000);
    const score = calculateSessionScore(sessionState.pitchData, duration);

    return {
      duration,
      ...score,
    };
  }, [sessionState]);

  return {
    sessionState,
    startSession,
    recordPitch,
    endSession,
    getCurrentStats,
  };
};