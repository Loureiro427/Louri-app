import { useState } from 'react';

// Tipagem para os dados de um dia (depois vamos ligar isto ao Zustand)
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
    <div className="flex flex-col gap-4 mt-4 text-white">
      {/* Cartão do Calendário */}
      <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4">
        
        {/* Cabeçalho do Calendário */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 text-gray-400 hover:text-white transition">
            &#8592;
          </button>
          <h3 className="font-bold text-lg">
            {monthNames[month]} {year}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-2 text-gray-400 hover:text-white transition">
            &#8594;
          </button>
        </div>

        {/* Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 font-medium mb-2">
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
                  ${isSelected ? 'bg-green-500 text-black font-bold' : 'hover:bg-gray-800'}
                  ${hasData && !isSelected ? 'text-green-400 font-bold border border-green-900' : ''}
                  ${!hasData && !isSelected ? 'text-gray-300' : ''}
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
        <div className="bg-[#111111] border border-gray-800 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="font-bold mb-3 text-sm">
            Registo de {selectedDate.split('-').reverse().join('/')}
          </h4>
          
          {selectedData ? (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-400">Água Consumida</span>
                <span className="font-bold text-[#00a2ff]">{selectedData.water}L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Calorias Ingeridas</span>
                <span className="font-bold text-[#ff8c00]">{selectedData.calories} Kcal</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              Nenhum registo encontrado para este dia.
            </p>
          )}
        </div>
      )}
    </div>
  );
}