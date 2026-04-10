-- Execute este SQL no editor de SQL do seu projeto Supabase

-- 1. Tabela de Roletas
CREATE TABLE roulettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE roulettes ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança

-- Professores podem ver apenas suas próprias roletas
CREATE POLICY "Professores podem ver suas roletas" 
ON roulettes FOR SELECT 
USING (auth.uid() = teacher_id);

-- Alunos podem ver qualquer roleta pelo ID (para jogar)
CREATE POLICY "Alunos podem ver roletas pelo ID" 
ON roulettes FOR SELECT 
USING (true);

-- Professores podem inserir suas próprias roletas
CREATE POLICY "Professores podem criar roletas" 
ON roulettes FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

-- Professores podem atualizar suas próprias roletas
CREATE POLICY "Professores podem editar suas roletas" 
ON roulettes FOR UPDATE 
USING (auth.uid() = teacher_id);

-- Professores podem excluir suas próprias roletas
CREATE POLICY "Professores podem excluir suas roletas" 
ON roulettes FOR DELETE 
USING (auth.uid() = teacher_id);

-- 4. Índice para busca rápida e expiração
CREATE INDEX idx_roulettes_teacher_id ON roulettes(teacher_id);
CREATE INDEX idx_roulettes_expires_at ON roulettes(expires_at);
