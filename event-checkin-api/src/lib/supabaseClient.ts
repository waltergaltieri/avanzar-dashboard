import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mbqrbqfvbootqoyyqfvg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXJicWZ2Ym9vdHFveXlxZnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTc1NjUsImV4cCI6MjA4MDg3MzU2NX0.BzFQgthCxxKbo0cjFdOx-MHUGWp4nGL3RnkWDEsMK6s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export { SUPABASE_URL, SUPABASE_ANON_KEY };
