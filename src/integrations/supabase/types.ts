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
      auth: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject_id?: string
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
      homework: {
        Row: {
          answer: string | null
          answer_file_path: string | null
          created_at: string
          description: string
          due_date: string
          feedback: string | null
          file_path: string | null
          grade: number | null
          id: string
          status: string
          student_id: string
          subject_id: string
          title: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answer_file_path?: string | null
          created_at?: string
          description: string
          due_date: string
          feedback?: string | null
          file_path?: string | null
          grade?: number | null
          id?: string
          status?: string
          student_id: string
          subject_id: string
          title: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answer_file_path?: string | null
          created_at?: string
          description?: string
          due_date?: string
          feedback?: string | null
          file_path?: string | null
          grade?: number | null
          id?: string
          status?: string
          student_id?: string
          subject_id?: string
          title?: string
          tutor_id?: string
          updated_at?: string
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
      lessons: {
        Row: {
          created_at: string
          date: string
          duration: number
          id: string
          status: string
          student_id: string
          subject_id: string
          time: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: number
          id?: string
          status?: string
          student_id: string
          subject_id: string
          time: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          id?: string
          status?: string
          student_id?: string
          subject_id?: string
          time?: string
          tutor_id?: string
          updated_at?: string
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
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          related_to_request_id: string | null
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          related_to_request_id?: string | null
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          related_to_request_id?: string | null
          sender_id?: string
          subject?: string
          updated_at?: string
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
            foreignKeyName: "messages_related_to_request_id_fkey"
            columns: ["related_to_request_id"]
            isOneToOne: false
            referencedRelation: "student_requests"
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
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name?: string | null
          phone?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          status: string
          student_id: string
          subject_id: string | null
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          status: string
          student_id: string
          subject_id?: string | null
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          student_id?: string
          subject_id?: string | null
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_requests_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_requests_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      tutor_materials: {
        Row: {
          created_at: string
          description: string | null
          id: string
          subject_id: string | null
          title: string
          tutor_id: string
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id?: string | null
          title: string
          tutor_id: string
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id?: string | null
          title?: string
          tutor_id?: string
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_materials_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_profiles: {
        Row: {
          achievements: string | null
          created_at: string
          degree: string
          education_institution: string
          education_verified: boolean
          experience: number | null
          graduation_year: number
          id: string
          methodology: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          achievements?: string | null
          created_at?: string
          degree: string
          education_institution: string
          education_verified?: boolean
          experience?: number | null
          graduation_year: number
          id: string
          methodology?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          achievements?: string | null
          created_at?: string
          degree?: string
          education_institution?: string
          education_verified?: boolean
          experience?: number | null
          graduation_year?: number
          id?: string
          methodology?: string | null
          updated_at?: string
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
          created_at: string
          id: string
          lesson_id: string | null
          rating: number
          student_id: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          rating: number
          student_id: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          rating?: number
          student_id?: string
          tutor_id?: string
          updated_at?: string
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
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          tutor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          tutor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          tutor_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_schedule_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_subjects: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          experience_years: number | null
          hourly_rate: number
          id: string
          is_active: boolean
          subject_id: string
          tutor_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate: number
          id?: string
          is_active?: boolean
          subject_id: string
          tutor_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number
          id?: string
          is_active?: boolean
          subject_id?: string
          tutor_id?: string
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
      пользователи: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_student_of_tutor: {
        Args: { student_id: string; tutor_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
