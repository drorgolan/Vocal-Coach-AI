// src/integrations/supabase/client.ts - MOCK VERSION (NO BACKEND REQUIRED)
import type { Database } from './types';

// Mock data for development
const mockSongs = [
  {
    id: '1',
    title: 'Do-Re-Mi Scale',
    artist: 'Vocal Exercise',
    genre: 'Training',
    difficulty: 'Easy' as const,
    youtube_video_id: 'dQw4w9WgXcQ',
    duration: 180,
    tempo: 120,
    key: 'C',
    lyrics: null,
    chords: null,
    sheet_music_url: null,
    album_art_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    popularity_score: 100,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Amazing Grace',
    artist: 'Traditional',
    genre: 'Hymn',
    difficulty: 'Medium' as const,
    youtube_video_id: 'CDdvReNKKuk',
    duration: 240,
    tempo: 80,
    key: 'G',
    lyrics: null,
    chords: null,
    sheet_music_url: null,
    album_art_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    popularity_score: 95,
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Breathing Exercise',
    artist: 'Coach Williams',
    genre: 'Training',
    difficulty: 'Easy' as const,
    youtube_video_id: 'dQw4w9WgXcQ',
    duration: 120,
    tempo: 60,
    key: 'C',
    lyrics: null,
    chords: null,
    sheet_music_url: null,
    album_art_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=400&fit=crop',
    popularity_score: 90,
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockLeaderboard = [
  {
    rank: 1,
    username: 'Sarah M.',
    avatar_url: null,
    score: 98.5,
    updated_at: new Date().toISOString(),
    total_points: 9850,
    level: 15
  },
  {
    rank: 2,
    username: 'John D.',
    avatar_url: null,
    score: 97.2,
    updated_at: new Date().toISOString(),
    total_points: 9720,
    level: 14
  },
  {
    rank: 3,
    username: 'Emma W.',
    avatar_url: null,
    score: 96.5,
    updated_at: new Date().toISOString(),
    total_points: 9650,
    level: 13
  }
];

// Mock Supabase client
export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => ({
      order: (column: string, options?: any) => ({
        limit: (count: number) => ({
          then: (callback: (result: any) => void) => {
            if (table === 'songs') {
              setTimeout(() => callback({ data: mockSongs, error: null }), 500);
            } else if (table === 'global_leaderboard') {
              setTimeout(() => callback({ data: mockLeaderboard, error: null }), 500);
            } else {
              setTimeout(() => callback({ data: [], error: null }), 500);
            }
            return Promise.resolve({ data: [], error: null });
          }
        }),
        then: (callback: (result: any) => void) => {
          if (table === 'songs') {
            setTimeout(() => callback({ data: mockSongs, error: null }), 500);
          } else if (table === 'global_leaderboard') {
            setTimeout(() => callback({ data: mockLeaderboard, error: null }), 500);
          } else {
            setTimeout(() => callback({ data: [], error: null }), 500);
          }
          return Promise.resolve({ data: [], error: null });
        }
      }),
      limit: (count: number) => ({
        then: (callback: (result: any) => void) => {
          if (table === 'songs') {
            setTimeout(() => callback({ data: mockSongs, error: null }), 500);
          } else if (table === 'global_leaderboard') {
            setTimeout(() => callback({ data: mockLeaderboard, error: null }), 500);
          } else {
            setTimeout(() => callback({ data: [], error: null }), 500);
          }
          return Promise.resolve({ data: [], error: null });
        }
      }),
      eq: (column: string, value: any) => ({
        single: () => ({
          then: (callback: (result: any) => void) => {
            setTimeout(() => callback({ data: null, error: null }), 500);
            return Promise.resolve({ data: null, error: null });
          }
        }),
        then: (callback: (result: any) => void) => {
          setTimeout(() => callback({ data: [], error: null }), 500);
          return Promise.resolve({ data: [], error: null });
        }
      }),
      then: (callback: (result: any) => void) => {
        if (table === 'songs') {
          setTimeout(() => callback({ data: mockSongs, error: null }), 500);
        } else if (table === 'global_leaderboard') {
          setTimeout(() => callback({ data: mockLeaderboard, error: null }), 500);
        } else {
          setTimeout(() => callback({ data: [], error: null }), 500);
        }
        return Promise.resolve({ data: [], error: null });
      }
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => ({
          then: (callback: (result: any) => void) => {
            setTimeout(() => callback({ data: { id: 'mock-id', ...data }, error: null }), 500);
            return Promise.resolve({ data: null, error: null });
          }
        }),
        then: (callback: (result: any) => void) => {
          setTimeout(() => callback({ data: [{ id: 'mock-id', ...data }], error: null }), 500);
          return Promise.resolve({ data: [], error: null });
        }
      }),
      then: (callback: (result: any) => void) => {
        setTimeout(() => callback({ data: { id: 'mock-id', ...data }, error: null }), 500);
        return Promise.resolve({ data: null, error: null });
      }
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: (callback: (result: any) => void) => {
          setTimeout(() => callback({ data: null, error: null }), 500);
          return Promise.resolve({ data: null, error: null });
        }
      })
    })
  }),
  auth: {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            user_metadata: { username: credentials.email.split('@')[0] }
          },
          session: { access_token: 'mock-token' }
        },
        error: null
      };
    },
    signUp: async (credentials: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        data: {
          user: {
            id: 'mock-user-id',
            email: credentials.email,
            user_metadata: credentials.options?.data || {}
          },
          session: null
        },
        error: null
      };
    },
    signOut: async () => {
      return { error: null };
    },
    getSession: async () => {
      return { data: { session: null }, error: null };
    }
  }
};

console.log('🎵 Using mock Supabase client - no backend required!');