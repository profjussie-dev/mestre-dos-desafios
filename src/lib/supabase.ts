import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const generateShortCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 for clarity
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export type RouletteData = {
  categories: {
    name: string;
    color: string;
    questions: {
      context?: string;
      question: string;
      options: { text: string; isCorrect: boolean }[];
      explanation?: string;
    }[];
  }[];
};

export type Roulette = {
  id: string;
  teacher_id: string;
  title: string;
  short_code: string;
  allowed_classes: string[]; // List of classes allowed for this roulette
  data: RouletteData;
  created_at: string;
  expires_at: string;
};
