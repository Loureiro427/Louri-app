import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export function Plano() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);

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

  // --- LÓGICA DE CONSUMO (Preparado para a próxima etapa) ---
  // Temporariamente a 0 até ligarmos os dados do Home.tsx
  const consumidoProt = (dados as any).macrosConsumidos?.proteina || 0;
  const consumidoCarbo = (dados as any).macrosConsumidos?.carbo || 0;
  const consumidoGord = (dados as any).macrosConsumidos?.gordura || 0;

  const progressoProt = Math.min(100, (consumidoProt / gProtMeta) * 100);
  const progressoCarbo = Math.min(100, (consumidoCarbo / gCarboMeta) * 100);
  const progressoGord = Math.min(100, (consumidoGord / gGordMeta) * 100);

  // --- HORÁRIOS ---
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

  const cronograma = [
    { titulo: 'Café da Manhã', horario: formatarMinutos(acordaMin + 30), icone: '☕' },
    { titulo: 'Almoço', horario: formatarMinutos(acordaMin + (tempoAcordado * 0.35)), icone: '🍛' },
    { titulo: 'Café da Tarde', horario: formatarMinutos(acordaMin + (tempoAcordado * 0.65)), icone: '🥪' },
    { titulo: 'Jantar', horario: formatarMinutos(dormeMin - 120), icone: '🍲' },
  ];

  // --- CONTEÚDO DOS MODAIS DE DICAS ---
  const dicasMacros = {
    proteina: {
      titulo: 'Fontes de Proteína', cor: 'text-blue-400', borda: 'border-blue-500',
      desc: 'Essencial para a recuperação e construção muscular. Mantém a saciedade por mais tempo.',
      alimentos: [
        { nome: 'Frango / Peru', emoji: '🍗' }, { nome: 'Ovos', emoji: '🍳' },
        { nome: 'Peixe / Atum', emoji: '🐟' }, { nome: 'Carne Magra', emoji: '🥩' },
        { nome: 'Iogurte / Leite', emoji: '🥛' }, { nome: 'Queijo', emoji: '🧀' },
      ]
    },
    carbo: {
      titulo: 'Fontes de Carboidrato', cor: 'text-green-400', borda: 'border-green-500',
      desc: 'A tua principal fonte de energia. Prefere carboidratos complexos que dão energia duradoura.',
      alimentos: [
        { nome: 'Arroz', emoji: '🍚' }, { nome: 'Aveia', emoji: '🥣' },
        { nome: 'Batata / Mandioca', emoji: '🍠' }, { nome: 'Macarrão', emoji: '🍝' },
        { nome: 'Frutas', emoji: '🍌' }, { nome: 'Tapioca', emoji: '🌮' },
      ]
    },
    gordura: {
      titulo: 'Fontes de Gordura', cor: 'text-orange-400', borda: 'border-orange-500',
      desc: 'Importante para a produção hormonal e absorção de vitaminas. Consome com moderação.',
      alimentos: [
        { nome: 'Castanhas / Nozes', emoji: '🥜' }, { nome: 'Abacate', emoji: '🥑' },
        { nome: 'Azeite / Óleo', emoji: '🫒' }, { nome: 'Gema de Ovo', emoji: '🍳' },
        { nome: 'Chocolate Amargo', emoji: '🍫' }, { nome: 'Manteiga', emoji: '🧈' },
      ]
    }
  };

  return (
    <div className="flex flex-col px-6 py-8 text-white gap-6 pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh]">
      
      <header className="shrink-0">
        <p className="text-zinc-400 text-xs uppercase tracking-wider">Organização</p>
        <h1 className="text-2xl font-bold text-white">O Teu Plano Nutricional</h1>
      </header>

      {/* --- FOCO ATUAL E METAS DIÁRIAS --- */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Metas Diárias</h2>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg uppercase font-bold tracking-wider">
            {objetivo === 'perder' ? 'Emagrecer' : objetivo === 'ganhar' ? 'Massa' : 'Manutenção'}
          </span>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center justify-center gap-1">
            <span className="text-xl">🔥</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Calorias</span>
            <span className="text-sm font-bold text-white">{metaCalorias}</span>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center justify-center gap-1">
            <span className="text-xl">💧</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Água</span>
            <span className="text-sm font-bold text-white">{metaAguaL}L</span>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center justify-center gap-1">
            <span className="text-xl">🌙</span>
            <span className="text-[10px] text-zinc-500 uppercase font-bold">Jejum</span>
            <span className="text-sm font-bold text-white">{horasJejum}h</span>
          </div>
        </div>
      </div>

      {/* --- MACRONUTRIENTES INTERATIVOS --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-bold text-white">Macronutrientes</h3>
          <span className="text-[10px] text-zinc-500">Toque para ver dicas</span>
        </div>
        
        <div className="bg-zinc-900/40 p-5 rounded-3xl border border-zinc-800 flex flex-col gap-2">
          
          {/* Proteína */}
          <div 
            onClick={() => setMacroModal('proteina')}
            className="group cursor-pointer hover:bg-zinc-950/80 p-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium group-hover:text-blue-400 transition-colors">Proteína <span className="text-zinc-500">({pProt * 100}%)</span></span>
              <span className="font-bold text-blue-400">{consumidoProt}g <span className="text-zinc-500 font-normal">/ {gProtMeta}g</span></span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoProt}%` }}></div>
            </div>
          </div>

          {/* Carboidratos */}
          <div 
            onClick={() => setMacroModal('carbo')}
            className="group cursor-pointer hover:bg-zinc-950/80 p-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium group-hover:text-green-400 transition-colors">Carboidratos <span className="text-zinc-500">({pCarbo * 100}%)</span></span>
              <span className="font-bold text-green-400">{consumidoCarbo}g <span className="text-zinc-500 font-normal">/ {gCarboMeta}g</span></span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-green-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoCarbo}%` }}></div>
            </div>
          </div>

          {/* Gorduras */}
          <div 
            onClick={() => setMacroModal('gordura')}
            className="group cursor-pointer hover:bg-zinc-950/80 p-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium group-hover:text-orange-400 transition-colors">Gorduras <span className="text-zinc-500">({pGordura * 100}%)</span></span>
              <span className="font-bold text-orange-400">{consumidoGord}g <span className="text-zinc-500 font-normal">/ {gGordMeta}g</span></span>
            </div>
            <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div className="bg-orange-500 h-full rounded-full transition-all duration-1000" style={{ width: `${progressoGord}%` }}></div>
            </div>
          </div>

        </div>
      </div>

      {/* --- CRONOGRAMA IDEAL --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">O Teu Dia Ideal</h3>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-2">
          {cronograma.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border-b border-zinc-800/50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg">
                  {item.icone}
                </div>
                <span className="text-sm font-medium text-zinc-200">{item.titulo}</span>
              </div>
              <span className="text-sm font-bold text-green-400">{item.horario}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- AÇÕES --- */}
      <div className="flex flex-col gap-4 shrink-0">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold py-4 rounded-2xl text-sm transition-colors flex justify-center items-center gap-2"
        >
          <span>⚙️</span> Recalcular Plano e Metas
        </button>
      </div>

      {/* MODAL INTERATIVO DE DICAS DE MACROS */}
      {macroModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end justify-center z-50 animate-in slide-in-from-bottom-4 overscroll-none">
          <div className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 w-full max-w-md flex flex-col gap-4 pb-10">
            
            <div className="flex justify-between items-center mb-2">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${dicasMacros[macroModal].cor}`}>
                {dicasMacros[macroModal].titulo}
              </h3>
              <button onClick={() => setMacroModal(null)} className="text-zinc-400 hover:text-white text-2xl font-bold">×</button>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed mb-2">
              {dicasMacros[macroModal].desc}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {dicasMacros[macroModal].alimentos.map((alimento, i) => (
                <div key={i} className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-zinc-950/50 transition-all gap-1 border-zinc-800 hover:${dicasMacros[macroModal].borda}`}>
                  <span className="text-2xl">{alimento.emoji}</span>
                  <span className="text-[10px] font-bold text-center leading-tight truncate w-full text-zinc-300">{alimento.nome}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setMacroModal(null)}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl text-sm mt-4 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}