
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qjxhtllsaevjfhlfqnvu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqeGh0bGxzYWV2amZobGZxbnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxNjY3MjEsImV4cCI6MjA1NDc0MjcyMX0.90n9q2xWFNYij-TTEdvZc5KcgXXZw7LiQDvPhh6_5iw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'x-my-custom-header': 'plant-deco-app',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Test connection on initialization
console.log('🚀 Supabase client initialized');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Has key:', !!supabaseAnonKey);
