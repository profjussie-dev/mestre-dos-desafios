import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Trophy, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('Too Many Requests')) {
        setError('Muitas tentativas! Por favor, aguarde alguns minutos antes de tentar novamente.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError(err.message || 'Ocorreu um erro na autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2 text-3xl font-black tracking-tighter text-amber-500">
          <Trophy className="h-10 w-10" />
          <span>MESTRE DO DESAFIO</span>
        </Link>

        <div className="rounded-3xl border border-slate-900 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="mb-2 text-2xl font-bold">
            {isSignUp ? 'Criar sua conta' : 'Bem-vindo de volta'}
          </h2>
          <p className="mb-8 text-slate-400">
            {isSignUp ? 'Comece a criar desafios para seus alunos hoje.' : 'Acesse seus desafios e gerencie seus jogos.'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                  placeholder="professor@escola.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-10 pr-4 outline-none transition-colors focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-slate-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta' : 'Entrar'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-slate-400 hover:text-amber-500"
            >
              {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem uma conta? Cadastre-se grátis'}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="fixed bottom-6 text-center opacity-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Criado pelo Prof. Me. Flávio Jussiê
        </p>
      </div>
    </div>
  );
}
