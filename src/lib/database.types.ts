// Aus der Datenbank generiert, nicht von Hand ändern. Neu erzeugen:
// npx supabase gen types typescript --project-id syxoiaqfajvzupesoqcg > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answer: string
          application_id: string
          question_id: string
        }
        Insert: {
          answer: string
          application_id: string
          question_id: string
        }
        Update: {
          answer?: string
          application_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          code: string
          created_at: string
          degree: string | null
          expected_graduation: string | null
          id: string
          languages: string[]
          skills: string[]
          status: Database["public"]["Enums"]["application_status"]
          study_program: string | null
          university: string | null
        }
        Insert: {
          code: string
          created_at?: string
          degree?: string | null
          expected_graduation?: string | null
          id?: string
          languages?: string[]
          skills?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          study_program?: string | null
          university?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          degree?: string | null
          expected_graduation?: string | null
          id?: string
          languages?: string[]
          skills?: string[]
          status?: Database["public"]["Enums"]["application_status"]
          study_program?: string | null
          university?: string | null
        }
        Relationships: []
      }
      applications_private: {
        Row: {
          application_id: string
          consent_privacy: boolean
          created_at: string
          cv_path: string | null
          demographics: Json
          email: string
          first_name: string
          last_name: string
          phone: string
        }
        Insert: {
          application_id: string
          consent_privacy: boolean
          created_at?: string
          cv_path?: string | null
          demographics?: Json
          email: string
          first_name: string
          last_name: string
          phone: string
        }
        Update: {
          application_id?: string
          consent_privacy?: boolean
          created_at?: string
          cv_path?: string | null
          demographics?: Json
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_private_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      educations: {
        Row: {
          application_id: string
          end_date: string
          id: string
          organization: string
          position: number
          start_date: string
          title: string
        }
        Insert: {
          application_id: string
          end_date: string
          id?: string
          organization: string
          position?: number
          start_date: string
          title: string
        }
        Update: {
          application_id?: string
          end_date?: string
          id?: string
          organization?: string
          position?: number
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "educations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          application_id: string
          details: string[]
          end_date: string
          id: string
          is_relevant: boolean
          organization: string
          position: number
          start_date: string
          title: string
        }
        Insert: {
          application_id: string
          details?: string[]
          end_date: string
          id?: string
          is_relevant?: boolean
          organization: string
          position?: number
          start_date: string
          title: string
        }
        Update: {
          application_id?: string
          details?: string[]
          end_date?: string
          id?: string
          is_relevant?: boolean
          organization?: string
          position?: number
          start_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          id: string
          max_length: number
          position: number
          text: string
        }
        Insert: {
          id?: string
          max_length?: number
          position: number
          text: string
        }
        Update: {
          id?: string
          max_length?: number
          position?: number
          text?: string
        }
        Relationships: []
      }
      rating_criteria: {
        Row: {
          description: string
          id: string
          is_active: boolean
          label: string
          position: number
          weight: number
        }
        Insert: {
          description?: string
          id: string
          is_active?: boolean
          label: string
          position?: number
          weight: number
        }
        Update: {
          description?: string
          id?: string
          is_active?: boolean
          label?: string
          position?: number
          weight?: number
        }
        Relationships: []
      }
      ratings: {
        Row: {
          application_id: string
          criterion_id: string
          score: number
          screener_id: string
        }
        Insert: {
          application_id: string
          criterion_id: string
          score: number
          screener_id: string
        }
        Update: {
          application_id?: string
          criterion_id?: string
          score?: number
          screener_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_application_id_screener_id_fkey"
            columns: ["application_id", "screener_id"]
            isOneToOne: false
            referencedRelation: "screening_assignments"
            referencedColumns: ["application_id", "screener_id"]
          },
          {
            foreignKeyName: "ratings_criterion_id_fkey"
            columns: ["criterion_id"]
            isOneToOne: false
            referencedRelation: "rating_criteria"
            referencedColumns: ["id"]
          },
        ]
      }
      screening_assignments: {
        Row: {
          application_id: string
          assigned_at: string
          comment: string | null
          completed_at: string | null
          screener_id: string
        }
        Insert: {
          application_id: string
          assigned_at?: string
          comment?: string | null
          completed_at?: string | null
          screener_id: string
        }
        Update: {
          application_id?: string
          assigned_at?: string
          comment?: string | null
          completed_at?: string | null
          screener_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "screening_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screening_assignments_screener_id_fkey"
            columns: ["screener_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["user_id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string
          display_name: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ranking: {
        Row: {
          application_id: string | null
          code: string | null
          created_at: string | null
          degree: string | null
          expected_graduation: string | null
          rank: number | null
          score: number | null
          screener_count: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          study_program: string | null
        }
        Relationships: []
      }
      ranking_admin: {
        Row: {
          application_id: string | null
          code: string | null
          created_at: string | null
          cv_path: string | null
          degree: string | null
          demographics: Json | null
          email: string | null
          expected_graduation: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          rank: number | null
          score: number | null
          screener_count: number | null
          status: Database["public"]["Enums"]["application_status"] | null
          study_program: string | null
        }
        Relationships: []
      }
      recruiter_view: {
        Row: {
          assigned_at: string | null
          code: string | null
          completed_at: string | null
          created_at: string | null
          degree: string | null
          expected_graduation: string | null
          id: string | null
          languages: string[] | null
          skills: string[] | null
          status: Database["public"]["Enums"]["application_status"] | null
          study_program: string | null
          university: string | null
        }
        Relationships: []
      }
      screener_scores: {
        Row: {
          application_id: string | null
          screener_id: string | null
          weighted_score: number | null
        }
        Relationships: []
      }
      screening_reviews: {
        Row: {
          application_id: string | null
          comment: string | null
          completed_at: string | null
          scores: Json | null
          screener_name: string | null
          weighted_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_application: { Args: { p: Json }; Returns: string }
      get_screening_progress: { Args: never; Returns: Json }
      set_application_status: {
        Args: {
          p_application_id: string
          p_status: Database["public"]["Enums"]["application_status"]
        }
        Returns: undefined
      }
      submit_rating: {
        Args: { p_application_id: string; p_comment?: string; p_scores: Json }
        Returns: undefined
      }
    }
    Enums: {
      application_status: "not_rated" | "rated" | "rejected" | "accepted"
      staff_role: "screener" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
