import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import logoImg from '../assets/logo.png'; // Importa o teu logótipo oficial

const DICIONARIO_ALIMENTOS = {
  cafeManha: [
    { id: 'pao', nome: 'Pão Francês', emoji: '🥖', kcal100g: 280, prot: 9, carbo: 58, gord: 3 }, 
    { id: 'tapioca', nome: 'Tapioca', emoji: '🌮', kcal100g: 340, prot: 0, carbo: 85, gord: 0 },
    { id: 'ovo', nome: 'Ovo', emoji: '🍳', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'queijo', nome: 'Queijo', emoji: '🧀', kcal100g: 350, prot: 25, carbo: 2, gord: 30 },
    { id: 'cuscuz', nome: 'Cuscuz', emoji: '🌽', kcal100g: 110, prot: 3, carbo: 23, gord: 1 }, 
    { id: 'aveia', nome: 'Aveia', emoji: '🥣', kcal100g: 380, prot: 16, carbo: 66, gord: 7 },
    { id: 'banana', nome: 'Banana', emoji: '🍌', kcal100g: 90, prot: 1, carbo: 23, gord: 0 }, 
    { id: 'maca', nome: 'Maçã', emoji: '🍎', kcal100g: 52, prot: 0, carbo: 14, gord: 0 },
    { id: 'mamao', nome: 'Mamão', emoji: '🍈', kcal100g: 43, prot: 0, carbo: 11, gord: 0 }, 
    { id: 'leite', nome: 'Leite / Iogurte', emoji: '🥛', kcal100g: 60, prot: 3, carbo: 5, gord: 3 },
    { id: 'cafe', nome: 'Café', emoji: '☕', kcal100g: 2, prot: 0, carbo: 0, gord: 0 }, 
    { id: 'bolo', nome: 'Bolo Caseiro', emoji: '🥮', kcal100g: 350, prot: 5, carbo: 50, gord: 15 },
  ],
  almoco: [
    { id: 'arroz', nome: 'Arroz', emoji: '🍚', kcal100g: 130, prot: 2, carbo: 28, gord: 0 }, 
    { id: 'feijao', nome: 'Feijão', emoji: '🍲', kcal100g: 75, prot: 5, carbo: 14, gord: 0 },
    { id: 'frango', nome: 'Frango', emoji: '🍗', kcal100g: 165, prot: 31, carbo: 0, gord: 3 }, 
    { id: 'carne', nome: 'Carne', emoji: '🥩', kcal100g: 250, prot: 26, carbo: 0, gord: 15 },
    { id: 'peixe', nome: 'Peixe', emoji: '🐟', kcal100g: 105, prot: 20, carbo: 0, gord: 2 }, 
    { id: 'batatadoce', nome: 'Batata / Mandioca', emoji: '🍠', kcal100g: 86, prot: 1, carbo: 20, gord: 0 },
    { id: 'pure', nome: 'Purê', emoji: '🥔', kcal100g: 110, prot: 2, carbo: 15, gord: 4 }, 
    { id: 'macarrao', nome: 'Macarrão', emoji: '🍝', kcal100g: 158, prot: 5, carbo: 30, gord: 1 },
    { id: 'salada', nome: 'Salada', emoji: '🥗', kcal100g: 15, prot: 1, carbo: 3, gord: 0 }, 
    { id: 'legumes', nome: 'Legumes', emoji: '🥦', kcal100g: 35, prot: 2, carbo: 7, gord: 0 },
    { id: 'ovo_almoco', nome: 'Ovo Cozido', emoji: '🥚', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'farofa', nome: 'Farofa', emoji: '🌾', kcal100g: 400, prot: 2, carbo: 80, gord: 8 },
  ],
  cafeTarde: [
    { id: 'paodequeijo', nome: 'Pão de Queijo', emoji: '🧀', kcal100g: 330, prot: 5, carbo: 40, gord: 15 }, 
    { id: 'fruta_tarde', nome: 'Frutas', emoji: '🍌', kcal100g: 80, prot: 1, carbo: 20, gord: 0 },
    { id: 'vitamina', nome: 'Vitamina', emoji: '🥤', kcal100g: 85, prot: 3, carbo: 12, gord: 2 }, 
    { id: 'tapioca_tarde', nome: 'Tapioca', emoji: '🌮', kcal100g: 340, prot: 0, carbo: 85, gord: 0 },
    { id: 'castanhas', nome: 'Castanhas', emoji: '🥜', kcal100g: 600, prot: 15, carbo: 20, gord: 55 }, 
    { id: 'iogurte', nome: 'Iogurte', emoji: '🍶', kcal100g: 60, prot: 3, carbo: 5, gord: 3 },
    { id: 'cafe_tarde', nome: 'Café / Chá', emoji: '☕', kcal100g: 2, prot: 0, carbo: 0, gord: 0 }, 
    { id: 'biscoito', nome: 'Biscoito', emoji: '🍪', kcal100g: 450, prot: 6, carbo: 70, gord: 15 },
    { id: 'crepioca', nome: 'Crepioca', emoji: '🍳', kcal100g: 200, prot: 8, carbo: 25, gord: 7 }, 
    { id: 'sanduiche', nome: 'Sanduíche', emoji: '🥪', kcal100g: 250, prot: 12, carbo: 30, gord: 8 },
  ],
  janta: [
    { id: 'frango_janta', nome: 'Frango', emoji: '🍗', kcal100g: 165, prot: 31, carbo: 0, gord: 3 }, 
    { id: 'sopa', nome: 'Sopa', emoji: '🍲', kcal100g: 50, prot: 2, carbo: 8, gord: 1 },
    { id: 'omelete', nome: 'Omelete', emoji: '🍳', kcal100g: 155, prot: 13, carbo: 1, gord: 11 }, 
    { id: 'salada_janta', nome: 'Salada', emoji: '🥗', kcal100g: 15, prot: 1, carbo: 3, gord: 0 },
    { id: 'arroz_janta', nome: 'Arroz', emoji: '🍚', kcal100g: 130, prot: 2, carbo: 28, gord: 0 }, 
    { id: 'pure_janta', nome: 'Purê', emoji: '🥔', kcal100g: 110, prot: 2, carbo: 15, gord: 4 },
    { id: 'wrap', nome: 'Wrap Fit', emoji: '🌯', kcal100g: 220, prot: 10, carbo: 25, gord: 8 }, 
    { id: 'legumes_assados', nome: 'Legumes', emoji: '🥕', kcal100g: 65, prot: 2, carbo: 10, gord: 2 },
    { id: 'carne_janta', nome: 'Carne Magra', emoji: '🥩', kcal100g: 180, prot: 26, carbo: 0, gord: 7 }, 
    { id: 'peixe_janta', nome: 'Peixe', emoji: '🐟', kcal100g: 105, prot: 20, carbo: 0, gord: 2 },
  ],
};

