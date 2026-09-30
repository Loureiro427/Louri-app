import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import logoImg from '../assets/logo.png';

const DICIONARIO_ALIMENTOS: Record<string, { id: string; nome: string; emoji: string; kcal100g: number; prot: number; carbo: number; gord: number }[]> = {
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
  lancheTarde: [
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
  cafeTarde: [
    { id: 'cuscuz_tarde', nome: 'Cuscuz', emoji: '🌽', kcal100g: 110, prot: 3, carbo: 23, gord: 1 },
    { id: 'pao_chapa', nome: 'Pão na Chapa', emoji: '🍞', kcal100g: 300, prot: 7, carbo: 50, gord: 8 },
    { id: 'bolo_tarde', nome: 'Bolo Simples', emoji: '🥮', kcal100g: 350, prot: 5, carbo: 50, gord: 15 },
    { id: 'fruta_l', nome: 'Fruta', emoji: '🍎', kcal100g: 52, prot: 0, carbo: 14, gord: 0 },
    { id: 'cha', nome: 'Chá', emoji: '🍵', kcal100g: 2, prot: 0, carbo: 0, gord: 0 },
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
  lancheNoite: [
    { id: 'chapa_noite', nome: 'Chá Relaxante', emoji: '🍵', kcal100g: 2, prot: 0, carbo: 0, gord: 0 },
    { id: 'ceia_fruta', nome: 'Fruta Leve', emoji: '🍌', kcal100g: 90, prot: 1, carbo: 23, gord: 0 },
    { id: 'iogurte_noite', nome: 'Iogurte Proteico', emoji: '🥛', kcal100g: 65, prot: 8, carbo: 6, gord: 1 },
    { id: 'barra_cereal', nome: 'Barra de Cereal', emoji: '🥜', kcal100g: 400, prot: 6, carbo: 65, gord: 10 },
  ],
};

const CONFIG_REFEICOES: Record<string, { titulo: string; icone: string }> = {
  cafeManha: { titulo: 'Café da Manhã', icone: '☕' },
  almoco: { titulo: 'Almoço', icone: '🍽️' },
  lancheTarde: { titulo: 'Lanche da Tarde', icone: '🍎' },
  cafeTarde: { titulo: 'Café da Tarde', icone: '🧋' },
  janta: { titulo: 'Jantar', icone: '🍲' },
  lancheNoite: { titulo: 'Lanche da Noite', icone: '🌙' },
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

  const temaEscuro = dados.temaEscuro ?? true;

  // Modais
  const [mostrarModalDesfazerAgua, setMostrarModalDesfazerAgua] = useState(false);
  const [mostrarModalDieta, setMostrarModalDieta] = useState(false);
  const [mostrarModalDesfazerDieta, setMostrarModalDesfazerDieta] = useState(false);
  
  const [refeicaoModal, setRefeicaoModal] = useState<any>(null); 
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
      <div className={`flex flex-col h-[100dvh] px-6 py-10 justify-between items-center overflow-hidden overscroll-none relative select-none transition-colors duration-300 ${
        temaEscuro ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
      }`}>
        
        <div className="absolute top-1/4 w-72 h-72 bg-green-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-full"></div>

        <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 animate-[spin_30s_linear_infinite]">
              <div className="absolute top-3 left-6 text-2xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🍎</div>
              <div className="absolute top-2 right-10 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🔥</div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-3 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🍊</div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-3 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">💪</div>
              <div className="absolute bottom-6 left-10 text-3xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">👟</div>
              <div className="absolute bottom-4 right-12 text-2xl animate-[spin_30s_linear_infinite_reverse] drop-shadow-md">🥗</div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-center gap-3">
              <div className={`w-24 h-24 rounded-3xl p-3 shadow-2xl flex items-center justify-center backdrop-blur-md overflow-hidden border ${
                temaEscuro ? 'bg-zinc-900/40 border-zinc-800/80' : 'bg-white border-zinc-200 shadow-sm'
              }`}>
                <img src={logoImg} alt="Louri Logo" className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
              </div>
              <h1 className={`text-3xl font-black tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Louri</h1>
            </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3 z-10 pb-6">
          <button 
            onClick={() => navigate('/onboarding')} 
            className="w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-4 rounded-2xl text-base shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]"
          >
            Começar Agora
          </button>
          
          <button 
            onClick={() => alert('Em breve!')} 
            className={`w-full font-semibold py-4 rounded-2xl text-base transition-all active:scale-[0.98] border ${
              temaEscuro ? 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 text-zinc-300' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-700 shadow-sm'
            }`}
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

  const ORDEM_CRONOLOGICA = ['cafeManha', 'almoco', 'lancheTarde', 'cafeTarde', 'janta', 'lancheNoite'];

  const ativasBrutas = dados.refeicoesAtivas && dados.refeicoesAtivas.length > 0 
    ? dados.refeicoesAtivas 
    : ['cafeManha', 'almoco', 'lancheTarde', 'janta'];

  const ativas = ORDEM_CRONOLOGICA.filter(key => ativasBrutas.includes(key));

  const totalRef = ativas.length;
  const inicio = acordaMin + 30; 
  const fim = Math.max(inicio + 60, dormeMin - 90); 
  const span = fim - inicio;

  const REFEICOES = ativas.map((key, index) => {
    let minutosOffset;

    if (totalRef === 1) {
      if (key === 'cafeManha') {
        minutosOffset = acordaMin + 30;
      } else if (key === 'almoco') {
        minutosOffset = Math.min(dormeMin - 120, Math.max(acordaMin + 120, 12 * 60 + 30));
      } else if (key === 'janta') {
        minutosOffset = Math.min(dormeMin - 120, Math.max(acordaMin + 180, 20 * 60));
      } else {
        minutosOffset = acordaMin + span / 2;
      }
    } else {
      minutosOffset = inicio + (span * (index / (totalRef - 1)));
    }

    const config = CONFIG_REFEICOES[key] || { titulo: key, icone: '🍽️️' };
    return {
      key,
      titulo: config.titulo,
      icone: config.icone,
      minutos: Math.round(minutosOffset),
      horario: formatarMinutos(Math.round(minutosOffset))
    };
  });

  const refeicoesFeitas = dados.refeicoesConcluidas || [];
  const refeicoesFeitasInfo = REFEICOES.filter(r => refeicoesFeitas.includes(r.key));

  const abrirModalRefeicao = (refeicao: any) => {
    if (refeicoesFeitas.includes(refeicao.key)) return; 
    setRefeicaoModal(refeicao);
    setPorcoesModal({}); 
  };

  const toggleAlimentoModal = (idAlimento: string) => {
    setPorcoesModal(prev => {
      const novo = { ...prev };
      if (novo[idAlimento] !== undefined) {
        delete novo[idAlimento]; 
      } else {
        novo[idAlimento] = 100; 
      }
      return novo;
    });
  };

  const atualizarGramas = (idAlimento: string, gramas: string) => {
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
      const macrosTotaisModal = Object.entries(porcoesModal).reduce((acc, [id, gramas]) => {
        const alimento = DICIONARIO_ALIMENTOS[refeicaoModal?.key as keyof typeof DICIONARIO_ALIMENTOS]?.find(a => a.id === id) as any;
        if (!alimento) return acc;
        acc.proteina += Math.round((alimento.prot / 100) * gramas);
        acc.carbo += Math.round((alimento.carbo / 100) * gramas);
        acc.gordura += Math.round((alimento.gord / 100) * gramas);
        return acc;
      }, { proteina: 0, carbo: 0, gordura: 0 });

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
    <div className={`flex flex-col h-[100dvh] overflow-y-auto px-6 py-8 w-full max-w-md mx-auto relative overscroll-none custom-scrollbar pb-28 transition-colors duration-300 ${
      temaEscuro ? 'text-white' : 'text-zinc-900'
    }`}>
      
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <p className={`text-xs uppercase tracking-wider ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Olá,</p>
          <h1 className={`text-2xl font-bold capitalize ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{primeiroNome}</h1>
        </div>
      </header>

      <div className="flex flex-col gap-5">
        
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div 
            onClick={() => setMostrarModalDieta(true)}
            className={`border rounded-3xl p-4 shadow-lg flex flex-col justify-between gap-3 cursor-pointer transition-colors ${
              temaEscuro ? 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 text-sm">🔥</span>
              <span className={`text-xs font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Dieta (Ver)</span>
            </div>
            <div>
              <p className={`text-xl font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{caloriasConsumidas} <span className={`text-xs font-normal ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>/ {metaCalorias}</span></p>
              <div className={`w-full h-1.5 rounded-full overflow-hidden mt-2 border transition-colors ${
                temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressoCalorias}%` }} />
              </div>
            </div>
          </div>

          <div className={`border rounded-3xl p-4 shadow-lg flex flex-col justify-between gap-2 transition-colors ${
            temaEscuro ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">🎯</span>
              <span className={`text-xs font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Foco</span>
            </div>
            <div>
              <p className="text-sm font-bold text-green-500 uppercase leading-tight">
                {dados.objetivo === 'perder' ? 'Emagrecer' : dados.objetivo === 'ganhar' ? 'Massa' : 'Manutenção'}
              </p>
              <p className={`text-[10px] mt-0.5 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>{pesoNum}kg atual</p>
            </div>
          </div>
        </div>
        
        {/* Hidratação */}
        <div className={`shrink-0 rounded-3xl p-5 shadow-xl flex flex-col gap-4 border transition-all duration-500 ${
          aguaAtualMl >= metaAguaMl 
            ? temaEscuro ? 'bg-gradient-to-br from-zinc-900 to-green-950/40 border-green-500/50' : 'bg-gradient-to-br from-white to-green-50 border-green-500/50 shadow-sm' 
            : temaEscuro ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all ${
                aguaAtualMl >= metaAguaMl ? 'bg-green-500/20 border-green-500/40 animate-bounce' : 'bg-blue-500/20 border-blue-500/30'
              }`}>
                {aguaAtualMl >= metaAguaMl ? '🎉' : '💧'}
              </div>
              <div>
                <h2 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Hidratação</h2>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xl font-bold ${aguaAtualMl >= metaAguaMl ? 'text-green-500' : 'text-blue-500'}`}>{(aguaAtualMl / 1000).toFixed(2)}L</span>
              <span className={`text-xs block ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>de {(metaAguaMl / 1000).toFixed(1)}L</span>
            </div>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border transition-colors ${
            temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <div className={`h-full rounded-full transition-all duration-500 ${aguaAtualMl >= metaAguaMl ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: aguaAtualMl >= metaAguaMl ? '100%' : `${progressoAgua}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-1">
            <button onClick={() => adicionarAgua(200, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}>🥛 <span>+200</span></button>
            <button onClick={() => adicionarAgua(300, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}>🥤 <span>+300</span></button>
            <button onClick={() => adicionarAgua(500, metaAguaMl)} disabled={aguaAtualMl >= metaAguaMl} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}>🍶 <span>+500</span></button>
            <button onClick={() => setMostrarModalDesfazerAgua(true)} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
            }`}>🔄 <span>Desfazer</span></button>
          </div>
        </div>

        {/* Timeline Dinâmica */}
        <div className="mt-2 shrink-0">
          <h2 className={`text-xl font-bold mb-4 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Plano de Hoje</h2>
          
          <div className="flex flex-col gap-4">
            {REFEICOES.map((refeicao, index) => {
              const idsEscolhidos = dados.alimentos[refeicao.key as keyof typeof dados.alimentos] || [];
              const dicionarioRef = DICIONARIO_ALIMENTOS[refeicao.key] || [];
              const alimentosCompletos = idsEscolhidos.map(id => dicionarioRef.find(item => item.id === id)).filter(Boolean); 
              
              const isFeita = refeicoesFeitas.includes(refeicao.key);
              const isFuturo = minutosAtuais < refeicao.minutos - 60 && !isFeita;
              const isAgora = minutosAtuais >= refeicao.minutos - 60 && minutosAtuais <= refeicao.minutos + 120 && !isFeita;

              return (
                <div key={refeicao.key} className={`flex gap-4 relative transition-all duration-500 ${isFuturo ? 'opacity-40 grayscale' : ''}`}>
                  {index !== REFEICOES.length - 1 && (
                    <div className={`absolute left-[27px] top-12 bottom-[-16px] w-0.5 z-0 transition-colors ${isFeita ? 'bg-green-500' : temaEscuro ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                  )}

                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-md transition-all duration-300 ${
                      isFeita 
                        ? 'bg-green-500 text-zinc-950 font-bold' 
                        : isAgora 
                          ? 'bg-orange-500/20 border border-orange-500/50 text-orange-500 animate-pulse' 
                          : temaEscuro ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-white border border-zinc-200 text-zinc-600 shadow-sm'
                    }`}>
                      {isFeita ? (
                        <span className="text-2xl">✓</span>
                      ) : isFuturo ? (
                        <span className="text-xl opacity-50">🔒</span>
                      ) : (
                        <span className="text-xl">{refeicao.icone}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold mt-1 ${isAgora ? 'text-orange-500' : temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>{refeicao.horario}</span>
                  </div>

                  <div 
                    onClick={() => {
                      if (isFuturo) return;
                      isFeita ? cancelarRefeicaoFeita(refeicao.key) : abrirModalRefeicao(refeicao);
                    }}
                    className={`flex-1 rounded-2xl p-4 flex flex-col gap-3 transition-all ${
                      isFuturo 
                        ? temaEscuro ? 'cursor-not-allowed bg-zinc-900/20 border border-zinc-900' : 'cursor-not-allowed bg-zinc-100/50 border border-zinc-200' 
                        : isFeita 
                          ? temaEscuro ? 'bg-zinc-900/20 border border-green-500/20 opacity-60 cursor-pointer' : 'bg-green-50/50 border border-green-500/30 opacity-70 cursor-pointer shadow-sm' 
                          : isAgora 
                            ? temaEscuro ? 'bg-zinc-900/80 border border-orange-500/30 cursor-pointer' : 'bg-white border border-orange-500/40 cursor-pointer shadow-sm' 
                            : temaEscuro ? 'bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-900/60 cursor-pointer' : 'bg-white border border-zinc-200 hover:bg-zinc-50 cursor-pointer shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`text-sm font-bold ${isFeita ? 'text-green-500 line-through' : temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{refeicao.titulo}</h3>
                      {!isFeita && (
                        <span className={`text-[10px] px-2 py-1 rounded-lg ${
                          isFuturo 
                            ? temaEscuro ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-200 text-zinc-400' 
                            : temaEscuro ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700 font-medium'
                        }`}>
                          {isFuturo ? 'Em breve' : 'Registar'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {alimentosCompletos.map((alimento: any) => (
                        <div key={alimento.id} className={`border px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                          temaEscuro ? 'bg-zinc-950/80 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}>
                          <span className="text-xs">{alimento.emoji}</span>
                          <span className="text-[10px]">{alimento.nome}</span>
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
      {mostrarModalDieta && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          <div className={`border-t rounded-t-3xl p-6 w-full max-w-md flex flex-col gap-5 pb-10 shadow-2xl transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>🔥</span> Resumo da Dieta
              </h3>
              <button onClick={() => setMostrarModalDieta(false)} className={`text-2xl font-bold ${temaEscuro ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>×</button>
            </div>
            
            <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${
              temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
              <p className={`text-4xl font-black ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{caloriasConsumidas} <span className={`text-sm font-normal ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>/ {metaCalorias} Kcal</span></p>
              <div className={`w-full h-2 rounded-full overflow-hidden mt-3 border transition-colors ${
                temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressoCalorias}%` }} />
              </div>
            </div>

            <div>
              <p className={`text-xs uppercase tracking-wider font-semibold mb-3 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Refeições de Hoje:</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {refeicoesFeitasInfo.length > 0 ? (
                  refeicoesFeitasInfo.map(r => {
                    const cals = (dados.alimentos[r.key as keyof typeof dados.alimentos] || []).reduce((acc, id) => {
                      const alimento = DICIONARIO_ALIMENTOS[r.key as keyof typeof DICIONARIO_ALIMENTOS]?.find(a => a.id === id);
                      return acc + (alimento?.kcal100g || 0);
                    }, 0);

                    return (
                      <div key={r.key} className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                        temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-green-500 font-bold">✓</span>
                          <span className="text-sm font-medium">{r.titulo}</span>
                        </div>
                        <span className="text-xs text-orange-500 font-bold">+{cals} kcal</span>
                      </div>
                    );
                  })
                ) : (
                  <p className={`text-sm italic text-center py-4 ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Nenhuma refeição registada hoje.</p>
                )}
              </div>
            </div>

            <button 
              onClick={() => setMostrarModalDesfazerDieta(true)}
              className={`w-full border font-bold py-4 rounded-xl text-lg mt-2 transition-colors flex items-center justify-center gap-2 ${
                temaEscuro ? 'bg-zinc-900 hover:bg-red-500/10 border-zinc-800 hover:border-red-500/50 text-red-400' : 'bg-zinc-50 hover:bg-red-50 border-zinc-200 hover:border-red-200 text-red-500'
              }`}
            >
              <span>🔄</span> Zerar Registo Diário
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* 👇 MODAL: REGISTAR REFEIÇÃO (AJUSTADO PARA A BARRA FIXA NO FUNDO IGUAL À REFEIÇÃO LIVRE) */}
      {refeicaoModal && createPortal(
        <div className="fixed inset-0 z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          {/* Overlay escuro que fecha ao clicar fora */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRefeicaoModal(null)}></div>
          
          <div className={`absolute bottom-0 w-full h-[90vh] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-t border-zinc-800 text-white' : 'bg-white border-t border-zinc-200 text-zinc-900'
          }`}>
            
            {/* CABEÇALHO DO MODAL */}
            <div className="shrink-0 p-6 pb-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>{refeicaoModal.icone}</span> O que comeu?
                </h3>
                <button onClick={() => setRefeicaoModal(null)} className={`text-2xl font-bold ${temaEscuro ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>×</button>
              </div>
              
              <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <span className="text-3xl">🔥</span>
                <div className="flex-1 text-center">
                  <p className={`text-4xl font-black ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{caloriasTotaisModal} <span className={`text-sm font-normal ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Kcal</span></p>
                  <p className={`text-xs mt-1 ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Calculado automaticamente</p>
                </div>
              </div>

              <p className={`text-xs uppercase tracking-wider font-semibold mt-4 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Personalize a sua refeição:</p>
            </div>
            
            {/* ÁREA DE SCROLL (Grelha de Alimentos) */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar">
              <div className="grid grid-cols-3 gap-2">
                {(() => {
                  const favoritosDaRefeicao = dados.alimentos[refeicaoModal.key as keyof typeof dados.alimentos] || [];
                  const todosAlimentos = DICIONARIO_ALIMENTOS[refeicaoModal.key as keyof typeof DICIONARIO_ALIMENTOS] || [];

                  const alimentosOrdenados = [...todosAlimentos].sort((a, b) => {
                    const aFav = favoritosDaRefeicao.includes(a.id) ? -1 : 1;
                    const bFav = favoritosDaRefeicao.includes(b.id) ? -1 : 1;
                    return aFav - bFav;
                  });

                  return alimentosOrdenados.map((alimento) => {
                    const gramas = porcoesModal[alimento.id];
                    const estaSelecionado = gramas !== undefined;
                    const kcalCalculada = estaSelecionado ? Math.round((alimento.kcal100g / 100) * gramas) : 0;
                    const isFavorito = favoritosDaRefeicao.includes(alimento.id);

                    return (
                      <div
                        key={alimento.id}
                        onClick={() => !estaSelecionado && toggleAlimentoModal(alimento.id)}
                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 gap-1 ${
                          estaSelecionado
                            ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-md'
                            : temaEscuro 
                              ? 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 cursor-pointer' 
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300 cursor-pointer shadow-sm'
                        }`}
                      >
                        {isFavorito && !estaSelecionado && (
                          <span className="absolute top-1.5 left-2 text-[8px] text-green-500 font-bold">★</span>
                        )}

                        {estaSelecionado && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleAlimentoModal(alimento.id); }}
                            className={`absolute -top-2 -right-2 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white shadow-lg z-10 transition-colors ${
                              temaEscuro ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                            }`}
                          >
                            ×
                          </button>
                        )}

                        <span className="text-2xl">{alimento.emoji}</span>
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{alimento.nome}</span>
                        
                        {estaSelecionado ? (
                          <div className="flex flex-col items-center w-full mt-1" onClick={(e) => e.stopPropagation()}>
                            <div className={`flex items-center rounded-lg px-2 py-1 border border-orange-500/40 w-full justify-center ${
                              temaEscuro ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900 shadow-inner'
                            }`}>
                              <input 
                                type="number" 
                                maxLength={4}
                                value={gramas === 0 ? '' : gramas}
                                onChange={(e) => atualizarGramas(alimento.id, e.target.value)}
                                className="w-10 bg-transparent text-center text-xs outline-none appearance-none font-bold"
                                placeholder="0"
                                autoFocus
                              />
                              <span className={`text-[9px] ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>g</span>
                            </div>
                            <span className="text-[9px] text-orange-500 font-bold mt-1">{kcalCalculada} kcal</span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-zinc-400 opacity-0 hover:opacity-100 transition-opacity hidden md:block">Toque para adicionar</span>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* BARRA INFERIOR FIXA */}
            <div className={`absolute bottom-0 left-0 w-full px-6 py-4 flex justify-between items-center z-50 border-t ${
              temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  Total Livre
                </span>
                <span className="text-xl font-bold text-orange-500">
                  {caloriasTotaisModal} kcal
                </span>
              </div>
              
              <button 
                onClick={confirmarRefeicao}
                disabled={caloriasTotaisModal === 0}
                className={`px-8 py-3.5 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                  caloriasTotaisModal > 0 
                    ? 'bg-green-500 hover:bg-green-400 text-zinc-950 shadow-green-500/20' 
                    : temaEscuro ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                }`}
              >
                Registar
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Modal Desfazer Água */}
      {mostrarModalDesfazerAgua && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold">Zerar Água?</h3>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMostrarModalDesfazerAgua(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                temaEscuro ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}>Cancelar</button>
              <button onClick={confirmarDesfazerAgua} className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-colors">Confirmar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Desfazer Dieta */}
      {mostrarModalDesfazerDieta && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold">Zerar a Dieta?</h3>
              <p className={`text-xs mt-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Deseja realmente desmarcar todas as refeições e zerar as calorias de hoje?</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setMostrarModalDesfazerDieta(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-colors ${
                temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}>Cancelar</button>
              <button onClick={confirmarDesfazerDieta} className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-colors">Confirmar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}