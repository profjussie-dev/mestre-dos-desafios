-- Execute este SQL no editor de SQL do seu projeto Supabase para habilitar o Ranking

-- 1. Tabela de Leaderboard (Ranking)
CREATE TABLE leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  roulette_id UUID REFERENCES roulettes(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_class TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  -- Garante que um aluno (nome+turma) seja único por roleta para o upsert funcionar
  UNIQUE(roulette_id, player_name, player_class)
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Segurança

-- Qualquer pessoa pode ver o ranking (Alunos no jogo)
CREATE POLICY "Qualquer pessoa pode ver o ranking" 
ON leaderboard FOR SELECT 
USING (true);

-- Alunos podem inserir/atualizar seus próprios pontos (Anônimo)
CREATE POLICY "Alunos podem registrar seus pontos" 
ON leaderboard FOR INSERT 
WITH CHECK (true);

-- Alunos podem atualizar seus pontos via upsert
CREATE POLICY "Alunos podem atualizar seus próprios pontos" 
ON leaderboard FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Professores podem excluir registros se necessário
CREATE POLICY "Professores podem gerenciar o ranking" 
ON leaderboard FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM roulettes 
  WHERE roulettes.id = leaderboard.roulette_id 
  AND roulettes.teacher_id = auth.uid()
));

-- 4. Índice para busca rápida de ranking
CREATE INDEX idx_leaderboard_roulette_score ON leaderboard(roulette_id, score DESC);
