import { DICIONARIO_ALIMENTOS as ALIMENTOS_POR_REFEICAO } from '../data/alimentos';
import { CONFIG_REFEICOES, getCronograma } from '../utils/nutritionMath';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

// --- COMPONENTES VISUAIS INTERATIVOS ---

// 1. Roda Vertical (Para Idade e Peso)
function VerticalPicker({ min, max, value, onChange, suffix }: { min: number, max: number, value: number, onChange: (v: number) => void, suffix: string }) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const ITEM_HEIGHT = 64; 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = (value - min) * ITEM_HEIGHT;
    }
  }, []); // Roda apenas ao montar

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    const idx = Math.round(y / ITEM_HEIGHT);
    const val = min + idx;
    if (val !== value && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div className="relative h-[320px] w-full flex justify-center items-center overflow-hidden">
      {/* Fundo de seleção central (escuro) */}
      <div className="absolute top-1/2 -translate-y-1/2 w-[80%] max-w-[240px] h-[64px] bg-zinc-800/80 rounded-3xl pointer-events-none" />
      
      {/* Área de Scroll */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10"
      >
        <div style={{ height: `calc(50% - 32px)` }} className="w-full shrink-0 pointer-events-none" />
        {items.map(i => (
          <div key={i} className="h-[64px] snap-center flex items-center justify-center shrink-0">
            <span className={`transition-all duration-200 ease-out ${value === i ? 'text-[40px] text-white font-bold tracking-tight' : 'text-xl text-zinc-600 font-bold'}`}>
              {i} {value === i && <span className="text-lg ml-1 font-bold text-white">{suffix}</span>}
            </span>
          </div>
        ))}
        <div style={{ height: `calc(50% - 32px)` }} className="w-full shrink-0 pointer-events-none" />
      </div>
    </div>
  );
}

