// src/integrations/supabase/types.ts - UPDATED WITH COMPLETE SCHEMA

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          vocal_range_low: string | null
          vocal_range_high: string | null
          total_practice_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          vocal_range_low?: string | null
          vocal_range_high?: string | null
          total_practice_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          vocal_range_low?: string | null
          vocal_range_high?: string | null
          total_practice_time?: number
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          preferred_genres: string[]
          mic_sensitivity: number
          mic_monitor_volume: number
          music_volume: number
          pitch_display_mode: 'note' | 'frequency' | 'both'
          theme: 'dark' | 'light' | 'auto'
          enable_metronome: boolean
          auto_scroll_lyrics: boolean
          show_chords: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_genres?: string[]
          mic_sensitivity?: number
          mic_monitor_volume?: number
          music_volume?: number
          pitch_display_mode?: 'note' | 'frequency' | 'both'
          theme?: 'dark' | 'light' | 'auto'
          enable_metronome?: boolean
          auto_scroll_lyrics?: boolean
          show_chords?: boolean
        }
        Update: {
          preferred_genres?: string[]
          mic_sensitivity?: number
          mic_monitor_volume?: number
          music_volume?: number
          pitch_display_mode?: 'note' | 'frequency' | 'both'
          theme?: 'dark' | 'light' | 'auto'
          enable_metronome?: boolean
          auto_scroll_lyrics?: boolean
          show_chords?: boolean
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          genre: string
          difficulty: 'Easy' | 'Medium' | 'Hard'
          youtube_video_id: string | null
          duration: number | null
          tempo: number | null
          key: string | null
          lyrics: Json | null
          chords: Json | null
          sheet_music_url: string | null
          album_art_url: string | null
          popularity_score: number
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          genre: string
          difficulty: 'Easy' | 'Medium' | 'Hard'
          youtube_video_id?: string | null
          duration?: number | null
          tempo?: number | null
          key?: string | null
          lyrics?: Json | null
          chords?: Json | null
          sheet_music_url?: string | null
          album_art_url?: string | null
          popularity_score?: number
          is_featured?: boolean
        }
        Update: {
          title?: string
          artist?: string
          genre?: string
          difficulty?: 'Easy' | 'Medium' | 'Hard'
          youtube_video_id?: string | null
          duration?: number | null
          tempo?: number | null
          key?: string | null
          lyrics?: Json | null
          chords?: Json | null
          sheet_music_url?: string | null
          album_art_url?: string | null
          popularity_score?: number
          is_featured?: boolean
          updated_at?: string
        }
      }
      practice_sessions: {
        Row: {
          id: string
          user_id: string
          song_id: string
          started_at: string
          ended_at: string | null
          duration: number | null
          score_percentage: number | null
          pitch_accuracy_series: Json | null
          average_pitch_accuracy: number | null
          notes_hit: number
          notes_missed: number
          perfect_notes: number
          max_combo: number
          recording_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          song_id: string
          started_at: string
          ended_at?: string | null
          duration?: number | null
          score_percentage?: number | null
          pitch_accuracy_series?: Json | null
          average_pitch_accuracy?: number | null
          notes_hit?: number
          notes_missed?: number
          perfect_notes?: number
          max_combo?: number
          recording_url?: string | null
        }
        Update: {
          ended_at?: string | null
          duration?: number | null
          score_percentage?: number | null
          pitch_accuracy_series?: Json | null
          average_pitch_accuracy?: number | null
          notes_hit?: number
          notes_missed?: number
          perfect_notes?: number
          max_combo?: number
          recording_url?: string | null
        }
      }
      user_points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          weekly_points: number
          monthly_points: number
          level: number
          experience: number
          streak_days: number
          last_practice_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          weekly_points?: number
          monthly_points?: number
          level?: number
          experience?: number
          streak_days?: number
          last_practice_date?: string | null
        }
        Update: {
          total_points?: number
          weekly_points?: number
          monthly_points?: number
          level?: number
          experience?: number
          streak_days?: number
          last_practice_date?: string | null
          updated_at?: string
        }
      }
      leaderboard: {
        Row: {
          id: string
          song_id: string | null
          user_id: string
          score: number
          rank: number | null
          timeframe: 'all_time' | 'weekly' | 'monthly'
          recording_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          song_id?: string | null
          user_id: string
          score: number
          rank?: number | null
          timeframe: 'all_time' | 'weekly' | 'monthly'
          recording_url?: string | null
        }
        Update: {
          score?: number
          rank?: number | null
          recording_url?: string | null
          updated_at?: string
        }
      }
      competitions: {
        Row: {
          id: string
          name: string
          description: string | null
          song_id: string | null
          start_date: string
          end_date: string
          prize_description: string | null
          entry_fee_points: number
          status: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants: number | null
          current_participants: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          song_id?: string | null
          start_date: string
          end_date: string
          prize_description?: string | null
          entry_fee_points?: number
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants?: number | null
          current_participants?: number
          created_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          song_id?: string | null
          start_date?: string
          end_date?: string
          prize_description?: string | null
          entry_fee_points?: number
          status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
          max_participants?: number | null
          current_participants?: number
          updated_at?: string
        }
      }
      competition_entries: {
        Row: {
          id: string
          competition_id: string
          user_id: string
          song_id: string | null
          score: number
          recording_url: string | null
          votes: number
          rank: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          competition_id: string
          user_id: string
          song_id?: string | null
          score: number
          recording_url?: string | null
          votes?: number
          rank?: number | null
        }
        Update: {
          score?: number
          recording_url?: string | null
          votes?: number
          rank?: number | null
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          category: string | null
          requirement_type: string
          requirement_value: number
          points_reward: number
          rarity: 'common' | 'rare' | 'epic' | 'legendary'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          category?: string | null
          requirement_type: string
          requirement_value: number
          points_reward?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
        }
        Update: {
          name?: string
          description?: string | null
          icon?: string | null
          category?: string | null
          requirement_type?: string
          requirement_value?: number
          points_reward?: number
          rarity?: 'common' | 'rare' | 'epic' | 'legendary'
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          unlocked_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'blocked'
          updated_at?: string
        }
      }
    }
    Views: {
      global_leaderboard: {
        Row: {
          rank: number | null
          username: string
          avatar_url: string | null
          score: number
          updated_at: string
          total_points: number
          level: number
        }
      }
      user_statistics: {
        Row: {
          id: string
          username: string
          total_sessions: number
          average_score: number | null
          total_practice_time: number | null
          total_points: number
          level: number
          streak_days: number
          achievements_unlocked: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never