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
const ALIMENTOS_POR_REFEICAO: Record<string, { id: string; nome: string; emoji: string }[]> = {
  cafeManha: [{ id: 'pao', nome: 'Pão Francês', emoji: '🥖' }, { id: 'tapioca', nome: 'Tapioca / Crepioca', emoji: '🌮' }, { id: 'ovo', nome: 'Ovo Mexido / Cozido', emoji: '🍳' }, { id: 'queijo', nome: 'Queijo Minas', emoji: '🧀' }, { id: 'cuscuz', nome: 'Cuscuz', emoji: '🌽' }, { id: 'aveia', nome: 'Aveia', emoji: '🥣' }, { id: 'banana', nome: 'Banana', emoji: '🍌' }, { id: 'maca', nome: 'Maçã', emoji: '🍎' }, { id: 'mamao', nome: 'Mamão', emoji: '🍈' }, { id: 'leite', nome: 'Leite / Iogurte', emoji: '🥛' }, { id: 'cafe', nome: 'Café', emoji: '☕' }, { id: 'bolo', nome: 'Bolo Caseiro', emoji: '🥮' }],
  almoco: [{ id: 'arroz', nome: 'Arroz', emoji: '🍚' }, { id: 'feijao', nome: 'Feijão', emoji: '🍲' }, { id: 'frango', nome: 'Frango Grelhado', emoji: '🍗' }, { id: 'carne', nome: 'Carne Bovina', emoji: '🥩' }, { id: 'peixe', nome: 'Peixe', emoji: '🐟' }, { id: 'batatadoce', nome: 'Batata Doce', emoji: '🍠' }, { id: 'pure', nome: 'Purê', emoji: '🥔' }, { id: 'macarrao', nome: 'Macarrão', emoji: '🍝' }, { id: 'salada', nome: 'Salada Verde', emoji: '🥗' }, { id: 'legumes', nome: 'Legumes', emoji: '🥦' }, { id: 'ovo_almoco', nome: 'Ovo Cozido', emoji: '🥚' }, { id: 'farofa', nome: 'Farofa', emoji: '🌾' }],
  lancheTarde: [{ id: 'paodequeijo', nome: 'Pão de Queijo', emoji: '🧀' }, { id: 'fruta_tarde', nome: 'Frutas Variadas', emoji: '🍌' }, { id: 'vitamina', nome: 'Vitamina', emoji: '🥤' }, { id: 'tapioca_tarde', nome: 'Tapioca', emoji: '🌮' }, { id: 'castanhas', nome: 'Castanhas', emoji: '🥜' }, { id: 'iogurte', nome: 'Iogurte Natural', emoji: '🍶' }, { id: 'cafe_tarde', nome: 'Café ou Chá', emoji: '☕' }, { id: 'biscoito', nome: 'Biscoito', emoji: '🍪' }, { id: 'crepioca', nome: 'Crepioca', emoji: '🍳' }, { id: 'sanduiche', nome: 'Sanduíche', emoji: '🥪' }],
  cafeTarde: [{ id: 'cuscuz_tarde', nome: 'Cuscuz', emoji: '🌽' }, { id: 'pao_chapa', nome: 'Pão na Chapa', emoji: '🍞' }, { id: 'bolo_tarde', nome: 'Bolo Simples', emoji: '🥮' }, { id: 'fruta_l', nome: 'Fruta', emoji: '🍎' }, { id: 'cha', nome: 'Chá', emoji: '🍵' }],
  janta: [{ id: 'frango_janta', nome: 'Frango Desfiado', emoji: '🍗' }, { id: 'sopa', nome: 'Sopa', emoji: '🍲' }, { id: 'omelete', nome: 'Omelete', emoji: '🍳' }, { id: 'salada_janta', nome: 'Salada', emoji: '🥗' }, { id: 'arroz_janta', nome: 'Arroz', emoji: '🍚' }, { id: 'pure_janta', nome: 'Purê', emoji: '🥔' }, { id: 'wrap', nome: 'Wrap Fit', emoji: '🌯' }, { id: 'legumes_assados', nome: 'Legumes Assados', emoji: '🥕' }, { id: 'carne_janta', nome: 'Carne Magra', emoji: '🥩' }, { id: 'peixe_janta', nome: 'Peixe Grelhado', emoji: '🐟' }],
  lancheNoite: [{ id: 'chapa_noite', nome: 'Chá Relaxante', emoji: '🍵' }, { id: 'ceia_fruta', nome: 'Fruta Leve', emoji: '🍌' }, { id: 'iogurte_noite', nome: 'Iogurte Proteico', emoji: '🥛' }, { id: 'barra_cereal', nome: 'Barra de Cereal', emoji: '🥜' }],
};

