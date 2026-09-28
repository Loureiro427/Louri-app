import { useUserStore } from '../store/useUserStore';
import CalendarHistory from '../components/CalendarHistory';

export function Evolucao() {
  const dados = useUserStore((state) => state.dados);
  const pesoNum = Number(dados.peso) || 70;
  const streakAtual = dados.streak || 0;

  return (
    <div className="flex flex-col px-6 py-8 text-white gap-6 pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh]">
      
      <header className="shrink-0">
        <p className="text-zinc-400 text-xs uppercase tracking-wider">Consistência</p>
        <h1 className="text-2xl font-bold text-white">A Tua Evolução</h1>
      </header>

      <div className="grid grid-cols-2 gap-3 shrink-0">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <span className="text-xs text-zinc-400 font-medium">Peso Atual</span>
          <p className="text-3xl font-black text-green-400">{pesoNum} <span className="text-sm font-normal text-zinc-400">kg</span></p>
        </div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-4 flex flex-col justify-between gap-2 shadow-lg">
          <span className="text-xs text-zinc-400 font-medium">Sequência (Streak)</span>
          <p className="text-3xl font-black text-orange-400">
            🔥 {streakAtual} <span className="text-sm font-normal text-zinc-400">{streakAtual === 1 ? 'dia' : 'dias'}</span>
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-3 shrink-0">
        <h3 className="text-sm font-bold text-white">Registo de Hoje</h3>
        
        <div className="flex justify-between items-center py-2 border-b border-zinc-800">
          <span className="text-xs text-zinc-400">Água Consumida</span>
          <span className="text-xs font-bold text-blue-400">{(dados.aguaConsumida || 0) / 1000}L</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-zinc-400">Calorias Ingeridas</span>
          <span className="text-xs font-bold text-orange-400">{dados.caloriasConsumidas || 0} Kcal</span>
        </div>
      </div>

      {/* --- CALENDÁRIO DE HISTÓRICO --- */}
      <div className="shrink-0">
        <h3 className="text-lg font-bold text-white mb-3">Histórico Mensal</h3>
        <CalendarHistory />
      </div>

    </div>
  );
}