import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://poniwewcpopgqbvxgvkt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbml3ZXdjcG9wZ3Fidnhndmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDEzODIsImV4cCI6MjA5MzgxNzM4Mn0.r6G8X5R4Hzk2od8imjimnfy2xwwWaao8zLWOaJ1mmJg'

export const supabase = createClient(supabaseUrl, supabaseKey)