const NOMES_REFEICOES: Record<string, { nome: string; emoji: string }> = {
  cafeManha: { nome: 'Café da Manhã', emoji: '☕' }, almoco: { nome: 'Almoço', emoji: '🍽️' }, lancheTarde: { nome: 'Lanche da Tarde', emoji: '🍎' }, cafeTarde: { nome: 'Café da Tarde', emoji: '🧋' }, janta: { nome: 'Jantar', emoji: '🍲' }, lancheNoite: { nome: 'Lanche da Noite', emoji: '🌙' },
};

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state: any) => state.dados);
  const setDados = useUserStore((state: any) => state.setDados);

  const temaEscuro = dadosGlobais.temaEscuro ?? true;

  const totalSteps = 8;
  const [step, setStep] = useState(0);
  const [aceitouTermos, setAceitouTermos] = useState(false); // NOVO ESTADO
  
  const [formData, setFormData] = useState({
    ...dadosGlobais,
    idade: dadosGlobais.idade || 25,
    peso: dadosGlobais.peso || 70,
    altura: dadosGlobais.altura || 170,
    refeicoesAtivas: dadosGlobais.refeicoesAtivas || ['cafeManha', 'almoco', 'lancheTarde', 'janta'],
    alimentos: dadosGlobais.alimentos || {},
  });

  const [refeicaoAtivaModal, setRefeicaoAtivaModal] = useState<string>('cafeManha');
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
    if (step === 7) setRefeicaoAtivaModal(formData.refeicoesAtivas[0]);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 0) navigate('/');
    else setStep(step - 1);
  };

  const handleFinish = () => {
    for (const refKey of formData.refeicoesAtivas) {
      if ((formData.alimentos[refKey] || []).length < 1) {
        setError(`Escolha pelo menos 1 alimento para ${NOMES_REFEICOES[refKey]?.nome}.`);
        return;
      }
    }
    setDados(formData);
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

          <div className="w-full flex gap-1.5 mt-2">
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
      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-6">
        
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
            <p className="text-sm text-zinc-500 mb-8">Necessário para o cálculo exato do metabolismo (TMB).</p>
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
                  <input type="time" value={formData.horaAcorda} onChange={(e) => handleChange('horaAcorda', e.target.value)} className="px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-green-500 text-white w-full outline-none" />
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-medium text-zinc-500">Dorme</label>
                  <input type="time" value={formData.horaDorme} onChange={(e) => handleChange('horaDorme', e.target.value)} className="px-4 py-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-green-500 text-white w-full outline-none" />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-zinc-500">Quais refeições costuma fazer?</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(NOMES_REFEICOES).map(([key, ref]) => {
                    const ativa = formData.refeicoesAtivas.includes(key);
                    return (
                      <button key={key} onClick={() => toggleRefeicaoAtiva(key)} className={`p-4 rounded-2xl border text-sm font-bold flex flex-col gap-2 transition-all ${ativa ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        <span className="text-2xl">{ref.emoji}</span>
                        <span>{ref.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center my-2">{error}</p>}
            <BotaoProximo onClick={handleNextStep} />
          </div>
        )}

        {/* PASSO 8: PREFERÊNCIAS ALIMENTARES */}
        {step === 8 && (
          <div className="flex flex-col flex-1 w-full animate-in fade-in slide-in-from-right-4">
            <h1 className="text-2xl font-medium tracking-tight mb-2">O que gosta de comer?</h1>
            <p className="text-sm text-zinc-500 mb-4">Escolha os alimentos base para o seu plano.</p>
            
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
                {formData.refeicoesAtivas.map((refeicaoKey: string) => {
                  const qtd = formData.alimentos[refeicaoKey]?.length || 0;
                  const estaAtiva = refeicaoAtivaModal === refeicaoKey;
                  return (
                    <button key={refeicaoKey} onClick={() => setRefeicaoAtivaModal(refeicaoKey)} className={`py-2 px-4 rounded-full text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${estaAtiva ? 'bg-green-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
                      {NOMES_REFEICOES[refeicaoKey]?.nome}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${estaAtiva ? 'bg-zinc-950 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>{qtd}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2 flex-1 overflow-y-auto hide-scrollbar pb-4">
                {ALIMENTOS_POR_REFEICAO[refeicaoAtivaModal]?.map((alimento) => {
                  const selecionado = (formData.alimentos[refeicaoAtivaModal] || []).includes(alimento.id);
                  return (
                    <button key={alimento.id} onClick={() => toggleAlimentoRefeicao(alimento.id)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${selecionado ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                      <span className="text-2xl mb-1">{alimento.emoji}</span>
                      <span className="text-[10px] font-bold text-center leading-tight">{alimento.nome}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center my-2">{error}</p>}
            <BotaoProximo onClick={handleFinish} text="Finalizar Registo" />
          </div>
        )}

      </div>
    </div>
  );
}