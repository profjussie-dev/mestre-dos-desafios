import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Trophy, LogOut, LayoutDashboard, Settings, User, Plus } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Layout({ children, user }: { children: React.ReactNode, user: SupabaseUser }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-white leading-relaxed">
      {/* Sidebar for Desktop */}
      <aside className="fixed bottom-0 left-0 top-0 hidden w-64 border-r border-slate-900 bg-slate-950 md:block">
        <div className="flex h-full flex-col p-6">
          <Link to="/" className="mb-10 flex items-center gap-2 text-xl font-black tracking-tighter text-amber-500">
            <Trophy className="h-6 w-6" />
            <span>MESTRE DO DESAFIO</span>
          </Link>

          <nav className="flex-1 space-y-2">
            <SidebarLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
            <SidebarLink to="/editor" icon={<Plus className="h-5 w-5" />} label="Novo Desafio" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-900">
            <div className="mb-4 flex items-center gap-3 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <User className="h-4 w-4" />
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="text-xs text-slate-500">Professor</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Criado por:
              <br />
              <span className="text-slate-500">Prof. Me. Flávio Jussiê</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-slate-900 bg-slate-950/80 px-6 backdrop-blur-lg md:hidden">
        <nav className="flex w-full items-center justify-between">
          <MobileNavLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Painel" />
          <MobileNavLink to="/editor" icon={<Plus className="h-5 w-5" />} label="Criar" />
          <button 
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 text-slate-500"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sair</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:ml-64 md:pb-0">
        <div className="container mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const isActive = window.location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition-all ${
        isActive 
          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
          : 'text-slate-400 hover:bg-slate-900 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNavLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const isActive = window.location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center gap-1 transition-colors ${
        isActive ? 'text-amber-500' : 'text-slate-500'
      }`}
    >
      <div className={`rounded-xl p-1 ${isActive ? 'bg-amber-500/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
}
