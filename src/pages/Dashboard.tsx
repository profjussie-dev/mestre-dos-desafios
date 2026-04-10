import { useEffect, useState } from 'react';
import { supabase, type Roulette } from '../lib/supabase';
import Layout from '../components/Layout';
import { Plus, Share2, Trash2, Edit3, ExternalLink, Clock, AlertCircle, Trophy, Crown, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { User } from '@supabase/supabase-js';

export default function Dashboard({ user }: { user: User }) {
  const [roulettes, setRoulettes] = useState<Roulette[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRanking, setSelectedRanking] = useState<any[] | null>(null);
  const [rankingTitle, setRankingTitle] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    fetchRoulettes();
  }, []);

  const fetchRoulettes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('roulettes')
      .select('*')
      .eq('teacher_id', user.id)
      .gt('expires_at', new Date().toISOString()) // Only non-expired
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRoulettes(data);
    }
    setLoading(false);
  };

  const deleteRoulette = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;
    
    const { error } = await supabase
      .from('roulettes')
      .delete()
      .eq('id', id);

    if (!error) {
      setRoulettes(roulettes.filter(r => r.id !== id));
    }
  };

  const copyLink = (roulette: Roulette) => {
    const identifier = roulette.short_code || roulette.id;
    const url = `${window.location.origin}/play/${identifier}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  const fetchRanking = async (rouletteId: string, title: string) => {
    setRankingTitle(title);
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('roulette_id', rouletteId)
      .order('score', { ascending: false });
    
    setSelectedRanking(data || []);
    setClassFilter('all');
  };

  const deleteRankingEntry = async (id: string) => {
    if (!confirm('Deseja realmente remover este aluno do ranking?')) return;
    
    const { error } = await supabase
      .from('leaderboard')
      .delete()
      .eq('id', id);

    if (!error) {
      setSelectedRanking(prev => prev ? prev.filter(entry => entry.id !== id) : null);
    }
  };

  const filteredRanking = selectedRanking?.filter(entry => 
    classFilter === 'all' || entry.player_class === classFilter
  ) || [];

  const uniqueClasses = Array.from(new Set(selectedRanking?.map(r => r.player_class) || [])).sort();

  return (
    <Layout user={user}>
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Meus Desafios</h1>
          <p className="text-slate-400">Gerencie seus jogos e compartilhe com as turmas.</p>
        </div>
        <Link 
          to="/editor" 
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          Novo Desafio
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-900"></div>
          ))}
        </div>
      ) : roulettes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-800 py-20 text-center">
          <div className="mb-4 rounded-full bg-slate-900 p-4">
            <AlertCircle className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold">Nenhum desafio encontrado</h3>
          <p className="mb-6 text-slate-400">Você ainda não criou nenhum jogo.</p>
          <Link to="/editor" className="text-amber-500 hover:underline">Criar meu primeiro desafio</Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roulettes.map((roulette) => (
            <div key={roulette.id} className="group relative overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/50 p-6 transition-all hover:border-slate-800 hover:bg-slate-900">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-bold">{roulette.title}</h3>
                <div className="flex gap-1">
                  <button 
                    onClick={() => fetchRanking(roulette.id, roulette.title)}
                    className="rounded-lg p-3 text-slate-400 hover:bg-amber-500/10 hover:text-amber-500 active:scale-90"
                    title="Ver Ranking"
                  >
                    <Trophy className="h-5 w-5" />
                  </button>
                  <Link 
                    to={`/editor/${roulette.id}`}
                    className="rounded-lg p-3 text-slate-400 hover:bg-slate-800 hover:text-white active:scale-90"
                  >
                    <Edit3 className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => deleteRoulette(roulette.id)}
                    className="rounded-lg p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 active:scale-90"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6 space-y-2 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Expira {formatDistanceToNow(new Date(roulette.expires_at), { addSuffix: true, locale: ptBR })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>{roulette.data.categories.length} Categorias</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => copyLink(roulette)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold transition-all hover:bg-slate-700 active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" />
                  Copiar Link
                </button>
                <Link 
                  to={`/play/${roulette.short_code || roulette.id}`}
                  target="_blank"
                  className="flex items-center justify-center rounded-xl bg-amber-500/10 px-5 py-3 text-amber-500 transition-all hover:bg-amber-500/20 active:scale-[0.98]"
                >
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Ranking Modal */}
      {selectedRanking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Ranking do Desafio</h2>
                <p className="text-slate-400">{rankingTitle}</p>
              </div>
              <div className="flex items-center gap-4">
                {uniqueClasses.length > 0 && (
                  <div className="relative">
                    <select 
                      value={classFilter}
                      onChange={(e) => setClassFilter(e.target.value)}
                      className="appearance-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 pr-10 text-sm font-bold outline-none focus:border-amber-500/50"
                    >
                      <option value="all">Todas as Turmas</option>
                      {uniqueClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  </div>
                )}
                <button 
                  onClick={() => setSelectedRanking(null)}
                  className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredRanking.length === 0 ? (
                <div className="py-10 text-center text-slate-500">
                  Nenhum registro encontrado para esta turma.
                </div>
              ) : (
                filteredRanking.map((entry, idx) => (
                  <div 
                    key={entry.id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                      idx === 0 
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-500' 
                        : 'border-slate-800 bg-slate-950 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-black">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold">
                          {idx === 0 && <Crown className="h-4 w-4 fill-amber-500" />}
                          {entry.player_name}
                        </div>
                        <div className="text-xs opacity-50 uppercase tracking-widest">{entry.player_class}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-black">{entry.score}</div>
                        <div className="text-[10px] opacity-40 uppercase">PONTOS</div>
                      </div>
                      <button 
                        onClick={() => deleteRankingEntry(entry.id)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Remover do Ranking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => setSelectedRanking(null)}
              className="mt-8 w-full rounded-2xl bg-slate-800 py-4 font-bold transition-colors hover:bg-slate-700"
            >
              FECHAR
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
