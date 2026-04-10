import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, generateShortCode, type RouletteData, type Roulette } from '../lib/supabase';
import Layout from '../components/Layout';
import { 
  Save, ArrowLeft, Plus, Trash2, Download, Upload, 
  ChevronDown, ChevronUp, AlertCircle, CheckCircle2 
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { addDays } from 'date-fns';

const INITIAL_DATA: RouletteData = {
  categories: [
    {
      name: 'Geral',
      color: '#f59e0b',
      questions: [
        {
          question: 'Exemplo de pergunta?',
          options: [
            { text: 'Opção Correta', isCorrect: true },
            { text: 'Opção Incorreta', isCorrect: false },
          ],
          explanation: 'Explicação opcional aqui.'
        }
      ]
    }
  ]
};

export default function Editor({ user }: { user: User }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Meu Novo Desafio');
  const [allowedClasses, setAllowedClasses] = useState<string[]>([]);
  const [newClassName, setNewClassName] = useState('');
  const [data, setData] = useState<RouletteData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      fetchRoulette();
    }
  }, [id]);

  const fetchRoulette = async () => {
    let query = supabase.from('roulettes').select('*');
    
    // Check if ID is a UUID (36 chars) or a Short Code (6 chars)
    if (id?.length === 36) {
      query = query.eq('id', id);
    } else {
      query = query.eq('short_code', id);
    }

    const { data: roulette, error } = await query.single();

    if (!error && roulette) {
      setTitle(roulette.title);
      setAllowedClasses(roulette.allowed_classes || []);
      setData(roulette.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const expiresAt = addDays(new Date(), 30).toISOString();

    const payload: any = {
      teacher_id: user.id,
      title,
      allowed_classes: allowedClasses,
      data,
      expires_at: expiresAt,
    };

    if (!id) {
      payload.short_code = generateShortCode();
    }

    let error;
    if (id) {
      const { error: err } = await supabase
        .from('roulettes')
        .update(payload)
        .eq('id', id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('roulettes')
        .insert([payload]);
      error = err;
    }

    setSaving(false);
    if (!error) {
      alert('Desafio salvo com sucesso! Ele ficará disponível por 30 dias.');
      navigate('/dashboard');
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ title, allowed_classes: allowedClasses, data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.title) setTitle(json.title);
        if (json.allowed_classes) setAllowedClasses(json.allowed_classes);
        if (json.data) setData(json.data);
      } catch (err) {
        alert('Arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  };

  const addCategory = () => {
    setData({
      ...data,
      categories: [...data.categories, { name: 'Nova Categoria', color: '#10b981', questions: [] }]
    });
  };

  const removeCategory = (index: number) => {
    const newCategories = [...data.categories];
    newCategories.splice(index, 1);
    setData({ ...data, categories: newCategories });
  };

  const addQuestion = (catIndex: number) => {
    const newCategories = [...data.categories];
    newCategories[catIndex].questions.push({
      question: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ]
    });
    setData({ ...data, categories: newCategories });
  };

  const removeQuestion = (catIndex: number, qIndex: number) => {
    const newCategories = [...data.categories];
    newCategories[catIndex].questions.splice(qIndex, 1);
    setData({ ...data, categories: newCategories });
  };

  const addOption = (catIndex: number, qIndex: number) => {
    const newCategories = [...data.categories];
    const q = newCategories[catIndex].questions[qIndex];
    if (q.options.length >= 5) return; // Limit to 5 options for layout sanity
    q.options.push({ text: '', isCorrect: false });
    setData({ ...data, categories: newCategories });
  };

  const removeOption = (catIndex: number, qIndex: number, optIndex: number) => {
    const newCategories = [...data.categories];
    const q = newCategories[catIndex].questions[qIndex];
    if (q.options.length <= 2) return; // Minimum 2 options
    q.options.splice(optIndex, 1);
    setData({ ...data, categories: newCategories });
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <Layout user={user}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="rounded-full p-2 hover:bg-slate-900">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-3xl font-black outline-none focus:border-b border-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-800">
            <Upload className="h-4 w-4" />
            Importar JSON
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
          <button 
            onClick={exportJSON}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            Exportar JSON
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-950 transition-all hover:bg-amber-400 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Plus className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar
          </button>
        </div>
      </div>
      
      {/* Allowed Classes Section */}
      <div className="mb-8 rounded-3xl border border-slate-900 bg-slate-900/50 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-bold">Turmas Participantes</h2>
          <p className="text-sm text-slate-500">Defina as turmas que podem participar deste desafio. Deixe em branco para permitir qualquer nome.</p>
        </div>
        
        <div className="mb-4 flex flex-wrap gap-2">
          {allowedClasses.map((cls, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-sm font-bold text-amber-500">
              {cls}
              <button 
                onClick={() => setAllowedClasses(allowedClasses.filter((_, i) => i !== idx))}
                className="hover:text-amber-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex max-w-sm gap-2">
          <input 
            type="text" 
            placeholder="Ex: 6º Ano A"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (newClassName.trim()) {
                  setAllowedClasses([...allowedClasses, newClassName.trim()]);
                  setNewClassName('');
                }
              }
            }}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-sm outline-none focus:border-amber-500/50"
          />
          <button 
            onClick={() => {
              if (newClassName.trim()) {
                setAllowedClasses([...allowedClasses, newClassName.trim()]);
                setNewClassName('');
              }
            }}
            className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold transition-colors hover:bg-slate-700"
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {data.categories.map((category, catIndex) => (
          <div key={catIndex} className="rounded-3xl border border-slate-900 bg-slate-900/30 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input 
                  type="color" 
                  value={category.color}
                  onChange={(e) => {
                    const newCats = [...data.categories];
                    newCats[catIndex].color = e.target.value;
                    setData({ ...data, categories: newCats });
                  }}
                  className="h-8 w-8 cursor-pointer rounded bg-transparent"
                />
                <input 
                  type="text" 
                  value={category.name}
                  onChange={(e) => {
                    const newCats = [...data.categories];
                    newCats[catIndex].name = e.target.value;
                    setData({ ...data, categories: newCats });
                  }}
                  className="bg-transparent text-xl font-bold outline-none focus:border-b border-slate-700"
                />
              </div>
              <button 
                onClick={() => removeCategory(catIndex)}
                className="text-slate-500 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {category.questions.map((q, qIndex) => (
                <div key={qIndex} className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <textarea 
                        placeholder="Pergunta"
                        value={q.question}
                        onChange={(e) => {
                          const newCats = [...data.categories];
                          newCats[catIndex].questions[qIndex].question = e.target.value;
                          setData({ ...data, categories: newCats });
                        }}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 outline-none focus:border-amber-500/50"
                      />
                      <textarea 
                        placeholder="Contexto (opcional)"
                        value={q.context || ''}
                        onChange={(e) => {
                          const newCats = [...data.categories];
                          newCats[catIndex].questions[qIndex].context = e.target.value;
                          setData({ ...data, categories: newCats });
                        }}
                        className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm outline-none focus:border-amber-500/50"
                      />
                    </div>
                    <button 
                      onClick={() => removeQuestion(catIndex, qIndex)}
                      className="rounded-lg p-2 text-slate-600 hover:text-red-500 active:scale-90"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const newCats = [...data.categories];
                            newCats[catIndex].questions[qIndex].options.forEach((o, i) => {
                              o.isCorrect = i === optIndex;
                            });
                            setData({ ...data, categories: newCats });
                          }}
                          className={`rounded-full p-1 transition-colors ${opt.isCorrect ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-500 hover:text-slate-400'}`}
                          title={opt.isCorrect ? "Alternativa Correta" : "Marcar como Correta"}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <input 
                          type="text" 
                          placeholder={`Opção ${optIndex + 1}`}
                          value={opt.text}
                          onChange={(e) => {
                            const newCats = [...data.categories];
                            newCats[catIndex].questions[qIndex].options[optIndex].text = e.target.value;
                            setData({ ...data, categories: newCats });
                          }}
                          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-sm outline-none focus:border-amber-500/50"
                        />
                        {q.options.length > 2 && (
                          <button 
                            onClick={() => removeOption(catIndex, qIndex, optIndex)}
                            className="p-2 text-slate-600 hover:text-red-500"
                            title="Remover Opção"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.options.length < 5 && (
                    <button 
                      onClick={() => addOption(catIndex, qIndex)}
                      className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500"
                    >
                      <Plus className="h-3 w-3" />
                      ADICIONAR ALTERNATIVA
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => addQuestion(catIndex)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 py-4 text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-400"
              >
                <Plus className="h-4 w-4" />
                Adicionar Pergunta
              </button>
            </div>
          </div>
        ))}

        <button 
          onClick={addCategory}
          className="flex w-full items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-slate-800 py-8 text-lg font-bold text-slate-500 transition-all hover:border-amber-500/50 hover:text-amber-500"
        >
          <Plus className="h-6 w-6" />
          Adicionar Nova Categoria
        </button>
      </div>
    </Layout>
  );
}
