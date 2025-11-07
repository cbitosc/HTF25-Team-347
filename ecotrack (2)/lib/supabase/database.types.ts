export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "citizen" | "admin" | "collector" | "ngo"
          address: string | null
          lat: number | null
          lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role: "citizen" | "admin" | "collector" | "ngo"
          address?: string | null
          lat?: number | null
          lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "citizen" | "admin" | "collector" | "ngo"
          address?: string | null
          lat?: number | null
          lng?: number | null
          updated_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_pickups: number
          waste_collected: number
          co2_saved: number
          green_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_pickups?: number
          waste_collected?: number
          co2_saved?: number
          green_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          total_pickups?: number
          waste_collected?: number
          co2_saved?: number
          green_points?: number
          updated_at?: string
        }
      }
      pickups: {
        Row: {
          id: string
          user_id: string
          user_name: string
          address: string
          lat: number
          lng: number
          type: string
          quantity: number
          status: "Requested" | "Assigned" | "On the Way" | "Picked Up" | "Delivered"
          collector_id: string | null
          collector_name: string | null
          requested_date: string
          assigned_date: string | null
          picked_up_date: string | null
          delivered_date: string | null
          photo_proof: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          address: string
          lat: number
          lng: number
          type: string
          quantity: number
          status?: "Requested" | "Assigned" | "On the Way" | "Picked Up" | "Delivered"
          collector_id?: string | null
          collector_name?: string | null
          requested_date?: string
          assigned_date?: string | null
          picked_up_date?: string | null
          delivered_date?: string | null
          photo_proof?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_name?: string
          address?: string
          lat?: number
          lng?: number
          type?: string
          quantity?: number
          status?: "Requested" | "Assigned" | "On the Way" | "Picked Up" | "Delivered"
          collector_id?: string | null
          collector_name?: string | null
          assigned_date?: string | null
          picked_up_date?: string | null
          delivered_date?: string | null
          photo_proof?: string | null
          updated_at?: string
        }
      }
      donations: {
        Row: {
          id: string
          donor_id: string
          donor_name: string
          ngo_id: string
          item: string
          quantity: number
          address: string
          lat: number
          lng: number
          status: "Pending" | "Accepted" | "Declined" | "Completed"
          date: string
          pickup_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          donor_id: string
          donor_name: string
          ngo_id: string
          item: string
          quantity: number
          address: string
          lat: number
          lng: number
          status?: "Pending" | "Accepted" | "Declined" | "Completed"
          date?: string
          pickup_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          donor_name?: string
          ngo_id?: string
          item?: string
          quantity?: number
          address?: string
          lat?: number
          lng?: number
          status?: "Pending" | "Accepted" | "Declined" | "Completed"
          pickup_date?: string | null
          updated_at?: string
        }
      }
      ngos: {
        Row: {
          id: string
          name: string
          email: string
          address: string
          lat: number
          lng: number
          description: string
          accepted_waste_types: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          address: string
          lat: number
          lng: number
          description: string
          accepted_waste_types: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string
          address?: string
          lat?: number
          lng?: number
          description?: string
          accepted_waste_types?: string[]
          updated_at?: string
        }
      }
      ngo_inventory: {
        Row: {
          id: string
          ngo_id: string
          item: string
          quantity: number
          date: string
          unit: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ngo_id: string
          item: string
          quantity: number
          date: string
          unit: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          item?: string
          quantity?: number
          date?: string
          unit?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          user_id: string
          day_of_week: string
          waste_type: string
          recurring: boolean
          next_pickup: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: string
          waste_type: string
          recurring?: boolean
          next_pickup: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          day_of_week?: string
          waste_type?: string
          recurring?: boolean
          next_pickup?: string
          updated_at?: string
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
