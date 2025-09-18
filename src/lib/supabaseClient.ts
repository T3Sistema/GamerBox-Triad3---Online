import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aisfizoyfpcisykarrnt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc2Zpem95ZnBjaXN5a2Fycm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NzcwMzgsImV4cCI6MjA2NTQ1MzAzOH0.UaFAu4KGFLqyJH3eNVteqYDreGRcX5ZpOB3mXz7_GMY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
