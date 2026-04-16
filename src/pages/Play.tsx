import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Roulette } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowRight, XCircle, CheckCircle2, Loader2, Crown, Users, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Play() {
  const { id } = useParams();
  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  
  // Scoring Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedPoints, setEarnedPoints] = useState<{ base: number; bonus: number } | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Leaderboard
  const [playerInfo, setPlayerInfo] = useState<{ name: string; class: string } | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempClass, setTempClass] = useState('');

  // Question Tracking
  const [usedQuestionTexts, setUsedQuestionTexts] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('mestredodesafio_player');
    if (saved) setPlayerInfo(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (id) fetchRoulette();
  }, [id]);

  const activeCategories = roulette?.data.categories.filter(cat => 
    cat.questions.some(q => !usedQuestionTexts.includes(q.question))
  ) || [];

  const fetchLeaderboard = async (rouletteId: string) => {
    if (!rouletteId) return;
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('roulette_id', rouletteId)
      .order('score', { ascending: false })
      .limit(10);
    if (data) setLeaderboard(data);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempName || !tempClass) return;
    const info = { name: tempName, class: tempClass };
    setPlayerInfo(info);
    localStorage.setItem('mestredodesafio_player', JSON.stringify(info));
  };

  const saveScore = async (newTotal: number) => {
    if (!roulette || !playerInfo) return;
    await supabase
      .from('leaderboard')
      .upsert({
        roulette_id: roulette.id,
        player_name: playerInfo.name,
        player_class: playerInfo.class,
        score: newTotal,
      }, { onConflict: 'roulette_id, player_name, player_class' });
    fetchLeaderboard(roulette.id);
  };

  // Auto-save score on completion
  useEffect(() => {
    if (roulette && activeCategories.length === 0 && score > 0 && !hasFinished) {
      saveScore(score);
      setHasFinished(true);
    }
  }, [activeCategories.length, score, roulette, hasFinished, id]);

  useEffect(() => {
    let interval: any;
    if (currentQuestion && !showResult && timeLeft > 0) {
      setTimerActive(true);
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else {
      setTimerActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [currentQuestion, showResult, timeLeft]);


  const fetchRoulette = async () => {
    let query = supabase.from('roulettes').select('*');
    
    // Check if ID is a UUID (36 chars) or a Short Code (6 chars)
    if (id?.length === 36) {
      query = query.eq('id', id);
    } else {
      query = query.eq('short_code', id);
    }

    const { data: roulette, error } = await query.single();

    if (error || !roulette) {
      setError('Desafio não encontrado ou expirado.');
    } else {
      setRoulette(roulette);
      fetchLeaderboard(roulette.id);
    }
    setLoading(false);
  };

  const spin = () => {
    if (isSpinning || !roulette) return;
    
    setIsSpinning(true);
    const extraDegrees = Math.floor(Math.random() * 2000) + 1500;
    const newRotation = rotation + extraDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      const finalAngle = (newRotation % 360);
      const pointerPos = (360 - finalAngle) % 360;
      
      const numCats = activeCategories.length;
      const arcSize = 360 / numCats;
      const catIndex = Math.floor(pointerPos / arcSize);
      
      const category = activeCategories[catIndex];
      const items = category.questions.filter(q => !usedQuestionTexts.includes(q.question));
      
      if (items.length > 0) {
        const qIndex = Math.floor(Math.random() * items.length);
        setCurrentQuestion({ ...items[qIndex], categoryName: category.name, categoryColor: category.color });
      }
    }, 4000);
  };

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowResult(true);
    setTimerActive(false);

    if (currentQuestion.options[index].isCorrect) {
      const bonus = Math.max(0, timeLeft * 2);
      const base = 10;
      setEarnedPoints({ base, bonus });
      const newTotal = score + base + bonus;
      setScore(newTotal);
      
      setUsedQuestionTexts(prev => [...prev, currentQuestion.question]);
      
      confetti({
        particleCount: 100 + bonus * 2,
        spread: 70 + bonus,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6']
      });
    } else {
      setEarnedPoints(null);
    }
  };

  const nextTurn = () => {
    setCurrentQuestion(null);
    setSelectedOption(null);
    setShowResult(false);
    setTimeLeft(60);
    setEarnedPoints(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-amber-500" />
        <p className="text-slate-400">Carregando desafio...</p>
      </div>
    );
  }

  if (error || !roulette) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <XCircle className="mb-4 h-16 w-16 text-red-500" />
        <h1 className="mb-2 text-3xl font-black">Ops!</h1>
        <p className="mb-8 text-slate-400">{error}</p>
        <Link to="/" className="rounded-xl bg-amber-500 px-8 py-3 font-bold text-slate-950">Voltar ao Início</Link>
      </div>
    );
  }

  if (!playerInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-slate-900 bg-slate-900/50 p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Users className="h-8 w-8" />
            </div>
            <h1 className="mb-2 text-2xl font-black">Quem está jogando?</h1>
            <p className="text-slate-400">Identifique-se para entrar no ranking!</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-500 uppercase tracking-widest">Seu Nome</label>
              <input 
                type="text" 
                required
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-bold outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-500 uppercase tracking-widest">Sua Turma</label>
              {roulette.allowed_classes && roulette.allowed_classes.length > 0 ? (
                <select
                  required
                  value={tempClass}
                  onChange={e => setTempClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-bold outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-slate-900">Selecione sua turma...</option>
                  {roulette.allowed_classes.map((cls, idx) => (
                    <option key={idx} value={cls} className="bg-slate-900">{cls}</option>
                  ))}
                </select>
              ) : (
                <input 
                  type="text" 
                  required
                  value={tempClass}
                  onChange={e => setTempClass(e.target.value)}
                  placeholder="Ex: 6º Ano A"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-bold outline-none focus:border-amber-500/50"
                />
              )}
            </div>
            <button 
              type="submit"
              className="w-full rounded-xl bg-amber-500 py-4 text-lg font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              COMEÇAR DESAFIO
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500/30">
      {/* Header */}
      <header className="container mx-auto flex flex-col items-center justify-between gap-4 p-4 md:flex-row md:items-start md:p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-lg font-black tracking-tighter text-amber-500">
            <Trophy className="h-6 w-6" />
            <span className="max-w-[250px] truncate md:max-w-none">{roulette.title}</span>
          </div>

          {/* Compact Ranking List */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <Crown className="h-3 w-3" />
              TOP 10 RANKING
            </div>
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar md:flex-col md:overflow-visible">
              {leaderboard.length === 0 ? (
                <div className="rounded-full border border-slate-900 bg-slate-900/30 px-4 py-1.5 text-[10px] text-slate-600 italic">
                  Nenhum registro ainda...
                </div>
              ) : (
                leaderboard.map((entry, idx) => (
                  <div 
                    key={idx}
                    className={`flex shrink-0 items-center justify-between gap-3 rounded-full border px-4 py-1.5 shadow-sm transition-all md:shrink ${
                      idx === 0 
                        ? 'border-amber-500/50 bg-amber-500/10 text-amber-500 shadow-amber-500/5' 
                        : 'border-slate-800 bg-slate-900/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap text-[11px] font-bold">
                      {idx === 0 && <Crown className="h-3 w-3 fill-amber-500" />}
                      <span className="opacity-50">#{idx + 1}</span>
                      <span className="truncate max-w-[80px] md:max-w-[120px]">{entry.player_name}</span>
                      <span className="text-[9px] opacity-40">— {entry.player_class}</span>
                    </div>
                    <div className="text-[11px] font-black">{entry.score}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 md:items-end">
          <div className="rounded-full bg-slate-900 px-5 py-1.5 text-[10px] font-black border border-slate-800 shadow-xl ring-2 ring-amber-500/20">
            PONTUAÇÃO: <span className="text-amber-500 ml-1 font-black">{score}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex flex-col items-center justify-center px-6 py-10">
        <div className="relative mb-12 flex flex-col items-center">
          {/* Pointer */}
          <div className="absolute -top-5 left-1/2 z-30 -translate-x-1/2 drop-shadow-lg">
            <div className="h-8 w-10 bg-white" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
          </div>
          
          {/* Wheel Container with background shadow ring */}
          <div className="relative rounded-full border-[12px] border-slate-900 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
            {/* The actual Wheel */}
            <div 
              className="relative h-64 w-64 overflow-hidden rounded-full transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1) md:h-[400px] md:w-[400px]"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                background: `conic-gradient(${
                  activeCategories.map((cat, i, arr) => 
                    `${cat.color} ${(i * 360) / arr.length}deg ${((i + 1) * 360) / arr.length}deg`
                  ).join(', ')
                })`
              }}
            >
              {/* Category Labels */}
              {activeCategories.map((cat, i, arr) => {
                const angle = (i * 360) / arr.length + (360 / arr.length) / 2;
                return (
                  <div 
                    key={`${cat.name}-${i}`}
                    className="absolute left-1/2 top-1/2 text-center text-[9px] font-black uppercase tracking-tighter text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] md:text-lg [--label-offset:-70px] md:[--label-offset:-150px]"
                    style={{ 
                      transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(var(--label-offset))`,
                      width: '180px',
                      lineHeight: '1.2'
                    }}
                  >
                    {cat.name}
                  </div>
                );
              })}
            </div>

            {/* Center Spindle */}
            <div className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-slate-900 bg-white shadow-xl md:h-14 md:w-14"></div>
          </div>
        </div>

        {activeCategories.length > 0 ? (
          <div className="w-full max-w-[220px]">
            <button 
              onClick={spin}
              disabled={isSpinning || !!currentQuestion}
              className="w-full rounded-3xl bg-amber-500 py-2.5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-[0_4px_0_rgb(180,110,0)] transition-all hover:scale-[1.02] active:translate-y-1 active:scale-95 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed md:py-3.5 md:text-lg"
            >
              {isSpinning ? 'SORTEANDO...' : 'SORTEAR'}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-amber-500 p-8 text-center text-slate-950 shadow-2xl"
          >
            <Crown className="mb-4 h-16 w-16" />
            <h2 className="mb-2 text-3xl font-black">MISSÃO CUMPRIDA!</h2>
            <p className="mb-6 font-bold opacity-80">Você completou todos os desafios!</p>
            <button 
              onClick={() => {
                setUsedQuestionTexts([]);
                setScore(0);
                setHasFinished(false);
              }}
              className="rounded-xl bg-slate-950 px-8 py-3 font-black text-white transition-all active:scale-95"
            >
              RECOMEÇAR TUDO
            </button>
          </motion.div>
        )}

        <footer className="mt-12 text-center pb-8 opacity-30">
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
            Criado pelo Prof. Me. Flávio Jussiê
          </p>
        </footer>
      </main>

      {/* Question Modal */}
      <AnimatePresence>
        {currentQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-slate-950/90 p-4 backdrop-blur-sm md:items-center md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="my-auto w-full max-w-[440px] rounded-3xl border border-slate-800 bg-slate-900 p-4 shadow-2xl md:p-5"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <span 
                  className="rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: currentQuestion.categoryColor }}
                >
                  {currentQuestion.categoryName}
                </span>
                
                <div className="flex items-center gap-2 font-black text-slate-400">
                  <span className={`text-base ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
                    {timeLeft}s
                  </span>
                </div>
              </div>

              {/* Timer Bar */}
              {!showResult && (
                <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-slate-800">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className={`h-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-amber-500'}`}
                  />
                </div>
              )}

              {currentQuestion.context && (
                <div className="mb-4 rounded-xl bg-slate-950 p-4 text-sm italic text-slate-400 border-l-4 border-amber-500">
                  "{currentQuestion.context}"
                </div>
              )}

              <h2 className="mb-4 text-base font-bold leading-snug md:text-lg">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-3">
                {currentQuestion.options.map((opt: any, i: number) => (
                  <button 
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={showResult}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm font-bold transition-all active:scale-[0.98] ${
                      showResult 
                        ? opt.isCorrect 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_4px_0_rgba(16,185,129,0.2)]' 
                          : i === selectedOption 
                            ? 'border-red-500 bg-red-500/10 text-red-500' 
                            : 'border-slate-800 bg-slate-950 opacity-40'
                        : 'border-slate-800 bg-slate-950 active:bg-slate-900 active:border-amber-500/50'
                    }`}
                  >
                    <span className="flex-1 leading-tight">{opt.text}</span>
                    {showResult && (
                      opt.isCorrect 
                        ? <CheckCircle2 className="h-6 w-6 shrink-0" /> 
                        : i === selectedOption ? <XCircle className="h-6 w-6 shrink-0" /> : null
                    )}
                  </button>
                ))}
              </div>

              {showResult && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 border-t border-slate-800 pt-4"
                >
                  {earnedPoints && (
                    <div className="mb-3 flex gap-2">
                      <div className="flex-1 rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20">
                        <div className="text-[9px] font-bold uppercase text-emerald-500/60 tracking-wider">Acerto</div>
                        <div className="text-base font-black text-emerald-500">+{earnedPoints.base}</div>
                      </div>
                      <div className="flex-1 rounded-xl bg-amber-500/10 p-2 border border-amber-500/20 text-right">
                        <div className="text-[9px] font-bold uppercase text-amber-500/60 tracking-wider">Bônus</div>
                        <div className="text-base font-black text-amber-500">+{earnedPoints.bonus}</div>
                      </div>
                    </div>
                  )}

                  {currentQuestion.explanation && (
                    <p className="mb-4 text-[13px] text-slate-400 leading-relaxed">
                      <span className="font-bold text-slate-200">Explicação:</span> {currentQuestion.explanation}
                    </p>
                  )}
                  <button 
                    onClick={nextTurn}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-black text-slate-950 transition-transform active:scale-95"
                  >
                    PRÓXIMA RODADA
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
