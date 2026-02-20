import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mvuslmfjkkuizixjpkgl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dXNsbWZqa2t1aXppeGpwa2dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NzYyMDksImV4cCI6MjA4NTA1MjIwOX0.N2KDxKd_9cJNDS7B9szyA3Gkz8a-WrH14jfRciwrAX0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
