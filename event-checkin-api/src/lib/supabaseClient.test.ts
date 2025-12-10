import { describe, it, expect } from 'vitest';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

describe('Supabase Client Initialization', () => {
  it('should create client with correct SUPABASE_URL', () => {
    expect(SUPABASE_URL).toBe('https://mbqrbqfvbootqoyyqfvg.supabase.co');
  });

  it('should create client with correct SUPABASE_ANON_KEY', () => {
    expect(SUPABASE_ANON_KEY).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXJicWZ2Ym9vdHFveXlxZnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTc1NjUsImV4cCI6MjA4MDg3MzU2NX0.BzFQgthCxxKbo0cjFdOx-MHUGWp4nGL3RnkWDEsMK6s');
  });

  it('should create a valid Supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
  });
});
