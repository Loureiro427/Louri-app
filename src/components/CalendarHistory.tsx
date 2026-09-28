import { useState } from 'react';
import { useUserStore } from '../store/useUserStore';

// Tipagem para os dados de um dia
type DayRecord = {
  water: number;
  calories: number;
};

// Dados simulados para testarmos o visual (Dias com atividade)
const mockHistory: Record<string, DayRecord> = {
  '2026-09-25': { water: 2.5, calories: 1800 },
  '2026-09-26': { water: 3.0, calories: 2100 },
  '2026-09-27': { water: 1.5, calories: 1500 },
};

export default function CalendarHistory() {
  const dados = useUserStore((state) => state.dados);
  const temaEscuro = dados.temaEscuro ?? true;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    // Formata o dia clicado para o padrão YYYY-MM-DD
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(formattedDate);
  };

  const changeMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
    setSelectedDate(null); // Limpa a seleção ao mudar de mês
  };

  // Vai buscar os dados do dia selecionado (se existirem)
  const selectedData = selectedDate ? mockHistory[selectedDate] : null;

  return (
    <div className={`flex flex-col gap-4 mt-4 transition-colors duration-300 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
      {/* Cartão do Calendário */}
      <div className={`border rounded-2xl p-4 transition-colors ${
        temaEscuro ? 'bg-[#111111] border-gray-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        
        {/* Cabeçalho do Calendário */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => changeMonth(-1)} 
            className={`p-2 transition ${temaEscuro ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            &#8592;
          </button>
          <h3 className={`font-bold text-lg ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
            {monthNames[month]} {year}
          </h3>
          <button 
            onClick={() => changeMonth(1)} 
            className={`p-2 transition ${temaEscuro ? 'text-gray-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            &#8594;
          </button>
        </div>

        {/* Dias da Semana */}
        <div className={`grid grid-cols-7 gap-1 text-center text-xs font-medium mb-2 ${temaEscuro ? 'text-gray-500' : 'text-zinc-400'}`}>
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        {/* Grelha de Dias */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {blanks.map((_, index) => (
            <div key={`blank-${index}`} className="p-2"></div>
          ))}
          
          {days.map((day) => {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasData = mockHistory[dateKey];
            const isSelected = selectedDate === dateKey;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`p-2 rounded-full w-8 h-8 flex items-center justify-center mx-auto text-sm transition-all duration-200
                  ${isSelected ? 'bg-green-500 text-black font-bold' : temaEscuro ? 'hover:bg-gray-800' : 'hover:bg-zinc-100'}
                  ${hasData && !isSelected ? 'text-green-400 font-bold border border-green-900' : ''}
                  ${!hasData && !isSelected ? (temaEscuro ? 'text-gray-300' : 'text-zinc-700') : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartão do Registo do Dia Selecionado */}
      {selectedDate && (
        <div className={`border rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300 transition-colors ${
          temaEscuro ? 'bg-[#111111] border-gray-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          <h4 className={`font-bold mb-3 text-sm ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
            Registo de {selectedDate.split('-').reverse().join('/')}
          </h4>
          
          {selectedData ? (
            <div className="flex flex-col gap-3 text-sm">
              <div className={`flex justify-between items-center border-b pb-2 ${temaEscuro ? 'border-gray-800' : 'border-zinc-100'}`}>
                <span className={temaEscuro ? 'text-gray-400' : 'text-zinc-500'}>Água Consumida</span>
                <span className="font-bold text-[#00a2ff]">{selectedData.water}L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={temaEscuro ? 'text-gray-400' : 'text-zinc-500'}>Calorias Ingeridas</span>
                <span className="font-bold text-[#ff8c00]">{selectedData.calories} Kcal</span>
              </div>
            </div>
          ) : (
            <p className={`text-sm text-center py-2 ${temaEscuro ? 'text-gray-500' : 'text-zinc-400'}`}>
              Nenhum registo encontrado para este dia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}