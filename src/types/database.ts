export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          status: boolean
          created_by: string | null
          updated_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          status?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          status?: boolean
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          price: number
          discount_price: number | null
          images: string[]
          description: string
          specs: Json
          status: boolean
          is_featured: boolean
          created_by: string | null
          updated_by: string | null
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          price: number
          discount_price?: number | null
          images: string[]
          description: string
          specs?: Json
          status?: boolean
          is_featured?: boolean
          created_by?: string | null
          updated_by?: string | null
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          price?: number
          discount_price?: number | null
          images?: string[]
          description?: string
          specs?: Json
          status?: boolean
          is_featured?: boolean
          created_by?: string | null
          updated_by?: string | null
          category_id?: string
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          phone: string
          address: string
          note: string | null
          product_id: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          address: string
          note?: string | null
          product_id?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          address?: string
          note?: string | null
          product_id?: string | null
          status?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
