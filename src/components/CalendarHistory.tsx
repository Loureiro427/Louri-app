import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useUserStore } from '../store/useUserStore';

type RefeicaoDetalhe = {
  titulo: string;
  icone: string;
  calorias: number;
  alimentos: string[];
  macros: { proteina: number; carbo: number; gordura: number };
};

type DayRecord = {
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesDetalhadas: Record<string, RefeicaoDetalhe>;
};

export default function CalendarHistory() {
  const dados = useUserStore((state: any) => state.dados);
  const temaEscuro = dados.temaEscuro ?? true;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  // Combina o histórico salvo com os dados em tempo real do dia de hoje
  const historyData = useMemo(() => {
    const historicoCombinado: Record<string, DayRecord> = {};

    if (dados.historico) {
      Object.entries(dados.historico).forEach(([data, valores]: any) => {
        historicoCombinado[data] = {
          aguaConsumida: valores.aguaConsumida || 0,
          caloriasConsumidas: valores.caloriasConsumidas || 0,
          refeicoesDetalhadas: valores.refeicoesDetalhadas || {},
        };
      });
    }

    // Injeta/Atualiza SEMPRE o dia de hoje recolhendo diretamente do store as refeições detalhadas
    const refeicoesHojeDetalhadas: Record<string, RefeicaoDetalhe> = {};
    if (dados.refeicoesConcluidas && dados.caloriasPorRefeicao) {
      dados.refeicoesConcluidas.forEach((key: string) => {
        const tituloMap: Record<string, { titulo: string; icone: string }> = {
          cafeManha: { titulo: 'Café da Manhã', icone: '☕' },
          almoco: { titulo: 'Almoço', icone: '🍽️' },
          lancheTarde: { titulo: 'Lanche da Tarde', icone: '🍎' },
          cafeTarde: { titulo: 'Café da Tarde', icone: '🧋' },
          janta: { titulo: 'Jantar', icone: '🍲' },
          lancheNoite: { titulo: 'Lanche da Noite', icone: '🌙' },
        };
        const info = tituloMap[key] || { titulo: key, icone: '🍽️' };

        refeicoesHojeDetalhadas[key] = {
          titulo: info.titulo,
          icone: info.icone,
          calorias: dados.caloriasPorRefeicao[key] || 0,
          alimentos: dados.alimentos[key] || [],
          macros: dados.macrosPorRefeicao[key] || { proteina: 0, carbo: 0, gordura: 0 }
        };
      });
    }

    // Garante que o dia de hoje puxa o registo detalhado correto, mesmo se já estiver gravado no historico ou em tempo real
    const registoHistoricoHoje = historicoCombinado[hojeStr]?.refeicoesDetalhadas || {};
    const refeicoesFinais = Object.keys(refeicoesHojeDetalhadas).length > 0 ? refeicoesHojeDetalhadas : registoHistoricoHoje;

    historicoCombinado[hojeStr] = {
      aguaConsumida: dados.aguaConsumida || 0,
      caloriasConsumidas: dados.caloriasConsumidas || 0,
      refeicoesDetalhadas: refeicoesFinais,
    };

    return historicoCombinado;
  }, [dados.historico, dados.aguaConsumida, dados.caloriasConsumidas, dados.refeicoesConcluidas, dados.caloriasPorRefeicao, dados.alimentos, hojeStr]);

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
    setSelectedDate(null);
  };

  const selectedData = selectedDate ? historyData[selectedDate] : null;
  const temRegistoNoDia = selectedData && (selectedData.aguaConsumida > 0 || selectedData.caloriasConsumidas > 0 || Object.keys(selectedData.refeicoesDetalhadas || {}).length > 0);

  return (
    <div className={`flex flex-col gap-4 mt-4 transition-colors duration-300 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>
      
      {/* Calendário */}
      <div className={`border rounded-2xl p-4 transition-colors shadow-lg ${
        temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
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

        <div className={`grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase mb-2 ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {blanks.map((_, index) => (
            <div key={`blank-${index}`} className="p-2"></div>
          ))}
          
          {days.map((day) => {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = historyData[dateKey];
            
            const isToday = dateKey === hojeStr;
            const isSelected = selectedDate === dateKey;
            const hasData = dayData && (dayData.aguaConsumida > 0 || dayData.caloriasConsumidas > 0 || Object.keys(dayData.refeicoesDetalhadas || {}).length > 0);

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
                {!isSelected && !isToday && hasData && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL DETALHADO DO DIA SELECIONADO */}
      {selectedDate && createPortal(
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200 overscroll-none">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedDate(null)}></div>
          
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div className={`pointer-events-auto w-full max-w-sm max-h-[85vh] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl overflow-y-auto custom-scrollbar transition-colors ${
              temaEscuro ? 'bg-zinc-900 border border-zinc-800 text-white' : 'bg-white border border-zinc-200 text-zinc-900'
            }`}>
              
              <div className="flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-lg">
                    Registo de {selectedDate.split('-').reverse().join('/')}
                  </h4>
                  {selectedDate === hojeStr && (
                    <span className="text-[10px] bg-green-500/20 text-green-500 font-bold px-2 py-0.5 rounded-md">HOJE</span>
                  )}
                </div>
                <button onClick={() => setSelectedDate(null)} className={`text-2xl font-bold ${temaEscuro ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'}`}>×</button>
              </div>
              
              {temRegistoNoDia ? (
                <div className="flex flex-col gap-4">
                  {/* Resumo do Dia (Água e Calorias Totais) */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className={`p-3 rounded-2xl border flex flex-col gap-1 ${temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                      <span className={`text-[10px] uppercase font-semibold ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>💧 Água do Dia</span>
                      <span className="font-bold text-blue-500 text-base">{(selectedData.aguaConsumida / 1000).toFixed(2)}L</span>
                    </div>
                    <div className={`p-3 rounded-2xl border flex flex-col gap-1 ${temaEscuro ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                      <span className={`text-[10px] uppercase font-semibold ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>🔥 Calorias Totais</span>
                      <span className="font-bold text-orange-500 text-base">{selectedData.caloriasConsumidas} Kcal</span>
                    </div>
                  </div>

                  {/* Lista de Refeições Detalhadas */}
                  <div>
                    <p className={`text-xs uppercase font-semibold mb-2 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Refeições Registadas:</p>
                    
                    {Object.keys(selectedData.refeicoesDetalhadas || {}).length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {Object.entries(selectedData.refeicoesDetalhadas).map(([key, ref]: [string, any]) => (
                          <div key={key} className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                            temaEscuro ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{ref.icone}</span>
                                <span className="font-bold text-sm">{ref.titulo}</span>
                              </div>
                              <span className="text-xs font-bold text-orange-500">+{ref.calorias} kcal</span>
                            </div>

                            {/* Alimentos consumidos nesta refeição */}
                            {ref.alimentos && ref.alimentos.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ref.alimentos.map((alimentoNome: string, idx: number) => (
                                  <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md border ${
                                    temaEscuro ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-zinc-200 text-zinc-700'
                                  }`}>
                                    {alimentoNome}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={`text-xs italic text-center py-3 ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>Nenhuma refeição registada neste dia.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 opacity-60">
                  <span className="text-3xl mb-2">📭</span>
                  <p className={`text-xs font-medium text-center ${temaEscuro ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Nenhum registo encontrado para este dia.
                  </p>
                </div>
              )}

              <button 
                onClick={() => setSelectedDate(null)}
                className={`w-full py-3.5 rounded-xl font-bold transition-colors mt-2 ${
                  temaEscuro ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}