import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ufprndosuvqbrqlvndry.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmcHJuZG9zdXZxYnJxbHZuZHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODc2NTksImV4cCI6MjA5NjU2MzY1OX0.snIK-RxOLKEg8K5fYFOss512v-NSrRcHdexjv9FHDXg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
