import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uuxxukpjkkvblazvtnut.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1eHh1a3Bqa2t2YmxhenZ0bnV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMzE4ODQsImV4cCI6MjA4OTYwNzg4NH0.vgtpCdG-4ulB9x6A8YtF0MqGYhu4Uayu1BYaAjfMTMg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
