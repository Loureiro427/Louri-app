import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { weeklySummary } from "../utils/appFeatures";
import { localDayKey } from "../utils/dailyStreak";
import { Icon, SectionHeading } from "./ui/AppUI";
import { litersText, numberText } from "./ui/format";
import { DayHistoryDetail } from "./DayHistoryDetail";
export function WeeklySummary() {
  const dados = useUserStore((s) => s.dados);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const now = new Date();
  now.setDate(now.getDate() - offset * 7);
  const days = weeklySummary(dados, localDayKey(now));
  const water = days.reduce((sum, d) => sum + d.water, 0),
    meals = days.reduce((sum, d) => sum + d.meals, 0),
    recorded = days.filter((d) => d.water > 0 || d.meals > 0).length;
  const weights = Object.entries(dados.historicoPeso || {})
    .filter(([d]) => d >= days[0].date && d <= days[6].date)
    .sort(([a], [b]) => a.localeCompare(b));
  const period = (key: string) =>
    key.split("-").reverse().slice(0, 2).join("/");
  const selectedRecord =
    selected === dados.ultimaData
      ? {
          aguaConsumida: dados.aguaConsumida,
          caloriasConsumidas: dados.caloriasConsumidas,
          refeicoesDetalhadas:
            dados.historico?.[selected]?.refeicoesDetalhadas || {},
        }
      : selected
        ? dados.historico?.[selected]
        : undefined;
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
            <button
              key={d.date}
              type="button"
              aria-label={`${period(d.date)}: ${litersText(d.water)} litros de água, ${d.meals} refeições. Ver registros`}
              onClick={() => setSelected(d.date)}
            >
              <span
                title={`${period(d.date)}: ${litersText(d.water)} L`}
                style={{
                  height: `${Math.max(
                    2,
                    Math.min(
                      100,
                      (d.water / Math.max(1, ...days.map((x) => x.water))) *
                        100,
                    ),
                  )}%`,
                }}
              />
              <small>
                {new Date(`${d.date}T12:00:00`)
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .slice(0, 3)}
              </small>
            </button>
          ))}
        </div>
        <div className="app-week-stats">
          <div>
            <strong>{recorded}/7</strong>
            <span>Dias com registros</span>
          </div>
          <div>
            <strong>{meals}</strong>
            <span>Refeições</span>
          </div>
          <div>
            <strong>{litersText(recorded ? water / recorded : 0)} L</strong>
            <span>Água por dia registrado</span>
          </div>
        </div>
        <p className="app-helper">
          Toque em um dia acima para ver ou corrigir os registros. A média
          considera apenas dias com registros ({recorded} de 7). Um dia vazio
          não significa consumo zero. Calorias registradas:{" "}
          {numberText(days.reduce((sum, d) => sum + d.calories, 0))} kcal.
        </p>
        <p className="app-helper">
          {weights.length >= 2
            ? `Variação de peso nos registros do período: ${numberText(
                Number(weights.at(-1)![1]) - Number(weights[0][1]),
                1,
              )} kg.`
            : "Registre peso em dois dias do período para ver a variação."}
        </p>
        <p className="app-helper">
          {recorded
            ? "Cada registro ajuda a conhecer sua rotina. Se algum dia ficou em branco, você pode retomar quando quiser."
            : "Seu resumo começa com o primeiro registro. Não precisa preencher tudo de uma vez."}
        </p>
      </div>
      {selected && (
        <DayHistoryDetail
          key={selected}
          date={selected}
          record={selectedRecord}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