// 2. Régua Horizontal (Para Altura)
function HorizontalRulerPicker({ min, max, value, onChange, suffix }: { min: number, max: number, value: number, onChange: (v: number) => void, suffix: string }) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const TICK_WIDTH = 14; 
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = (value - min) * TICK_WIDTH;
    }
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const x = e.currentTarget.scrollLeft;
    const idx = Math.round(x / TICK_WIDTH);
    const val = min + idx;
    if (val !== value && val >= min && val <= max) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mt-4">
      {/* Toggle visual (Estático para simular a imagem) */}
      <div className="flex bg-zinc-800 rounded-full p-1 mb-10 w-48">
        <div className="flex-1 text-center py-2 bg-zinc-700/80 rounded-full text-xs font-bold text-white shadow-sm">CM</div>
        <div className="flex-1 text-center py-2 text-zinc-500 text-xs font-bold">FT</div>
      </div>

      {/* Valor em destaque */}
      <div className="text-[56px] font-bold text-white mb-8 flex items-baseline gap-1 tracking-tight">
        {value} <span className="text-2xl text-white font-bold">{suffix}</span>
      </div>

      {/* Régua */}
      <div className="relative w-full h-24 overflow-hidden">
        {/* Ponteiro central verde */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-1.5 h-12 bg-green-500 rounded-full z-20 pointer-events-none shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10"
        >
          <div style={{ width: `calc(50% - 7px)` }} className="shrink-0 pointer-events-none" />
          {items.map(i => {
            const isTen = i % 10 === 0;
            return (
              <div key={i} className="shrink-0 w-[14px] h-full flex flex-col items-center justify-start snap-center relative">
                <div className={`w-[2px] rounded-full transition-colors ${value === i ? 'bg-green-500' : 'bg-zinc-600'} ${isTen ? 'h-8' : 'h-4'}`} />
                {isTen && <span className="absolute top-10 text-[10px] text-zinc-500 font-bold">{i}</span>}
              </div>
            )
          })}
          <div style={{ width: `calc(50% - 7px)` }} className="shrink-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}


// --- DICIONÁRIOS ---
const NOMES_REFEICOES = Object.fromEntries(Object.entries(CONFIG_REFEICOES).map(([key, value]) => [key, { nome: value.titulo, emoji: value.icone }]));

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state: any) => state.dados);
  const setDados = useUserStore((state: any) => state.setDados);

  const temaEscuro = dadosGlobais.temaEscuro ?? true;

  const [step, setStep] = useState(dadosGlobais.nome ? 1 : 0);
  const [aceitouTermos, setAceitouTermos] = useState(false); // NOVO ESTADO
  
  const [formData, setFormData] = useState({
    ...dadosGlobais,
    idade: Number(dadosGlobais.idade) || 25,
    peso: Number(dadosGlobais.peso) || 70,
    altura: Number(dadosGlobais.altura) || 170,
    refeicoesAtivas: dadosGlobais.refeicoesAtivas || ['cafeManha', 'almoco', 'lancheTarde', 'janta'],
    alimentos: dadosGlobais.alimentos || {},
  });

  const refeicoesSelecionadas = Object.keys(CONFIG_REFEICOES).filter(key => formData.refeicoesAtivas.includes(key));
  const totalSteps = 7 + refeicoesSelecionadas.length;
  const indiceRefeicao = step - 8;
  const refeicaoAtivaModal = refeicoesSelecionadas[indiceRefeicao];
  const ultimaRefeicao = indiceRefeicao === refeicoesSelecionadas.length - 1;
  const cronograma = getCronograma(formData);
  const perguntas: Record<string, string> = {
    cafeManha: 'O que você come ou comeria no café da manhã?',
    almoco: 'O que você come ou comeria no almoço?',
    lancheTarde: 'O que você come ou comeria no lanche da tarde?',
    cafeTarde: 'O que você come ou comeria no café da tarde?',
    janta: 'O que você come ou comeria no jantar?',
    lancheNoite: 'O que você come ou comeria no lanche da noite?',
  };
  const [error, setError] = useState('');

  const handleChange = (campo: string, valor: any) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  const handleToggleTermos = () => {
    setAceitouTermos(!aceitouTermos);
    setError('');
  };

  const handleStart = () => {
    if (!aceitouTermos) {
      setError('Por favor, aceita os Termos e Diretrizes para continuar.');
      return;
    }
    setError('');
    setStep(1);
  };

  const toggleRefeicaoAtiva = (key: string) => {
    const ativas = formData.refeicoesAtivas;
    let novasAtivas;
    if (ativas.includes(key)) {
      if (ativas.length <= 1) {
        setError('Tens de manter pelo menos 1 refeição ativa.');
        return;
      }
      novasAtivas = ativas.filter((r: string) => r !== key);
    } else {
      novasAtivas = [...ativas, key];
    }
    setFormData({ ...formData, refeicoesAtivas: novasAtivas });
    setError('');
  };

  const toggleAlimentoRefeicao = (idAlimento: string) => {
    const listaAtual = formData.alimentos[refeicaoAtivaModal] || [];
    let novaLista = listaAtual.includes(idAlimento) 
      ? listaAtual.filter((item: string) => item !== idAlimento) 
      : [...listaAtual, idAlimento];

    setFormData({
      ...formData,
      alimentos: { ...formData.alimentos, [refeicaoAtivaModal]: novaLista },
    });
    setError('');
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.nome || formData.nome.trim() === '')) { setError('Por favor, digite seu nome.'); return; }
    if (step === 5 && !formData.sexo) { setError('Selecione o sexo biológico.'); return; }
    if (step === 6 && !formData.objetivo) { setError('Por favor, selecione um objetivo.'); return; }
    if (step === 7 && (!formData.horaAcorda || !formData.horaDorme)) { setError('Por favor, preencha os horários.'); return; }
    
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 0) navigate('/');
    else if (step === 1 && dadosGlobais.nome) navigate('/perfil');
    else setStep(step - 1);
  };

  const handlePreferencia = () => {
    if (!(formData.alimentos[refeicaoAtivaModal] || []).length) {
      setError('Escolha pelo menos um alimento para continuar.');
      return;
    }
    setError('');
    if (ultimaRefeicao) handleFinish();
    else setStep(step + 1);
  };

  const handleFinish = () => {
    for (const refKey of formData.refeicoesAtivas) {
      if ((formData.alimentos[refKey] || []).length < 1) {
        setStep(8 + refeicoesSelecionadas.indexOf(refKey));
        setError(`Escolha pelo menos 1 alimento para ${NOMES_REFEICOES[refKey]?.nome}.`);
        return;
      }
    }
    setDados({ ...formData, nome: formData.nome.trim(), idade: String(formData.idade), peso: String(formData.peso), altura: String(formData.altura) });
    useUserStore.getState().atualizarPeso(String(formData.peso));
    navigate('/');
  };

  const BotaoProximo = ({ onClick, text = "PRÓXIMO" }: { onClick: () => void, text?: string }) => (
    <button 
      onClick={onClick} 
      className="w-full py-4 mt-6 rounded-full bg-green-500 text-zinc-950 font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(34,197,94,0.25)] active:scale-95 transition-all"
    >
      {text}
    </button>
  );

  return (
    <div className={`flex flex-col h-[100dvh] px-6 py-8 overflow-hidden transition-colors duration-300 ${
      temaEscuro ? 'bg-[#0B1114] text-white' : 'bg-zinc-100 text-zinc-900'
    }`}>
      
      {/* CABEÇALHO COM BACK BUTTON E BARRA DE PROGRESSO */}
      {step > 0 && (
        <header className="flex flex-col gap-4 relative mb-8 shrink-0 w-full animate-in fade-in">
          <div className="flex w-full items-center justify-between">
            <button 
              aria-label="Voltar"
              onClick={handleBack}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                temaEscuro ? 'bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300' : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>

          <div className="w-full flex gap-1.5 mt-2" role="progressbar" aria-label="Progresso do cadastro" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={step}>
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((item) => (
              <div 
                key={item} 
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  step >= item ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : temaEscuro ? 'bg-zinc-800' : 'bg-zinc-200'
                }`} 
              />
            ))}
          </div>
        </header>
      )}

      {/* ÁREA DE CONTEÚDO SCROLLÁVEL */}
      <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar flex flex-col pb-6">
        
        {/* PASSO 0: INFO LOCAL BETA E TERMOS */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 w-full gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-green-400 rounded-3xl shadow-lg shadow-green-500/30 flex items-center justify-center text-4xl">
              🥑
            </div>
            <div className="text-center flex flex-col gap-5 w-full max-w-sm">
              <h1 className="text-3xl font-black">Louri Fit <span className="text-green-500 text-sm align-top font-bold uppercase">Beta</span></h1>
              <div className={`p-5 rounded-3xl border text-left flex flex-col gap-2 ${temaEscuro ? 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">💾</span>
                  <h3 className={`font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Salvamento Local</h3>
                </div>
                <p className="text-sm leading-relaxed opacity-90">Por enquanto, não precisas de criar conta.</p>
                <p className="text-sm leading-relaxed opacity-90">Os teus dados serão <strong>guardados de forma segura apenas no teu telemóvel</strong>.</p>
              </div>

              {/* CAIXA DE ACEITAÇÃO DOS TERMOS */}
              <div className="flex items-start gap-3 mt-2 text-left px-1">
                <button 
                  onClick={handleToggleTermos}
                  className={`w-6 h-6 mt-0.5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    aceitouTermos 
                      ? 'bg-green-500 border-green-500 text-zinc-950' 
                      : temaEscuro ? 'bg-zinc-800 border-zinc-600' : 'bg-white border-zinc-400'
                  }`}
                >
                  {aceitouTermos && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <p className={`text-[13px] leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Li e concordo com os{' '}
                  <a href="https://sites.google.com/view/termosediretrizeslourifit/in%C3%ADcio" target="_blank" rel="noopener noreferrer" className="text-green-500 font-bold underline underline-offset-2">
                    Termos e Diretrizes
                  </a>
                  {' '}e compreendo o aviso de isenção médica.
                </p>
              </div>
            </div>
            
            <div className="w-full max-w-sm flex flex-col gap-2">
              {error && <p className="text-red-400 text-sm text-center font-medium animate-in fade-in">{error}</p>}
              <BotaoProximo onClick={handleStart} text="Começar Agora" />
            </div>
          </div>
        )}

        {/* PASSO 1: NOME */}
        {step === 1 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-medium tracking-tight mb-8">Qual o seu nome?</h1>
            <div className="flex flex-col gap-1.5 flex-1 text-center justify-center -mt-20">
              <input
                type="text"
                maxLength={25}
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Seu nome"
                className={`text-center bg-transparent border-b-2 text-4xl font-bold focus:outline-none w-full pb-4 transition-colors ${
                  temaEscuro ? 'text-white border-zinc-700 focus:border-green-500 placeholder-zinc-700' : 'text-zinc-900 border-zinc-300 focus:border-green-500 placeholder-zinc-300'
                }`}
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 2: IDADE (Scroll Picker) */}
        {step === 2 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-8">Qual a sua idade?</h1>
            <div className="flex-1 flex flex-col justify-center">
              <VerticalPicker min={14} max={100} value={formData.idade} onChange={(v) => handleChange('idade', v)} suffix="anos" />
            </div>
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 3: PESO (Scroll Picker) */}
        {step === 3 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-8">Qual o seu peso?</h1>
            <div className="flex-1 flex flex-col justify-center">
              <VerticalPicker min={30} max={200} value={formData.peso} onChange={(v) => handleChange('peso', v)} suffix="kg" />
            </div>
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 4: ALTURA (Régua Horizontal) */}
        {step === 4 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-4">Qual a sua altura?</h1>
            <div className="flex-1 flex flex-col justify-center">
              <HorizontalRulerPicker min={100} max={250} value={formData.altura} onChange={(v) => handleChange('altura', v)} suffix="cm" />
            </div>
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 5: SEXO BIOLÓGICO */}
        {step === 5 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-2">Qual o seu sexo biológico?</h1>
            <p className="text-sm text-zinc-500 mb-8">Usado para estimar o metabolismo (TMB).</p>
            <div className="flex-1 flex flex-col gap-4 justify-center -mt-10">
              <button 
                onClick={() => handleChange('sexo', 'M')} 
                className={`py-8 rounded-3xl border-2 text-xl font-bold flex flex-col items-center gap-2 transition-all ${formData.sexo === 'M' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-4xl">👨</span> Masculino
              </button>
              <button 
                onClick={() => handleChange('sexo', 'F')} 
                className={`py-8 rounded-3xl border-2 text-xl font-bold flex flex-col items-center gap-2 transition-all ${formData.sexo === 'F' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
              >
                <span className="text-4xl">👩</span> Feminino
              </button>
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 6: OBJETIVO */}
        {step === 6 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-8">Qual o seu objetivo?</h1>
            <div className="flex-1 flex flex-col gap-3 justify-center -mt-10">
              {[
                { id: 'perder', title: 'Emagrecimento', emoji: '🔥', desc: 'Perder gordura e definir' },
                { id: 'manter', title: 'Saúde e Manutenção', emoji: '🥗', desc: 'Manter o peso atual' },
                { id: 'ganhar', title: 'Ganho de Massa', emoji: '💪', desc: 'Construir músculo' }
              ].map(obj => (
                <button 
                  key={obj.id}
                  onClick={() => handleChange('objetivo', obj.id)} 
                  className={`p-5 rounded-3xl border-2 text-left flex items-center gap-4 transition-all ${formData.objetivo === obj.id ? 'bg-green-500/10 border-green-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <span className="text-3xl">{obj.emoji}</span>
                  <div>
                    <h3 className={`font-bold text-lg ${formData.objetivo === obj.id ? 'text-green-500' : 'text-zinc-300'}`}>{obj.title}</h3>
                    <p className="text-xs text-zinc-500">{obj.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 7: ROTINA (Horários e Refeições Ativas) */}
        {step === 7 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-6">A sua Rotina</h1>
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-6">
              
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-zinc-500">Acorda</label>
                  <input aria-label="Horário de acordar" type="time" value={formData.horaAcorda} onChange={(e) => handleChange('horaAcorda', e.target.value)} className="px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-green-500 text-white w-full outline-none" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-zinc-500">Dorme</label>
                  <input aria-label="Horário de dormir" type="time" value={formData.horaDorme} onChange={(e) => handleChange('horaDorme', e.target.value)} className="px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-green-500 text-white w-full outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-500">Quais refeições costuma fazer?</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(NOMES_REFEICOES).map(([key, ref]) => {
                    const ativa = formData.refeicoesAtivas.includes(key);
                    return (
                      <button key={key} aria-pressed={ativa} onClick={() => toggleRefeicaoAtiva(key)} className={`p-4 rounded-2xl border text-sm font-bold flex flex-col gap-2 transition-all ${ativa ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        <span className="text-2xl">{ref.emoji}</span>
                        <span>{ref.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-3 pb-2">
                <div><h2 className="text-sm font-semibold">Horários das refeições</h2><p className="text-xs text-zinc-500 mt-1">Confira as sugestões e ajuste à sua rotina.</p></div>
                <div className={`rounded-2xl border overflow-hidden ${temaEscuro ? 'border-zinc-800 bg-zinc-900/60' : 'border-zinc-200 bg-white'}`}>
                  {refeicoesSelecionadas.map(key => <label key={key} className={`flex items-center justify-between gap-3 px-4 py-3 border-b last:border-0 ${temaEscuro ? 'border-zinc-800' : 'border-zinc-100'}`}>
                    <span className="text-xs font-medium">{NOMES_REFEICOES[key].emoji} {NOMES_REFEICOES[key].nome}</span>
                    <input type="time" aria-label={`Horário de ${NOMES_REFEICOES[key].nome}`} value={cronograma.find(ref => ref.key === key)?.horario || ''} onChange={e => handleChange('horariosRefeicoes', { ...(formData.horariosRefeicoes || {}), [key]: e.target.value })} className={`rounded-lg px-2 py-2 text-sm font-bold text-green-500 outline-none focus:ring-2 focus:ring-green-500 w-28 shrink-0 ${temaEscuro ? 'bg-zinc-950' : 'bg-zinc-100'}`} />
                  </label>)}
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center my-2">{error}</p>}
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* Uma etapa de alimentos para cada refeição escolhida. */}
        {step >= 8 && refeicaoAtivaModal && (
          <div key={refeicaoAtivaModal} className="flex flex-col flex-1 min-h-0 w-full animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
              <span className="text-xs text-green-500 font-bold uppercase tracking-wider">Refeição {indiceRefeicao + 1} de {refeicoesSelecionadas.length}</span>
              <span className={`text-xs font-bold px-3 py-2 rounded-full border ${temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>{NOMES_REFEICOES[refeicaoAtivaModal].emoji} {cronograma.find(ref => ref.key === refeicaoAtivaModal)?.horario}</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight mb-2 shrink-0">{perguntas[refeicaoAtivaModal]}</h1>
            <p className="text-sm text-zinc-500 mb-4 shrink-0">Escolha os alimentos que fazem parte dessa refeição. Você pode marcar mais de um.</p>
            <div className="grid grid-cols-3 auto-rows-min gap-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-4 content-start">
              {ALIMENTOS_POR_REFEICAO[refeicaoAtivaModal]?.map(alimento => {
                const selecionado = (formData.alimentos[refeicaoAtivaModal] || []).includes(alimento.id);
                return <button key={alimento.id} aria-pressed={selecionado} onClick={() => toggleAlimentoRefeicao(alimento.id)} className={`relative flex flex-col items-center justify-center min-h-24 p-3 rounded-2xl border transition-all ${selecionado ? 'bg-green-500/10 border-green-500 text-green-500' : temaEscuro ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'}`}>
                  {selecionado && <span aria-hidden="true" className="absolute right-2 top-1 text-xs font-bold">✓</span>}
                  <span className="text-2xl mb-2">{alimento.emoji}</span>
                  <span className="text-[11px] font-bold text-center leading-tight">{alimento.nome}</span>
                </button>;
              })}
            </div>
            <div className="shrink-0 pt-2">
              <p className="text-xs text-zinc-500">{(formData.alimentos[refeicaoAtivaModal] || []).length} {(formData.alimentos[refeicaoAtivaModal] || []).length === 1 ? 'alimento selecionado' : 'alimentos selecionados'}</p>
              {error && <p role="alert" className="text-red-400 text-sm text-center mt-2">{error}</p>}
              <BotaoProximo onClick={handlePreferencia} text={ultimaRefeicao ? 'Finalizar registro' : 'Próxima refeição'} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}