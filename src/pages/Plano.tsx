import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

const CONFIG_REFEICOES: Record<string, { titulo: string; icone: string }> = {
  cafeManha: { titulo: 'Café da Manhã', icone: '☕' },
  almoco: { titulo: 'Almoço', icone: '🍽️' },
  lancheTarde: { titulo: 'Lanche da Tarde', icone: '🍎' },
  cafeTarde: { titulo: 'Café da Tarde', icone: '🧋' },
  janta: { titulo: 'Jantar', icone: '🍲' },
  lancheNoite: { titulo: 'Lanche da Noite', icone: '🌙' },
};

export function Plano() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);

  const temaEscuro = dados.temaEscuro ?? true;

  // Estado para controlar qual modal de dica de macro está aberto
  const [macroModal, setMacroModal] = useState<'proteina' | 'carbo' | 'gordura' | null>(null);

  // --- LÓGICA DE CÁLCULO DE METAS ---
  const pesoNum = Number(dados.peso) || 70;
  const alturaNum = Number(dados.altura) || 170;
  const idadeNum = Number(dados.idade) || 25;
  const sexo = dados.sexo || 'M';
  const objetivo = dados.objetivo || 'manter';

  const metaAguaMl = Math.round((pesoNum * 35) / 1000) * 1000;
  const metaAguaL = (metaAguaMl / 1000).toFixed(1);

  // Cálculo TMB exato por Sexo Biológico (Mifflin-St Jeor)
  let tmb = 10 * pesoNum + 6.25 * alturaNum - 5 * idadeNum;
  tmb = sexo === 'M' ? tmb + 5 : tmb - 161;
  let metaCalorias = Math.round(tmb * 1.3);
  if (objetivo === 'perder') metaCalorias -= 400;
  if (objetivo === 'ganhar') metaCalorias += 400;

  // Macros (Distribuição baseada no objetivo)
  let pProt = 0.30, pCarbo = 0.45, pGordura = 0.25;
  if (objetivo === 'perder') { pProt = 0.35; pCarbo = 0.40; pGordura = 0.25; }
  else if (objetivo === 'ganhar') { pProt = 0.30; pCarbo = 0.50; pGordura = 0.20; }

  const gProtMeta = Math.round((metaCalorias * pProt) / 4);
  const gCarboMeta = Math.round((metaCalorias * pCarbo) / 4);
  const gGordMeta = Math.round((metaCalorias * pGordura) / 9);

  // --- LÓGICA DE CONSUMO ---
  const consumidoProt = dados.macrosConsumidos?.proteina || 0;
  const consumidoCarbo = dados.macrosConsumidos?.carbo || 0;
  const consumidoGord = dados.macrosConsumidos?.gordura || 0;

  const progressoProt = Math.min(100, (consumidoProt / gProtMeta) * 100);
  const progressoCarbo = Math.min(100, (consumidoCarbo / gCarboMeta) * 100);
  const progressoGord = Math.min(100, (consumidoGord / gGordMeta) * 100);

  // --- HORÁRIOS E CRONOGRAMA DINÂMICO ---
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
  const horasJejum = Math.floor((24 * 60 - tempoAcordado) / 60);

  // --- ORDENAÇÃO CRONOLÓGICA E HORÁRIOS INTELIGENTES ---
  const ORDEM_CRONOLOGICA = ['cafeManha', 'almoco', 'lancheTarde', 'cafeTarde', 'janta', 'lancheNoite'];

  const ativasBrutas = dados.refeicoesAtivas && dados.refeicoesAtivas.length > 0 
    ? dados.refeicoesAtivas 
    : ['cafeManha', 'almoco', 'lancheTarde', 'janta'];

  const ativas = ORDEM_CRONOLOGICA.filter(key => ativasBrutas.includes(key));

  const totalRef = ativas.length;
  const inicio = acordaMin + 30; 
  const fim = Math.max(inicio + 60, dormeMin - 90); 
  const span = fim - inicio;

  const cronograma = ativas.map((key, index) => {
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

    const config = CONFIG_REFEICOES[key] || { titulo: key, icone: '🍽️' };
    return {
      titulo: config.titulo,
      icone: config.icone,
      horario: formatarMinutos(Math.round(minutosOffset))
    };
  });

  // --- CONTEÚDO DOS MODAIS DE DICAS ---
  const dicasMacros = {
    proteina: {
      titulo: 'Fontes de Proteína', cor: 'text-blue-500', borda: 'border-blue-500',
      desc: 'Essencial para a recuperação e construção muscular. Mantém a saciedade por mais tempo.',
      alimentos: [
        { nome: 'Frango / Peru', emoji: '🍗' }, { nome: 'Ovos', emoji: '🍳' },
        { nome: 'Peixe / Atum', emoji: '🐟' }, { nome: 'Carne Magra', emoji: '🥩' },
        { nome: 'Iogurte / Leite', emoji: '🥛' }, { nome: 'Queijo', emoji: '🧀' },
      ]
    },
    carbo: {
      titulo: 'Fontes de Carboidrato', cor: 'text-green-500', borda: 'border-green-500',
      desc: 'A tua principal fonte de energia. Prefere carboidratos complexos que dão energia duradoura.',
      alimentos: [
        { nome: 'Arroz', emoji: '🍚' }, { nome: 'Aveia', emoji: '🥣' },
        { nome: 'Batata / Mandioca', emoji: '🍠' }, { nome: 'Macarrão', emoji: '🍝' },
        { nome: 'Frutas', emoji: '🍌' }, { nome: 'Tapioca', emoji: '🌮' },
      ]
    },
    gordura: {
      titulo: 'Fontes de Gordura', cor: 'text-orange-500', borda: 'border-orange-500',
      desc: 'Importante para a produção hormonal e absorção de vitaminas. Consome com moderação.',
      alimentos: [
        { nome: 'Castanhas / Nozes', emoji: '🥜' }, { nome: 'Abacate', emoji: '🥑' },
        { nome: 'Azeite / Óleo', emoji: '🫒' }, { nome: 'Gema de Ovo', emoji: '🍳' },
        { nome: 'Chocolate Amargo', emoji: '🍫' }, { nome: 'Manteiga', emoji: '🧈' },
      ]
    }
  };

  return (
    <div className={`flex flex-col px-6 py-8 gap-6 pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh] transition-colors duration-300 ${
      temaEscuro ? 'text-white' : 'text-zinc-900'
    }`}>
      
      <header className="shrink-0">
        <p className={`text-xs uppercase tracking-wider ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Organização</p>
        <h1 className={`text-2xl font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>O Teu Plano Nutricional</h1>
      </header>

      {/* --- FOCO ATUAL E METAS DIÁRIAS --- */}
      <div className={`border rounded-3xl p-5 shadow-lg flex flex-col gap-4 shrink-0 transition-colors ${
        temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-green-500 uppercase tracking-wide">Metas Diárias</h2>
          <span className={`text-xs px-2 py-1 rounded-lg uppercase font-bold tracking-wider ${
            temaEscuro ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>
            {objetivo === 'perder' ? 'Emagrecer' : objetivo === 'ganhar' ? 'Massa' : 'Manutenção'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-center gap-1 transition-colors ${
            temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <span className="text-xl">🔥</span>
            <span className={`text-[10px] uppercase font-bold ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Calorias</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{metaCalorias}</span>
          </div>
          <div className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-center gap-1 transition-colors ${
            temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <span className="text-xl">💧</span>
            <span className={`text-[10px] uppercase font-bold ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Água</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{metaAguaL}L</span>
          </div>
          <div className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-center gap-1 transition-colors ${
            temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
            <span className="text-xl">🌙</span>
            <span className={`text-[10px] uppercase font-bold ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Jejum</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{horasJejum}h</span>
          </div>
        </div>
      </div>

      {/* --- MACRONUTRIENTES INTERATIVOS --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Macronutrientes</h3>
          <span className={`text-[10px] ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Toque para ver dicas</span>
        </div>
        
        <div className={`p-5 rounded-3xl border flex flex-col gap-2 transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          {/* Proteína */}
          <div 
            onClick={() => setMacroModal('proteina')}
            className={`group cursor-pointer p-2 -mx-2 rounded-xl transition-colors ${
              temaEscuro ? 'hover:bg-zinc-950/80' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-blue-400' : 'text-zinc-700 group-hover:text-blue-600'}`}>
                Proteína <span className={temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}>({Math.round(pProt * 100)}%)</span>
              </span>
              <span className="font-bold text-blue-500">{consumidoProt}g <span className={`font-normal ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>/ {gProtMeta}g</span></span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoProt}%` }}></div>
            </div>
          </div>

          {/* Carboidratos */}
          <div 
            onClick={() => setMacroModal('carbo')}
            className={`group cursor-pointer p-2 -mx-2 rounded-xl transition-colors ${
              temaEscuro ? 'hover:bg-zinc-950/80' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-green-400' : 'text-zinc-700 group-hover:text-green-600'}`}>
                Carboidratos <span className={temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}>({Math.round(pCarbo * 100)}%)</span>
              </span>
              <span className="font-bold text-green-500">{consumidoCarbo}g <span className={`font-normal ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>/ {gCarboMeta}g</span></span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoCarbo}%` }}></div>
            </div>
          </div>

          {/* Gorduras */}
          <div 
            onClick={() => setMacroModal('gordura')}
            className={`group cursor-pointer p-2 -mx-2 rounded-xl transition-colors ${
              temaEscuro ? 'hover:bg-zinc-950/80' : 'hover:bg-zinc-50'
            }`}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className={`font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-orange-400' : 'text-zinc-700 group-hover:text-orange-600'}`}>
                Gorduras <span className={temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}>({Math.round(pGordura * 100)}%)</span>
              </span>
              <span className="font-bold text-orange-500">{consumidoGord}g <span className={`font-normal ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>/ {gGordMeta}g</span></span>
            </div>
            <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}>
              <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoGord}%` }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CRONOGRAMA DINÂMICO --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>O Teu Dia Ideal</h3>
        <div className={`border rounded-3xl p-2 transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          {cronograma.map((item, index) => (
            <div key={index} className={`flex items-center justify-between p-3 border-b last:border-0 transition-colors ${
              temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg transition-colors ${
                  temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  {item.icone}
                </div>
                <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-200' : 'text-zinc-800'}`}>{item.titulo}</span>
              </div>
              <span className="text-sm font-bold text-green-500">{item.horario}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- AÇÕES --- */}
      <div className="flex flex-col gap-4 shrink-0">
        <button 
          onClick={() => navigate('/onboarding')}
          className={`w-full font-bold py-4 rounded-2xl text-sm transition-colors flex justify-center items-center gap-2 border ${
            temaEscuro ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700 text-white' : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800 shadow-sm'
          }`}
        >
          <span>⚙️</span> Recalcular Plano e Metas
        </button>
      </div>

      {/* MODAL INTERATIVO DE DICAS DE MACROS */}
      {macroModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          <div className={`border-t rounded-t-3xl p-6 w-full max-w-md flex flex-col gap-4 pb-10 shadow-2xl transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${dicasMacros[macroModal].cor}`}>
                {dicasMacros[macroModal].titulo}
              </h3>
              <button onClick={() => setMacroModal(null)} className={`text-2xl font-bold ${temaEscuro ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>×</button>
            </div>
            
            <p className={`text-xs leading-relaxed mb-2 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {dicasMacros[macroModal].desc}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {dicasMacros[macroModal].alimentos.map((alimento, i) => (
                <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1 ${
                  temaEscuro ? 'bg-zinc-950/50 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                }`}>
                  <span className="text-2xl">{alimento.emoji}</span>
                  <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{alimento.nome}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setMacroModal(null)}
              className={`w-full font-bold py-4 rounded-xl text-sm mt-4 transition-colors ${
                temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
              }`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}