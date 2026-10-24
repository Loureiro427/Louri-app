import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { localDayKey } from "../utils/dailyStreak";
import { weightSeries } from "../utils/dailyExperience";
import {
  WEIGHT_MIN,
  WEIGHT_MAX,
  WEIGHT_ERROR,
} from "../utils/weightValidation";
import { Icon, Sheet } from "./ui/AppUI";
import { numberText } from "./ui/format";

const shortDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
export function WeightHistory() {
  const dados = useUserStore((s) => s.dados);
  const [period, setPeriod] = useState<number | null>(30);
  const [selected, setSelected] = useState("");
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(localDayKey(new Date()));
  const [weight, setWeight] = useState(dados.peso);
  const [message, setMessage] = useState("");
  const weights = weightSeries(dados.historicoPeso || {}, period);
  const focus = weights.find((w) => w.date === selected) || weights.at(-1);
  const min = Math.min(...weights.map((w) => w.value));
  const max = Math.max(...weights.map((w) => w.value));
  const span = Math.max(1, max - min);
  const firstTime = weights.length
    ? new Date(`${weights[0].date}T12:00:00`).getTime()
    : 0;
  const lastTime = weights.length
    ? new Date(`${weights.at(-1)!.date}T12:00:00`).getTime()
    : 0;
  const x = (day: string) =>
    weights.length === 1
      ? 150
      : 12 +
        ((new Date(`${day}T12:00:00`).getTime() - firstTime) /
          Math.max(1, lastTime - firstTime)) *
          276;
  const y = (value: number) =>
    max === min ? 59 : 94 - ((value - min) / span) * 70;
  const variation =
    weights.length > 1 ? weights.at(-1)!.value - weights[0].value : null;
  return (
    <>
      <div className="app-card app-weight-chart">
        <div className="app-period-control" aria-label="Período do peso">
          {[30, 90, null].map((p) => (
            <button
              key={String(p)}
              aria-pressed={period === p}
              className={period === p ? "is-active" : ""}
              onClick={() => {
                setPeriod(p);
                setSelected("");
              }}
            >
              {p ? `${p} dias` : "Tudo"}
            </button>
          ))}
        </div>
        {weights.length ? (
          <>
            <div className="app-weight-chart-summary">
              <span>
                {weights.length}{" "}
                {weights.length === 1 ? "registro" : "registros"} no período
              </span>
              <strong>
                {focus && numberText(focus.value, 1)}
                <small> kg</small>
              </strong>
            </div>
            <p className="app-helper">
              {focus && shortDate(focus.date)} ·{" "}
              {variation === null
                ? "Seu primeiro registro. O próximo ajuda a mostrar a trajetória."
                : `${variation > 0 ? "+" : ""}${numberText(
                    variation,
                    1
                  )} kg entre o primeiro e o último registro.`}
            </p>
            <svg
              viewBox="0 0 300 110"
              role="img"
              aria-label={`Histórico de peso: ${weights.length} registros. Valores disponíveis na lista abaixo.`}
            >
              <path d="M12 24H288M12 94H288" className="app-chart-grid" />
              <polyline
                points={weights
                  .map((w) => `${x(w.date)},${y(w.value)}`)
                  .join(" ")}
                className="app-chart-line"
              />
              {weights.map((w) => (
                <circle
                  key={w.date}
                  cx={x(w.date)}
                  cy={y(w.value)}
                  r={w.date === focus?.date ? 5 : 3}
                >
                  <title>
                    {shortDate(w.date)}: {numberText(w.value, 1)} kg
                  </title>
                </circle>
              ))}
            </svg>
            <div className="app-chart-dates">
              <span>{shortDate(weights[0].date)}</span>
              <span>{shortDate(weights.at(-1)!.date)}</span>
            </div>
            <label className="app-weight-select">
              Ver um registro
              <select
                aria-label="Escolher registro de peso"
                value={focus?.date || ""}
                onChange={(e) => setSelected(e.target.value)}
              >
                {weights
                  .slice()
                  .reverse()
                  .map((w) => (
                    <option key={w.date} value={w.date}>
                      {new Date(`${w.date}T12:00:00`).toLocaleDateString(
                        "pt-BR"
                      )}{" "}
                      · {numberText(w.value, 1)} kg
                    </option>
                  ))}
              </select>
            </label>
          </>
        ) : (
          <div className="app-empty-state">
            <Icon name="chart" size={27} />
            <h3>Seu ritmo aparece com o tempo</h3>
            <p>
              Ainda não há pesos neste período. Registre um peso ou escolha
              “Tudo” para ver os anteriores.
            </p>
          </div>
        )}
        <p className="app-helper">
          Um número isolado não conta toda a história. Observe sua trajetória ao
          longo do tempo.
        </p>
        <button
          className="app-text-button"
          onClick={() => {
            setDate(focus?.date || localDayKey(new Date()));
            setWeight(focus ? String(focus.value) : dados.peso);
            setMessage("");
            setEditing(true);
          }}
        >
          <Icon name="edit" size={15} />
          {focus ? "Adicionar ou corrigir peso" : "Registrar peso"}
        </button>
      </div>
      {editing && (
        <Sheet
          title="Seu registro de peso"
          description="Escolha a data e informe o peso daquele dia."
          onClose={() => setEditing(false)}
        >
          <form
            className="app-feature-form"
            onSubmit={(e) => {
              e.preventDefault();
              const saved = useUserStore
                .getState()
                .salvarPesoNaData(date, weight);
              setMessage(
                saved
                  ? "Peso salvo. Seu gráfico já foi atualizado."
                  : `Confira a data. ${WEIGHT_ERROR}`
              );
            }}
          >
            <label>
              Data
              <input
                type="date"
                required
                max={localDayKey(new Date())}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  const existing = dados.historicoPeso?.[e.target.value];
                  if (existing) setWeight(existing);
                  setMessage("");
                }}
              />
            </label>
            <label>
              Peso em kg
              <input
                type="number"
                inputMode="decimal"
                required
                min={WEIGHT_MIN}
                max={WEIGHT_MAX}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </label>
            {dados.historicoPeso?.[date] && (
              <p className="app-helper">
                Já existe um peso nesta data. Salvar atualiza esse registro.
              </p>
            )}
            <button className="app-button app-button--primary" type="submit">
              Salvar peso
            </button>
            {message && (
              <p className="app-inline-notice" role="status">
                {message}
              </p>
            )}
            <button
              className="app-button app-button--secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Concluir
            </button>
          </form>
        </Sheet>
      )}
    </>
  );
}
