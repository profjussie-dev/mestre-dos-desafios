import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, GraduationCap, Share2, Clock, ShieldCheck } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

export default function Home({ user }: { user: User | null }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-amber-500">
          <Trophy className="h-8 w-8" />
          <span>MESTRE DO DESAFIO</span>
        </div>
        <nav>
          {user ? (
            <Link 
              to="/dashboard" 
              className="rounded-full bg-amber-500 px-6 py-2 font-bold text-slate-950 transition-transform hover:scale-105 active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="rounded-full border border-slate-800 bg-slate-900 px-6 py-2 font-bold transition-colors hover:bg-slate-800"
            >
              Entrar
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-5xl font-black leading-tight md:text-7xl">
            Transforme suas aulas em <br />
            <span className="bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              Experiências Gamificadas
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
            Crie desafios de perguntas personalizados para seus alunos. 
            Simples, gratuito e focado no engajamento pedagógico.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to={user ? "/dashboard" : "/login"} 
              className="rounded-full bg-amber-500 px-8 py-4 text-lg font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 hover:shadow-amber-500/40 active:scale-95"
            >
              Começar Agora — É Grátis
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="mt-32 grid gap-8 md:grid-cols-3">
          <FeatureCard 
            icon={<GraduationCap className="h-8 w-8 text-amber-500" />}
            title="Foco Pedagógico"
            description="Desenvolvido para professores que buscam novas formas de revisar conteúdos."
          />
          <FeatureCard 
            icon={<Share2 className="h-8 w-8 text-emerald-500" />}
            title="Compartilhamento Fácil"
            description="Gere um link e envie para sua turma em segundos. Sem necessidade de cadastro para alunos."
          />
          <FeatureCard 
            icon={<Clock className="h-8 w-8 text-blue-500" />}
            title="Auto-limpeza"
            description="Os desafios expiram em 30 dias, mantendo o sistema leve e focado no que é atual."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12 text-center text-slate-500">
        <p>© 2026 Mestre do Desafio por Prof. Me. Flávio Jussiê. 100% gratuito para educadores.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="rounded-3xl border border-slate-900 bg-slate-900/50 p-8 text-left transition-colors hover:border-slate-800">
      <div className="mb-4 inline-block rounded-2xl bg-slate-950 p-3">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-slate-400">{description}</p>
    </div>
  );
}
