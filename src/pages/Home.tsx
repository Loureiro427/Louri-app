import { MealComposer } from '../components/MealComposer';
import { calcularPorcoes, DICIONARIO_ALIMENTOS } from '../data/alimentos';
import { calculateWaterGoal, calculateCaloricGoal, getCronograma, getRotina } from '../utils/nutritionMath';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import logoImg from '../assets/logo.png';

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
  
  const [refeicaoModal, setRefeicaoModal] = useState<ReturnType<typeof getCronograma>[number] | null>(null);
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
              <h1 className={`text-3xl font-black tracking-tight flex items-center gap-2 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
                Louri <span className="text-xs text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded-lg">Beta</span>
              </h1>
            </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-3 z-10 pb-6">
          <button 
            onClick={() => navigate('/onboarding')} 
            className={`w-full font-bold py-4 rounded-2xl text-lg shadow-xl transition-all active:scale-[0.98] ${
              temaEscuro ? 'bg-green-500 hover:bg-green-400 text-zinc-950 shadow-green-500/20' : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30'
            }`}
          >
            Começar Agora
          </button>
        </div>

      </div>
    );
  }
  
  const primeiroNome = dados.nome ? dados.nome.trim().split(' ')[0] : '';
  const pesoNum = Number(dados.peso) || 70;
  
  const metaAguaMl = calculateWaterGoal(pesoNum);
  const aguaAtualMl = dados.aguaConsumida || 0;
  const progressoAgua = Math.min(100, Math.round((aguaAtualMl / metaAguaMl) * 100));
  
  const metaCalorias = calculateCaloricGoal(pesoNum, Number(dados.altura) || 170, Number(dados.idade) || 25, dados.sexo || 'M', dados.objetivo);

  const caloriasConsumidas = dados.caloriasConsumidas || 0;
  const progressoCalorias = Math.min(100, Math.round((caloriasConsumidas / metaCalorias) * 100));
  
  const REFEICOES = getCronograma(dados);
  const { acordaMin, dormeMin } = getRotina(dados);
  const minutosRotina = dormeMin >= 1440 && minutosAtuais < acordaMin ? minutosAtuais + 1440 : minutosAtuais;

  const refeicoesFeitas = dados.refeicoesConcluidas || [];
  const refeicoesFeitasInfo = Object.entries(dados.historico?.[dados.ultimaData]?.refeicoesDetalhadas || {}).map(([key, r]) => ({ key, titulo: r.titulo }));

  const abrirModalRefeicao = (refeicao: ReturnType<typeof getCronograma>[number]) => {
    if (!refeicoesFeitas.includes(refeicao.key)) setRefeicaoModal(refeicao);
  };
  const confirmarRefeicao = (porcoes: Record<string, number>) => {
    if (!refeicaoModal) return;
    const alimentos = DICIONARIO_ALIMENTOS[refeicaoModal.key] || [];
    const total = calcularPorcoes(porcoes, alimentos);
    registrarRefeicao(refeicaoModal.key, refeicaoModal.titulo, refeicaoModal.icone, total.calorias,
      Object.keys(porcoes).map(id => alimentos.find(a => a.id === id)?.nome || id), total.macros, porcoes);
    setRefeicaoModal(null);
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
        
        {/* Hidratação (Sem limite de consumo) */}
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
              <span className={`text-xs block ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>de {(metaAguaMl / 1000).toFixed(2)}L</span>
            </div>
          </div>
          <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border transition-colors ${
            temaEscuro ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <div className={`h-full rounded-full transition-all duration-500 ${aguaAtualMl >= metaAguaMl ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progressoAgua}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-2 mt-1">
            <button onClick={() => adicionarAgua(200, 99999)} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}>🥛 <span>+200</span></button>
            <button onClick={() => adicionarAgua(300, 99999)} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
              temaEscuro ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:bg-zinc-900' : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
            }`}>🥤 <span>+300</span></button>
            <button onClick={() => adicionarAgua(500, 99999)} className={`py-2.5 rounded-xl text-xs font-semibold flex flex-col items-center gap-0.5 border transition-colors ${
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
              const alimentosCompletos = idsEscolhidos.map(id => dicionarioRef.find(item => item.id === id || item.nome === id)).filter(Boolean);
              
              const isFeita = refeicoesFeitas.includes(refeicao.key);
              const isFuturo = minutosRotina < refeicao.minutos - 60 && !isFeita;
              const isAgora = minutosRotina >= refeicao.minutos - 60 && minutosRotina <= refeicao.minutos + 120 && !isFeita;

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
                    const cals = dados.caloriasPorRefeicao[r.key] || 0;

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

      {refeicaoModal && createPortal(
        <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={refeicaoModal.titulo}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setRefeicaoModal(null)} />
          <div className="relative w-full max-w-md h-[90dvh] rounded-t-3xl overflow-hidden shadow-2xl">
            <MealComposer alimentos={DICIONARIO_ALIMENTOS[refeicaoModal.key] || []} memoriaKey={refeicaoModal.key} titulo={refeicaoModal.titulo} onClose={() => setRefeicaoModal(null)} onConfirm={confirmarRefeicao} />
          </div>
        </div>, document.body
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