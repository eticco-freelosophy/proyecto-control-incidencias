import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Tipos de datos para TypeScript
export interface Project {
  id: string;
  project_id: string;
  type: 'ODO' | 'ALF' | 'EJF' | 'BYT' | 'ETI';
  name: string;
  checked: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateLog {
  id: number;
  updated_at: string;
  description?: string;
}