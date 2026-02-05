import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ufnofrpkcmxookprojmq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbm9mcnBrY214b29rcHJvam1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzExMDEsImV4cCI6MjA4NTg0NzEwMX0.yhNJ9irjfmxRoOXpXWROmCgCIxLgN_RyxuZfsUP2cmM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
