export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string
          content: string
          created_at: string
          id: string
          is_from_admin: boolean | null
          recipient_id: string
          subject: string | null
        }
        Insert: {
          admin_id: string
          content: string
          created_at?: string
          id?: string
          is_from_admin?: boolean | null
          recipient_id: string
          subject?: string | null
        }
        Update: {
          admin_id?: string
          content?: string
          created_at?: string
          id?: string
          is_from_admin?: boolean | null
          recipient_id?: string
          subject?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verifications: {
        Row: {
          admin_comment: string | null
          document_type: string
          file_path: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          tutor_id: string
        }
        Insert: {
          admin_comment?: string | null
          document_type: string
          file_path: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          tutor_id: string
        }
        Update: {
          admin_comment?: string | null
          document_type?: string
          file_path?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          tutor_id?: string
        }
        Relationships: []
      }
      favorite_tutors: {
        Row: {
          created_at: string | null
          id: string
          student_id: string
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          student_id: string
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          student_id?: string
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_tutors_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_tutors_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      google_meet_sessions: {
        Row: {
          created_at: string
          id: string
          lesson_id: string
          meet_link: string
          meeting_id: string | null
          organizer_id: string
          participant_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id: string
          meet_link: string
          meeting_id?: string | null
          organizer_id: string
          participant_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string
          meet_link?: string
          meeting_id?: string | null
          organizer_id?: string
          participant_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homework: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          feedback: string | null
          file_path: string | null
          grade: number | null
          id: string
          status: string | null
          student_id: string | null
          subject_id: string | null
          title: string
          tutor_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          feedback?: string | null
          file_path?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          title: string
          tutor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          feedback?: string | null
          file_path?: string | null
          grade?: number | null
          id?: string
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          title?: string
          tutor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homework_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_chat: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          lesson_id: string | null
          message_type: string
          parent_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lesson_id?: string | null
          message_type?: string
          parent_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          lesson_id?: string | null
          message_type?: string
          parent_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_chat_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_chat_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lesson_chat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_chat_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_layouts: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          layout_config: Json
          layout_name: string
          subject_type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout_config: Json
          layout_name: string
          subject_type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          layout_config?: Json
          layout_name?: string
          subject_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_layouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_materials: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          file_path: string | null
          id: string
          lesson_id: string | null
          material_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          lesson_id?: string | null
          material_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          file_path?: string | null
          id?: string
          lesson_id?: string | null
          material_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_materials_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          responded_at: string | null
          status: string
          student_id: string
          subject_id: string | null
          tutor_id: string
          tutor_response: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          requested_date: string
          requested_end_time: string
          requested_start_time: string
          responded_at?: string | null
          status?: string
          student_id: string
          subject_id?: string | null
          tutor_id: string
          tutor_response?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          requested_date?: string
          requested_end_time?: string
          requested_start_time?: string
          responded_at?: string | null
          status?: string
          student_id?: string
          subject_id?: string | null
          tutor_id?: string
          tutor_response?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_requests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          lesson_notes: string | null
          lesson_type: string | null
          recording_url: string | null
          start_time: string
          status: string | null
          student_id: string | null
          subject_id: string | null
          tutor_id: string | null
          updated_at: string | null
          whiteboard_data: Json | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          lesson_notes?: string | null
          lesson_type?: string | null
          recording_url?: string | null
          start_time: string
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          tutor_id?: string | null
          updated_at?: string | null
          whiteboard_data?: Json | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          lesson_notes?: string | null
          lesson_type?: string | null
          recording_url?: string | null
          start_time?: string
          status?: string | null
          student_id?: string | null
          subject_id?: string | null
          tutor_id?: string | null
          updated_at?: string | null
          whiteboard_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          receiver_id: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          receiver_id?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      miro_boards: {
        Row: {
          board_id: string
          board_url: string
          created_at: string
          creator_id: string
          id: string
          lesson_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          board_id: string
          board_url: string
          created_at?: string
          creator_id: string
          id?: string
          lesson_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          board_id?: string
          board_url?: string
          created_at?: string
          creator_id?: string
          id?: string
          lesson_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          first_name: string | null
          id: string
          is_blocked: boolean | null
          last_name: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          is_blocked?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_name?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          budget: number | null
          educational_level: string | null
          grade: string | null
          id: string
          learning_goals: string | null
          preferred_format: string[] | null
          school: string | null
          subjects: string[] | null
        }
        Insert: {
          budget?: number | null
          educational_level?: string | null
          grade?: string | null
          id: string
          learning_goals?: string | null
          preferred_format?: string[] | null
          school?: string | null
          subjects?: string[] | null
        }
        Update: {
          budget?: number | null
          educational_level?: string | null
          grade?: string | null
          id?: string
          learning_goals?: string | null
          preferred_format?: string[] | null
          school?: string | null
          subjects?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tutor_relationships: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          student_id: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          student_id: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          student_id?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_tutor_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tutor_relationships_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      tutor_profiles: {
        Row: {
          achievements: string | null
          degree: string | null
          education_institution: string | null
          education_verified: boolean | null
          experience: number | null
          graduation_year: number | null
          id: string
          is_published: boolean | null
          methodology: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          achievements?: string | null
          degree?: string | null
          education_institution?: string | null
          education_verified?: boolean | null
          experience?: number | null
          graduation_year?: number | null
          id: string
          is_published?: boolean | null
          methodology?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          achievements?: string | null
          degree?: string | null
          education_institution?: string | null
          education_verified?: boolean | null
          experience?: number | null
          graduation_year?: number | null
          id?: string
          is_published?: boolean | null
          methodology?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          student_id: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          student_id: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          student_id?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_reviews_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_reviews_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tutor_schedule_exceptions: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_full_day: boolean | null
          reason: string | null
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_full_day?: boolean | null
          reason?: string | null
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_full_day?: boolean | null
          reason?: string | null
          tutor_id?: string
        }
        Relationships: []
      }
      tutor_subjects: {
        Row: {
          category_id: string | null
          description: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          subject_id: string | null
          tutor_id: string | null
        }
        Insert: {
          category_id?: string | null
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          tutor_id?: string | null
        }
        Update: {
          category_id?: string | null
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          tutor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tutor_subjects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_subjects_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_oauth_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          provider: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      block_user: {
        Args: { user_id_param: string; block_status: boolean }
        Returns: boolean
      }
      create_homework: {
        Args: {
          tutor_id: string
          student_id: string
          subject_id: string
          title: string
          description: string
          file_path: string
          due_date: string
        }
        Returns: string
      }
      delete_user_profile: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      generate_tutor_time_slots: {
        Args: { p_tutor_id: string; p_date: string }
        Returns: {
          slot_id: string
          start_time: string
          end_time: string
          is_available: boolean
        }[]
      }
      get_admin_messages_for_user: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          subject: string
          content: string
          created_at: string
          is_from_admin: boolean
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_profile: {
        Args: { user_id?: string }
        Returns: {
          id: string
          first_name: string
          last_name: string
          avatar_url: string
          bio: string
          city: string
          phone: string
          role: string
          created_at: string
          updated_at: string
        }[]
      }
      log_admin_action: {
        Args: {
          action_text: string
          target_type_param?: string
          target_id_param?: string
          details_param?: Json
        }
        Returns: string
      }
      send_admin_message: {
        Args: {
          recipient_id_param: string
          subject_param: string
          content_param: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
