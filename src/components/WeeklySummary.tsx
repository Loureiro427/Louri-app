import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { weeklySummary } from "../utils/appFeatures";
import { localDayKey } from "../utils/dailyStreak";
import { Icon, litersText, numberText, SectionHeading } from "./ui/AppUI";
export function WeeklySummary() {
  const dados = useUserStore((s) => s.dados);
  const [offset, setOffset] = useState(0);
  const now = new Date();
  now.setDate(now.getDate() - offset * 7);
  const days = weeklySummary(dados, localDayKey(now));
  const water = days.reduce((sum, d) => sum + d.water, 0),
    meals = days.reduce((sum, d) => sum + d.meals, 0),
    complete = days.filter((d) => d.complete).length;
  const weights = Object.entries(dados.historicoPeso || {})
    .filter(([d]) => d >= days[0].date && d <= days[6].date)
    .sort(([a], [b]) => a.localeCompare(b));
  const period = (key: string) =>
    key.split("-").reverse().slice(0, 2).join("/");
  return (
    <section>
      <SectionHeading title="Resumo semanal" />
      <div className="app-card app-weekly">
        <div className="app-calendar-header">
          <button
            className="app-icon-button"
            aria-label="Semana anterior"
            onClick={() => setOffset(offset + 1)}
          >
            <Icon name="back" size={17} />
          </button>
          <h3>
            {period(days[0].date)} — {period(days[6].date)}
          </h3>
          <button
            className="app-icon-button"
            aria-label="Semana seguinte"
            disabled={!offset}
            onClick={() => setOffset(offset - 1)}
          >
            <Icon name="back" size={17} />
          </button>
        </div>
        <div className="app-week-bars" aria-label="Hidratação diária da semana">
          {days.map((d) => (
            <div key={d.date}>
              <span
                title={`${period(d.date)}: ${litersText(d.water)} L`}
                style={{
                  height: `${Math.max(
                    2,
                    Math.min(
                      100,
                      (d.water / Math.max(1, ...days.map((x) => x.water))) * 100
                    )
                  )}%`,
                }}
              />
              <small>
                {new Date(`${d.date}T12:00:00`)
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .slice(0, 3)}
              </small>
            </div>
          ))}
        </div>
        <div className="app-week-stats">
          <div>
            <strong>{complete}/7</strong>
            <span>Dias completos</span>
          </div>
          <div>
            <strong>{meals}</strong>
            <span>Refeições</span>
          </div>
          <div>
            <strong>{litersText(water / 7)} L</strong>
            <span>Água/dia</span>
          </div>
        </div>
        <p className="app-helper">
          A média considera os sete dias, incluindo dias sem registro. Calorias
          registradas:{" "}
          {numberText(days.reduce((sum, d) => sum + d.calories, 0))} kcal.
        </p>
        <p className="app-helper">
          {weights.length >= 2
            ? `Variação de peso nos registros do período: ${numberText(
                Number(weights.at(-1)![1]) - Number(weights[0][1]),
                1
              )} kg.`
            : "Registre peso em dois dias do período para ver a variação."}
        </p>
        <p className="app-helper">
          Dias completos refletem os pontos salvos pela sequência diária.
        </p>
      </div>
    </section>
  );
}
