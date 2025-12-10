import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or Netlify environment variables.');
}

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
