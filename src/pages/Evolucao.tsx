import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUserStore } from '../store/useUserStore';
import CalendarHistory from '../components/CalendarHistory';

export function Evolucao() {
  const dados = useUserStore((state) => state.dados);
  const temaEscuro = dados.temaEscuro ?? true;
  const pesoNum = Number(dados.peso) || 70;
  const streakAtual = dados.streak || 0;

  // Estado para controlar o modal do Streak
  const [mostrarModalStreak, setMostrarModalStreak] = useState(false);

  // Calcula o próximo marco de dias
  const proximoMarco = streakAtual < 7 ? 7 : streakAtual < 14 ? 14 : streakAtual < 30 ? 30 : streakAtual < 90 ? 90 : streakAtual + 10;
  const diasParaMarco = proximoMarco - streakAtual;

  return (
    <div className={`flex flex-col px-6 py-8 gap-6 pb-28 max-w-md mx-auto w-full min-h-full transition-colors duration-300 ${
      temaEscuro ? 'text-white' : 'text-zinc-900'
    }`}>
      
      <header className="shrink-0">
        <p className={`text-xs uppercase tracking-wider ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Consistência</p>
        <h1 className={`text-2xl font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>A Tua Evolução</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className={`border rounded-3xl p-4 flex flex-col justify-between gap-2 shadow-lg transition-colors ${
          temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <span className={`text-xs font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Peso Atual</span>
          <p className="text-3xl font-black text-green-500">{pesoNum} <span className={`text-sm font-normal ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>kg</span></p>
        </div>
        
        {/* Cartão do Streak com interatividade (onClick) */}
        <div 
          onClick={() => setMostrarModalStreak(true)}
          className={`border rounded-3xl p-4 flex flex-col justify-between gap-2 shadow-lg cursor-pointer transition-all active:scale-95 ${
            temaEscuro ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900' : 'bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'
          }`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-xs font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Sequência</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500`}>Info</span>
          </div>
          <p className="text-3xl font-black text-orange-500">
            🔥 {streakAtual} <span className={`text-sm font-normal ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>{streakAtual === 1 ? 'dia' : 'dias'}</span>
          </p>
        </div>
      </div>

      <div className={`border rounded-3xl p-5 flex flex-col gap-3 shrink-0 transition-colors ${
        temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <h3 className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Registo de Hoje</h3>
        
        <div className={`flex justify-between items-center py-2 border-b ${temaEscuro ? 'border-zinc-800' : 'border-zinc-100'}`}>
          <span className={`text-xs ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Água Consumida</span>
          <span className="text-xs font-bold text-blue-500">{(dados.aguaConsumida || 0) / 1000}L</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className={`text-xs ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Calorias Ingeridas</span>
          <span className="text-xs font-bold text-orange-500">{dados.caloriasConsumidas || 0} Kcal</span>
        </div>
      </div>

      {/* --- CALENDÁRIO DE HISTÓRICO --- */}
      <div className="shrink-0">
        <h3 className={`text-lg font-bold mb-3 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Histórico Mensal</h3>
        <CalendarHistory />
      </div>

      {/* MODAL: INFORMAÇÕES DO STREAK */}
      {mostrarModalStreak && createPortal(
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200 overscroll-none">
          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMostrarModalStreak(false)}></div>
          
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5 shadow-2xl transition-colors ${
              temaEscuro ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white border border-zinc-200 text-zinc-900'
            }`}>
              
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-orange-500/20 border border-orange-500/30`}>
                  🔥
                </div>
                <button onClick={() => setMostrarModalStreak(false)} className={`text-2xl font-bold ${temaEscuro ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>×</button>
              </div>
              
              <div>
                <h3 className="text-xl font-bold">O que é a Sequência?</h3>
                <p className={`text-sm mt-2 leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  A tua sequência (streak) regista os dias consecutivos em que entraste na aplicação e registaste pelo menos uma refeição ou copo de água. Serve para medir a tua consistência!
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-orange-500">Próximo Marco: {proximoMarco} dias</span>
                  <span className={`text-[10px] ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Faltam {diasParaMarco} dias</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden border transition-colors ${
                  temaEscuro ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
                }`}>
                  <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${(streakAtual / proximoMarco) * 100}%` }} />
                </div>
              </div>
              
              <button 
                onClick={() => setMostrarModalStreak(false)}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${
                  temaEscuro ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                Continuar o foco
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}