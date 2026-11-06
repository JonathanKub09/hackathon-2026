import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Beide Werte sind öffentlich und landen ohnehin im Browser, die Rechte liegen in der Datenbank.
// Die Standardwerte sorgen dafür, dass die App auch ohne oder mit leerer .env.local funktioniert.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://syxoiaqfajvzupesoqcg.supabase.co'
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VG1_lwIdMk7P_5t7qjofoQ_h62Tj-es'

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY)

export const CV_BUCKET = 'cvs'
