import { useMemo, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import type { RefeicaoDetalhe } from "../store/useUserStore";
import { CONFIG_REFEICOES } from "../utils/nutritionMath";
import { DICIONARIO_ALIMENTOS } from "../data/alimentos";
import { normalizeMealPreferences } from "../utils/mealPreferences";
import { Icon, Sheet, litersText, numberText } from "./ui/AppUI";
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
  const entries = Object.entries(record?.refeicoesDetalhadas || {});
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
        <Sheet
          title={`Registro de ${selected.split("-").reverse().join("/")}`}
          description={
            selected === today ? "Seu acompanhamento de hoje" : undefined
          }
          onClose={() => setSelected(null)}
        >
          {hasRecord(selected) ? (
            <>
              <div className="app-day-summary">
                <div className="app-tone-blue">
                  <Icon name="water" size={19} />
                  <strong>
                    {litersText(record?.aguaConsumida || 0)}
                    <small> L</small>
                  </strong>
                  <span>Água consumida</span>
                </div>
                <div className="app-tone-orange">
                  <Icon name="flame" size={19} />
                  <strong>
                    {numberText(record?.caloriasConsumidas || 0)}
                    <small> kcal</small>
                  </strong>
                  <span>Alimentação</span>
                </div>
              </div>
              <h3 className="app-sheet-section-title">Refeições registradas</h3>
              <div className="app-record-list">
                {entries.length ? (
                  entries.map(([key, ref]) => (
                    <div className="app-history-meal" key={key}>
                      <div>
                        <span aria-hidden="true">{ref.icone}</span>
                        <strong>{ref.titulo}</strong>
                        <b>{numberText(ref.calorias)} kcal</b>
                      </div>
                      <p>
                        {Array.isArray(ref.alimentos)
                          ? ref.alimentos.join(" · ")
                          : ""}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="app-empty">
                    Nenhuma refeição registrada neste dia.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="app-empty-state">
              <Icon name="clock" size={28} />
              <h3>Um dia sem registros</h3>
              <p>
                Quando houver registros de água ou alimentação, eles aparecerão
                aqui.
              </p>
            </div>
          )}
          <button
            className="app-button app-button--secondary app-wide-button"
            onClick={() => setSelected(null)}
          >
            Fechar
          </button>
        </Sheet>
      )}
    </div>
  );
}
