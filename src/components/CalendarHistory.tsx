import { useMemo, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import type { RefeicaoDetalhe } from "../store/useUserStore";
import { CONFIG_REFEICOES } from "../utils/nutritionMath";
import { DICIONARIO_ALIMENTOS } from "../data/alimentos";
import { normalizeMealPreferences } from "../utils/mealPreferences";
import { Icon } from "./ui/AppUI";
import { DayHistoryDetail } from "./DayHistoryDetail";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
export default function CalendarHistory() {
  const dados = useUserStore((state) => state.dados);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selected, setSelected] = useState<string | null>(null);
  const today = dateKey(new Date());
  const history = useMemo(() => {
    const preferences = normalizeMealPreferences(dados.alimentos);
    const details: Record<string, RefeicaoDetalhe> = {};
    for (const key of dados.refeicoesConcluidas || []) {
      const saved = dados.historico?.[today]?.refeicoesDetalhadas?.[key];
      const info = CONFIG_REFEICOES[key] || {
        titulo: "Refeição Livre",
        icone: "🍔",
      };
      details[key] = saved || {
        ...info,
        calorias: dados.caloriasPorRefeicao?.[key] || 0,
        alimentos: (preferences[key] || []).map(
          (id) =>
            DICIONARIO_ALIMENTOS[key]?.find((food) => food.id === id)?.nome ||
            id
        ),
        macros: dados.macrosPorRefeicao?.[key] || {
          proteina: 0,
          carbo: 0,
          gordura: 0,
        },
      };
    }
    return {
      ...dados.historico,
      [today]: {
        aguaConsumida: dados.aguaConsumida || 0,
        caloriasConsumidas: dados.caloriasConsumidas || 0,
        refeicoesDetalhadas: details,
      },
    };
  }, [dados, today]);
  const year = month.getFullYear(),
    monthIndex = month.getMonth();
  const days = Array.from(
    { length: new Date(year, monthIndex + 1, 0).getDate() },
    (_, i) => i + 1
  );
  const hasRecord = (key: string) => {
    const record = history[key];
    return Boolean(
      record &&
        (record.aguaConsumida > 0 ||
          record.caloriasConsumidas > 0 ||
          Object.keys(record.refeicoesDetalhadas || {}).length)
    );
  };
  const record = selected ? history[selected] : undefined;
  return (
    <div className="app-card app-calendar">
      <div className="app-calendar-header">
        <button
          className="app-icon-button"
          aria-label="Mês anterior"
          onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}
        >
          <Icon name="back" size={18} />
        </button>
        <h3>
          {month.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          className="app-icon-button"
          aria-label="Próximo mês"
          onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}
        >
          <Icon name="back" size={18} />
        </button>
      </div>
      <div className="app-calendar-week" aria-hidden="true">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="app-calendar-grid">
        {Array.from({ length: month.getDay() }, (_, i) => (
          <span key={`blank${i}`} />
        ))}
        {days.map((day) => {
          const key = `${year}-${String(monthIndex + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const recorded = hasRecord(key);
          return (
            <button
              key={key}
              className={`${key === today ? "is-today" : ""} ${
                recorded ? "has-record" : ""
              }`}
              aria-current={key === today ? "date" : undefined}
              aria-label={`${day} de ${month.toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}${recorded ? ", com registros" : ""}`}
              onClick={() => setSelected(key)}
            >
              {day}
              {recorded && <i />}
            </button>
          );
        })}
      </div>
      <div className="app-calendar-legend">
        <span>
          <i /> Dia com registro
        </span>
        <span>Toque para ver</span>
      </div>
      {selected && (
        <DayHistoryDetail
          key={selected}
          date={selected}
          record={record}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
