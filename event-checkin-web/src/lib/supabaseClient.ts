import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://mbqrbqfvbootqoyyqfvg.supabase.co";
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icXJicWZ2Ym9vdHFveXlxZnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTc1NjUsImV4cCI6MjA4MDg3MzU2NX0.BzFQgthCxxKbo0cjFdOx-MHUGWp4nGL3RnkWDEsMK6s";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Invitado {
  id?: number;
  nro: number;
  nombre_apellido: string;
  ingreso: string;
  confirmacion: string;
  gastos_pendientes: string;
  monto: number;
  codigo_entrada: string;
  confirmado: boolean;
  escaner: string | null;
  fecha_ingreso: string | null;
  hora_ingreso: string | null;
}