export function Home() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const adicionarAgua = useUserStore((state) => state.adicionarAgua);
  const zerarAgua = useUserStore((state) => state.zerarAgua);
  const registrarRefeicao = useUserStore((state) => state.registrarRefeicao);
  const desfazerRefeicao = useUserStore((state) => state.desfazerRefeicao);
  const zerarDieta = useUserStore((state) => state.zerarDieta);
  const verificarViradaDeDia = useUserStore((state) => state.verificarViradaDeDia);

  // Estados dos Modais
  const [mostrarModalDesfazerAgua, setMostrarModalDesfazerAgua] = useState(false);
  const [mostrarModalDieta, setMostrarModalDieta] = useState(false);
  const [mostrarModalDesfazerDieta, setMostrarModalDesfazerDieta] = useState(false);
  
  const [refeicaoModal, setRefeicaoModal] = useState<any>(null); 
  // Novo Estado: Guarda as gramas de cada alimento ex: { 'pao': 100, 'ovo': 50 }
  const [porcoesModal, setPorcoesModal] = useState<Record<string, number>>({}); 
  const [minutosAtuais, setMinutosAtuais] = useState(0);

  useEffect(() => {
    if (dados.nome) {
      verificarViradaDeDia();
    }

    const atualizarTempo = () => {
      const agora = new Date();
      setMinutosAtuais(agora.getHours() * 60 + agora.getMinutes());
    };
    atualizarTempo();
    const timer = setInterval(atualizarTempo, 60000); 
    return () => clearInterval(timer);
  }, [dados.nome, verificarViradaDeDia]);

  if (!dados.nome) {
    return (
      <div className="flex flex-col h-[100dvh] bg-zinc-950 px-6 py-10 justify-between items-center overflow-hidden overscroll-none relative select-none">
        
        {/* Elemento decorativo de fundo subtil (Glow subtil) */}
        <div className="absolute top-1/4 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Espaço Superior Vazio para Equilíbrio */}
        <div className="w-full"></div>

        {/* --- CENTRO: LOGÓTIPO COM ÓRBITA FLUIDA E ESTÁVEL --- */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
            {/* Órbita em rotação suave */}
            <div className="absolute inset-0 animate-[spin_30s_linear_infinite]">
              {/* Cada emoji faz o spin contrário (-spin) para se manter perfeitamente na vertical */}
              <div className="absolute top-3 left-6 text-2xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🍎</div>
              <div className="absolute top-2 right-10 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🔥</div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-3 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🍊</div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-3 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">💪</div>
              <div className="absolute bottom-6 left-10 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">👟</div>
              <div className="absolute bottom-4 right-12 text-2xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🥗</div>
            </div>

            {/* LOGÓTIPO CENTRAL FIXO */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
              <div className="w-24 h-24 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 p-4 shadow-2xl flex items-center justify-center backdrop-blur-md">
                <img src={logoImg} alt="Louri Logo" className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(34,197,94,0.3)]" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight">Louri Fit</h1>
            </div>

        </div>

        {/* --- BOTÕES DE AÇÃO INFERIORES --- */}
        <div className="w-full max-w-sm flex flex-col gap-3 z-10 pb-6">
          <button 
            onClick={() => navigate('/onboarding')} 
            className="w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
          >
            Começar Agora
          </button>
          
          <button 
            onClick={() => alert('Em breve!')} 
            className="w-full bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 text-zinc-300 font-semibold py-4 rounded-2xl text-base transition-all active:scale-[0.98]"
          >
            Já tenho uma conta
          </button>
        </div>

      </div>
    );
  }

  const primeiroNome = dados.nome ? dados.nome.trim().split(' ')[0] : '';
  const pesoNum = Number(dados.peso) || 70;
  
  const metaAguaMl = Math.round(pesoNum * 35 / 1000) * 1000; 
  const aguaAtualMl = dados.aguaConsumida || 0;
  const progressoAgua = Math.min(100, Math.round((aguaAtualMl / metaAguaMl) * 100));
  
  let tmb = 10 * pesoNum + 6.25 * (Number(dados.altura) || 170) - 5 * (Number(dados.idade) || 25);
  tmb = dados.sexo === 'M' ? tmb + 5 : tmb - 161;
  let metaCalorias = Math.round(tmb * 1.3);
  if (dados.objetivo === 'perder') metaCalorias -= 400; 
  if (dados.objetivo === 'ganhar') metaCalorias += 400; 

  const caloriasConsumidas = dados.caloriasConsumidas || 0;
  const progressoCalorias = Math.min(100, Math.round((caloriasConsumidas / metaCalorias) * 100));
  
  const converterParaMinutos = (horaStr: string) => {
    if (!horaStr) return 0;
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  };
  const formatarMinutos = (minutosTotal: number) => {
    const h = Math.floor(minutosTotal / 60) % 24;
    const m = Math.floor(minutosTotal % 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const acordaMin = converterParaMinutos(dados.horaAcorda || '07:00');
  let dormeMin = converterParaMinutos(dados.horaDorme || '22:00');
  if (dormeMin < acordaMin) dormeMin += 24 * 60; 

  const tempoAcordado = dormeMin - acordaMin;
  
  const REFEICOES = [
    { key: 'cafeManha', titulo: 'Café da Manhã', minutos: acordaMin + 30, icone: '☕' },
    { key: 'almoco', titulo: 'Almoço', minutos: acordaMin + (tempoAcordado * 0.35), icone: '🍛' },
    { key: 'cafeTarde', titulo: 'Café da Tarde', minutos: acordaMin + (tempoAcordado * 0.65), icone: '🥪' },
    { key: 'janta', titulo: 'Jantar', minutos: dormeMin - 120, icone: '🍲' },
  ].map(r => ({ ...r, horario: formatarMinutos(r.minutos) }));

  const refeicoesFeitas = dados.refeicoesConcluidas || [];
  const refeicoesFeitasInfo = REFEICOES.filter(r => refeicoesFeitas.includes(r.key));

  const abrirModalRefeicao = (refeicao: any) => {
    if (refeicoesFeitas.includes(refeicao.key)) return; 
    setRefeicaoModal(refeicao);
    setPorcoesModal({}); // Zera as porções ao abrir
  };

  const toggleAlimentoModal = (idAlimento: string) => {
    setPorcoesModal(prev => {
      const novo = { ...prev };
      if (novo[idAlimento] !== undefined) {
        delete novo[idAlimento]; // Desmarca e remove as calorias
      } else {
        novo[idAlimento] = 100; // Inicia com 100g por padrão
      }
      return novo;
    });
  };

  const atualizarGramas = (idAlimento: string, gramas: string) => {
    // Bloqueia a atualização do estado se passar de 4 caracteres
    if (gramas.length > 4) return; 
    
    setPorcoesModal(prev => ({ ...prev, [idAlimento]: Number(gramas) || 0 }));
  };

  const caloriasTotaisModal = Object.entries(porcoesModal).reduce((acc, [id, gramas]) => {
    const alimento = DICIONARIO_ALIMENTOS[refeicaoModal?.key as keyof typeof DICIONARIO_ALIMENTOS]?.find(a => a.id === id);
    if (!alimento) return acc;
    return acc + Math.round((alimento.kcal100g / 100) * gramas);
  }, 0);

  const confirmarRefeicao = () => {
    if (caloriasTotaisModal > 0) {
      // Calcula as gramas totais de cada macro com base nas porções escolhidas
      const macrosTotaisModal = Object.entries(porcoesModal).reduce((acc, [id, gramas]) => {
        const alimento = DICIONARIO_ALIMENTOS[refeicaoModal?.key as keyof typeof DICIONARIO_ALIMENTOS]?.find(a => a.id === id) as any;
        if (!alimento) return acc;
        acc.proteina += Math.round((alimento.prot / 100) * gramas);
        acc.carbo += Math.round((alimento.carbo / 100) * gramas);
        acc.gordura += Math.round((alimento.gord / 100) * gramas);
        return acc;
      }, { proteina: 0, carbo: 0, gordura: 0 });

      // Envia os 4 dados para o Zustand: chave, calorias, ids, e os macros
      registrarRefeicao(refeicaoModal.key, caloriasTotaisModal, Object.keys(porcoesModal), macrosTotaisModal);
      setRefeicaoModal(null);
    }
  };

  const cancelarRefeicaoFeita = (refeicaoKey: string) => {
    desfazerRefeicao(refeicaoKey);
  };

  const confirmarDesfazerAgua = () => {
    zerarAgua();
    setMostrarModalDesfazerAgua(false);
  };

  const confirmarDesfazerDieta = () => {
    zerarDieta();
    setMostrarModalDesfazerDieta(false);
    setMostrarModalDieta(false);
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-y-auto bg-zinc-950 px-6 py-8 text-white w-full max-w-md mx-auto relative overscroll-none custom-scrollbar pb-28">
      
      {/* Cabeçalho Limpo */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wider">Olá!,</p>
          <h1 className="text-2xl font-bold text-white capitalize">{primeiroNome}</h1>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div 
            onClick={() => setMostrarModalDieta(true)}
            className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 shadow-lg flex flex-col justify-between gap-3 cursor-pointer hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm">🔥</span>
              <span className="text-xs text-zinc-400 font-medium">Dieta (Ver)</span>
            </div>
            <div>
              <p className="text-xl font-bold text-white">{caloriasConsumidas} <span className="text-xs text-zinc-400 font-normal">/ {metaCalorias}</span></p>
              <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-2 border border-zinc-800">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressoCalorias}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 shadow-lg flex flex-col justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm">🎯</span>
              <span className="text-xs text-zinc-400 font-medium">Foco</span>
            </div>
            <div>
              <p className="text-sm font-bold text-green-400 uppercase leading-tight">
                {dados.objetivo === 'perder' ? 'Emagrecer' : dados.objetivo === 'ganhar' ? 'Massa' : 'Manutenção'}
              </p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{pesoNum}kg atual</p>
            </div>
          </div>
        </div>
        
        {/* Hidratação */}
        <div className={`shrink-0 rounded-3xl p-5 shadow-xl flex flex-col gap-4 border transition-all duration-500 ${aguaAtualMl >= metaAguaMl ? 'bg-gradient-to-br from-zinc-900 to-green-950/40 border-green-500/50' : 'bg-zinc-900/80 border-zinc-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all ${aguaAtualMl >= metaAguaMl ? 'bg-green-500/20 border-green-500/40 animate-bounce' : 'bg-blue-500/20 border-blue-500/30'}`}>
                {aguaAtualMl >= metaAguaMl ? '🎉' : '💧'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Hidratação</h2>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${aguaAtualMl >= metaAguaMl ? 'text-green-400' : 'text-blue-400'}`}>{(aguaAtualMl / 1000).toFixed(2)}L</span>
              <span className="text-xs text-zinc-400 block">de {(metaAguaMl / 1000).toFixed(1)}L</span>
            </div>
          </div>
          <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div className={`h-full rounded-full transition-all duration-500 ${aguaAtualMl >= metaAguaMl ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: aguaAtualMl >= metaAguaMl ? '100%' : `${progressoAgua}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-1">
            <button onClick={() => adicionarAgua(200, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border bg-zinc-950 border-zinc-800 text-zinc-200">🥛 <span>+200</span></button>
            <button onClick={() => adicionarAgua(300, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border bg-zinc-950 border-zinc-800 text-zinc-200">🥤 <span>+300</span></button>
            <button onClick={() => adicionarAgua(500, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className="py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border bg-zinc-950 border-zinc-800 text-zinc-200">🍶 <span>+500</span></button>
            <button onClick={() => setMostrarModalDesfazerAgua(true)} className="bg-zinc-950 border-zinc-800 text-zinc-400 py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5">🔄 <span>Desfazer</span></button>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-2 shrink-0">
          <h2 className="text-xl font-bold text-white mb-4">Plano de Hoje</h2>
          
          <div className="flex flex-col gap-4">
            {REFEICOES.map((refeicao, index) => {
              const idsEscolhidos = dados.alimentos[refeicao.key as keyof typeof dados.alimentos] || [];
              const alimentosCompletos = idsEscolhidos.map(id => DICIONARIO_ALIMENTOS[refeicao.key as keyof typeof DICIONARIO_ALIMENTOS].find(item => item.id === id)).filter(Boolean); 
              
              const isFeita = refeicoesFeitas.includes(refeicao.key);
              
              const isFuturo = minutosAtuais < refeicao.minutos - 60 && !isFeita;
              const isAgora = minutosAtuais >= refeicao.minutos - 60 && minutosAtuais <= refeicao.minutos + 120 && !isFeita;

              return (
                <div key={refeicao.key} className={`flex gap-4 relative transition-all duration-500 ${isFuturo ? 'opacity-40 grayscale' : ''}`}>
                  {/* Linha da Timeline */}
                  {index !== REFEICOES.length - 1 && (
                    <div className={`absolute left-[27px] top-12 bottom-[-16px] w-0.5 z-0 transition-colors ${isFeita ? 'bg-green-500' : 'bg-zinc-800'}`}></div>
                  )}

                  {/* Ícone Lateral */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-md transition-all duration-300 ${isFeita ? 'bg-green-500 text-zinc-950' : isAgora ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400 animate-pulse' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
                      {isFeita ? (
                        <span className="text-2xl">✓</span>
                      ) : isFuturo ? (
                        <span className="text-xl opacity-50">🔒</span>
                      ) : (
                        <span className="text-xl">{refeicao.icone}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 ${isAgora ? 'text-orange-400' : 'text-zinc-500'}`}>{refeicao.horario}</span>
                  </div>

                  {/* Cartão de Refeição */}
                  <div 
                    onClick={() => {
                      if (isFuturo) return;
                      isFeita ? cancelarRefeicaoFeita(refeicao.key) : abrirModalRefeicao(refeicao);
                    }}
                    className={`flex-1 rounded-2xl p-4 flex flex-col gap-3 transition-all ${isFuturo ? 'cursor-not-allowed bg-zinc-900/20 border border-zinc-900' : isFeita ? 'bg-zinc-900/20 border border-green-500/20 opacity-60 cursor-pointer' : isAgora ? 'bg-zinc-900/80 border border-orange-500/30 cursor-pointer' : 'bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900/60 cursor-pointer'}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`text-sm font-bold ${isFeita ? 'text-green-500 line-through' : 'text-white'}`}>{refeicao.titulo}</h3>
                      {!isFeita && (
                        <span className={`text-[10px] px-2 py-1 rounded-lg ${isFuturo ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-800 text-zinc-300'}`}>
                          {isFuturo ? 'Em breve' : 'Registar'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {alimentosCompletos.map((alimento: any) => (
                        <div key={alimento.id} className="bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-md flex items-center gap-1">
                          <span className="text-xs">{alimento.emoji}</span>
                          <span className="text-[10px] text-zinc-300">{alimento.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL: RESUMO DA DIETA */}
      {mostrarModalDieta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 w-full max-w-md flex flex-col gap-5 pb-10">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🔥</span> Resumo da Dieta
              </h3>
              <button onClick={() => setMostrarModalDieta(false)} className="text-zinc-400 text-2xl font-bold">×</button>
            </div>
            
            <div className="flex flex-col items-center justify-center p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
              <p className="text-4xl font-black text-white">{caloriasConsumidas} <span className="text-sm text-zinc-400 font-normal">/ {metaCalorias} Kcal</span></p>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-3 border border-zinc-800">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressoCalorias}%` }} />
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">Refeições de Hoje:</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {refeicoesFeitasInfo.length > 0 ? (
                  refeicoesFeitasInfo.map(r => {
                    const cals = (dados.alimentos[r.key as keyof typeof dados.alimentos] || []).reduce((acc, id) => {
                      const alimento = DICIONARIO_ALIMENTOS[r.key as keyof typeof DICIONARIO_ALIMENTOS]?.find(a => a.id === id);
                      return acc + (alimento?.kcal100g || 0); // Exibição simplificada no resumo
                    }, 0);

                    return (
                      <div key={r.key} className="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="text-green-500">✓</span>
                          <span className="text-sm font-medium text-white">{r.titulo}</span>
                        </div>
                        <span className="text-xs text-orange-400 font-bold">+{cals} kcal</span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-zinc-500 italic text-center py-4">Nenhuma refeição registada hoje.</p>
                )}
              </div>
            </div>

            <button 
              onClick={() => setMostrarModalDesfazerDieta(true)}
              className="w-full bg-zinc-900 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/50 text-red-400 font-bold py-4 rounded-xl text-lg mt-2 transition-colors flex items-center justify-center gap-2"
            >
              <span>🔄</span> Zerar Registo Diário
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REGISTAR REFEIÇÃO */}
      {refeicaoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 w-full max-w-md flex flex-col gap-4 pb-10 max-h-[85vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{refeicaoModal.icone}</span> O que comeu?
              </h3>
              <button onClick={() => setRefeicaoModal(null)} className="text-zinc-400 text-2xl font-bold">×</button>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
              <span className="text-3xl">🔥</span>
              <div className="flex-1 text-center">
                <p className="text-4xl font-black text-white">{caloriasTotaisModal} <span className="text-sm text-zinc-400 font-normal">Kcal</span></p>
                <p className="text-xs text-zinc-500 mt-1">Calculado automaticamente</p>
              </div>
            </div>

            <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mt-2">Personalize a sua refeição:</p>

            <div className="grid grid-cols-3 gap-2">
              {DICIONARIO_ALIMENTOS[refeicaoModal.key as keyof typeof DICIONARIO_ALIMENTOS].map((alimento) => {
                const gramas = porcoesModal[alimento.id];
                const estaSelecionado = gramas !== undefined;
                const kcalCalculada = estaSelecionado ? Math.round((alimento.kcal100g / 100) * gramas) : 0;

                return (
                  <div
                    key={alimento.id}
                    onClick={() => !estaSelecionado && toggleAlimentoModal(alimento.id)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 gap-1 ${
                      estaSelecionado
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-md'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 cursor-pointer'
                    }`}
                  >
                    {estaSelecionado && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleAlimentoModal(alimento.id); }}
                        className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white shadow-lg z-10"
                      >
                        ×
                      </button>
                    )}

                    <span className="text-2xl">{alimento.emoji}</span>
                    <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{alimento.nome}</span>
                    
                    {estaSelecionado ? (
                      <div className="flex flex-col items-center w-full mt-1" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center bg-zinc-950 rounded-lg px-2 py-1 border border-orange-500/30 w-full justify-center">
                          <input 
                            type="number" 
                            maxLength={4}
                            value={gramas === 0 ? '' : gramas}
                            onChange={(e) => atualizarGramas(alimento.id, e.target.value)}
                            className="w-10 bg-transparent text-center text-xs text-white outline-none appearance-none font-bold"
                            placeholder="0"
                            autoFocus
                          />
                          <span className="text-[9px] text-zinc-500">g</span>
                        </div>
                        <span className="text-[9px] text-orange-500/70 mt-1">{kcalCalculada} kcal</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-600 opacity-0 hover:opacity-100 transition-opacity hidden md:block">Toque para adicionar</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={confirmarRefeicao}
              disabled={caloriasTotaisModal === 0}
              className={`w-full font-bold py-4 rounded-xl text-lg mt-4 shadow-lg transition-all ${caloriasTotaisModal > 0 ? 'bg-green-500 hover:bg-green-600 text-zinc-950 shadow-green-500/20' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
            >
              Confirmar Refeição
            </button>
          </div>
        </div>
      )}

      {/* Modal Desfazer Água */}
      {mostrarModalDesfazerAgua && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-white">Zerar Água?</h3>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMostrarModalDesfazerAgua(false)} className="flex-1 bg-zinc-800 text-zinc-200 py-3 rounded-xl font-semibold text-sm">Cancelar</button>
              <button onClick={confirmarDesfazerAgua} className="flex-1 bg-red-500 text-zinc-950 font-bold py-3 rounded-xl text-sm">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desfazer Dieta (Confirmação) */}
      {mostrarModalDesfazerDieta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-white">Zerar a Dieta?</h3>
              <p className="text-xs text-zinc-400 mt-1">Deseja realmente desmarcar todas as refeições e zerar as calorias de hoje?</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMostrarModalDesfazerDieta(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3 rounded-xl font-semibold text-sm transition-colors">Cancelar</button>
              <button onClick={confirmarDesfazerDieta} className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}