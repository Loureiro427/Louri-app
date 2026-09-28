import { useUserStore } from '../store/useUserStore';
import CalendarHistory from '../components/CalendarHistory';

export function Evolucao() {
  const dados = useUserStore((state) => state.dados);
  const temaEscuro = dados.temaEscuro ?? true;
  const pesoNum = Number(dados.peso) || 70;
  const streakAtual = dados.streak || 0;

  return (
    <div className={`flex flex-col px-6 py-8 gap-6 pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh] transition-colors duration-300 ${
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
        <div className={`border rounded-3xl p-4 flex flex-col justify-between gap-2 shadow-lg transition-colors ${
          temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <span className={`text-xs font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Sequência (Streak)</span>
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

    </div>
  );
}