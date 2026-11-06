import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn('VITE_SUPABASE_URL oder VITE_SUPABASE_ANON_KEY fehlt. Siehe .env.example')
}

export const supabase = createClient<Database>(url ?? 'http://localhost', anonKey ?? 'missing-key')

export const CV_BUCKET = 'cvs'
