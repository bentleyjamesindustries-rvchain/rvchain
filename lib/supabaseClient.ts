import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our tables (add more as we expand)
export type Profile = {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}

export type Park = {
  id: string
  name: string
  city: string | null
  state: string | null
  lat: number | null
  lng: number | null
  rating: number
  price: number | null
  amenities: string[]
  description: string | null
  image: string | null
  submitted_by: string | null
  verified: boolean
  verification_tx: string | null
  verification_hash: string | null
  verification_ots: string | null
  verified_at: string | null
  verified_by: string | null
  created_at: string
}

export type ForumPost = {
  id: string
  user_id: string
  username: string
  category: string
  subcategory: string
  title: string
  body: string
  author_avatar: string | null
  created_at: string
}

export type Trip = {
  id: string
  user_id: string
  title: string
  start_date: string | null
  end_date: string | null
  created_at: string
}

export type TripPark = {
  id: string
  trip_id: string
  park_id: string
  visit_order: number
  notes: string | null
}