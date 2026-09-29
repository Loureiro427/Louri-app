import { useState, useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';

// Tipagem para os dados de um dia
type DayRecord = {
  water: number;
  calories: number;
};

export default function CalendarHistory() {
  const dados = useUserStore((state: any) => state.dados);
  const temaEscuro = dados.temaEscuro ?? true;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Descobre qual é a data exata de hoje
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  // Cria o histórico dinâmico combinando o passado salvo + o dia de HOJE
  const historyData = useMemo(() => {
    const historicoCombinado: Record<string, DayRecord> = {};

    // 1. Carrega os dias passados (se já houver histórico salvo na store)
    if (dados.historico) {
      Object.entries(dados.historico).forEach(([data, valores]: any) => {
        historicoCombinado[data] = {
          water: (valores.aguaConsumida || 0) / 1000, // Converte ml para Litros
          calories: valores.caloriasConsumidas || 0,
        };
      });
    }

    // 2. Injeta SEMPRE o dia de hoje com os valores atuais da Home
    historicoCombinado[hojeStr] = {
      water: (dados.aguaConsumida || 0) / 1000,
      calories: dados.caloriasConsumidas || 0,
    };

    return historicoCombinado;
  }, [dados.historico, dados.aguaConsumida, dados.caloriasConsumidas, hojeStr]);

  // Lógica para desenhar a grelha do mês
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleDayClick = (day: number) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null); // Limpa a seleção ao mudar de mês
  };

  // Vai buscar os dados reais do dia selecionado
  const selectedData = selectedDate ? historyData[selectedDate] : null;
  const temRegistoNoDia = selectedData && (selectedData.water > 0 || selectedData.calories > 0);

  return (
    <div className={`flex flex-col gap-4 mt-4 transition-colors duration-300 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
      
      {/* Cartão do Calendário */}
      <div className={`border rounded-2xl p-4 transition-colors shadow-lg ${
        temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        
        {/* Cabeçalho do Calendário */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => changeMonth(-1)} 
            className={`p-2 rounded-xl transition ${temaEscuro ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
          >
            &#8592;
          </button>
          <h3 className={`font-bold text-lg ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={() => changeMonth(1)} 
            className={`p-2 rounded-xl transition ${temaEscuro ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
          >
            &#8594;
          </button>
        </div>

        {/* Dias da Semana */}
        <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase mb-2 ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        {/* Grelha de Dias */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {blanks.map((_, index) => (
            <div key={`blank-${index}`} className="p-2"></div>
          ))}
          
          {days.map((day) => {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = historyData[dateKey];
            
            const isToday = dateKey === hojeStr;
            const isSelected = selectedDate === dateKey;
            const hasData = dayData && (dayData.water > 0 || dayData.calories > 0);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative p-2 rounded-full w-9 h-9 flex items-center justify-center mx-auto text-sm transition-all duration-200 
                  ${isSelected ? 'bg-green-500 text-zinc-950 font-bold shadow-md shadow-green-500/30' : ''}
                  ${!isSelected && isToday ? (temaEscuro ? 'border border-green-500 text-green-500 font-bold bg-green-500/10' : 'border border-green-500 text-green-600 font-bold bg-green-50') : ''}
                  ${!isSelected && !isToday && hasData ? (temaEscuro ? 'text-green-400 font-bold bg-zinc-800' : 'text-green-600 font-bold bg-zinc-100') : ''}
                  ${!isSelected && !isToday && !hasData ? (temaEscuro ? 'text-zinc-500 hover:bg-zinc-800/50' : 'text-zinc-400 hover:bg-zinc-100') : ''}
                `}
              >
                {day}
                
                {/* Pontinho indicador se tiver registos mas não estiver selecionado nem for hoje */}
                {!isSelected && !isToday && hasData && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão do Registo do Dia Selecionado */}
      {selectedDate && (
        <div className={`border rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors shadow-lg ${
          temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h4 className={`font-bold text-sm ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
              Registo de {selectedDate.split('-').reverse().join('/')}
            </h4>
            {selectedDate === hojeStr && (
              <span className="text-[10px] bg-green-500/20 text-green-500 font-bold px-2 py-1 rounded-md">HOJE</span>
            )}
          </div>
          
          {temRegistoNoDia ? (
            <div className="flex flex-col gap-3 text-sm">
              <div className={`flex justify-between items-center border-b pb-2 ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
                <span className={`font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>💧 Água Consumida</span>
                <span className="font-bold text-blue-500 text-base">{selectedData.water.toFixed(2)}L</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className={`font-medium ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>🔥 Calorias Ingeridas</span>
                <span className="font-bold text-orange-500 text-base">{selectedData.calories} Kcal</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 opacity-50">
              <span className="text-3xl mb-2">📭</span>
              <p className={`text-xs font-medium text-center ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Nenhum registo encontrado para este dia.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}