import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user (from localStorage since we're using a simple login system)
export const getCurrentUser = () => {
  const userJson = localStorage.getItem('student')
  return userJson ? JSON.parse(userJson) : null
}

// Helper function to get current student ID
export const getCurrentStudentId = () => {
  const user = getCurrentUser()
  return user?.id
}
