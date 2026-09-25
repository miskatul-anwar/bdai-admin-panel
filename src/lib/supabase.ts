import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qcqwzeaoukkhfvhrbygf.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjcXd6ZWFvdWtraGZ2aHJieWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzIyMDIsImV4cCI6MjEwNTg0ODIwMn0.QTUyXl189Cy_1xFgz35980EUYC9al-5DjEyThxdOdp4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
