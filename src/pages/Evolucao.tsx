import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import CalendarHistory from "../components/CalendarHistory";
import {
  Icon,
  PageHeader,
  SectionHeading,
  Sheet,
  litersText,
  numberText,
} from "../components/ui/AppUI";
export function Evolucao() {
  const dados = useUserStore((state) => state.dados);
  const [streakInfo, setStreakInfo] = useState(false);
  const streak = dados.streak || 0;
  const milestone =
    [7, 14, 30, 90].find((value) => value > streak) || streak + 10;
  const weights = Object.entries(dados.historicoPeso || {})
    .filter(
      ([date, value]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, value]) => ({ date, value: Number(value) }));
  const min = weights.length
    ? Math.min(...weights.map((item) => item.value))
    : 0;
  const max = weights.length
    ? Math.max(...weights.map((item) => item.value))
    : 0;
  const span = Math.max(1, max - min);
  const points = weights
    .map(
      (item, i) =>
        `${12 + (i / Math.max(1, weights.length - 1)) * 276},${
          94 - ((item.value - min) / span) * 70
        }`
    )
    .join(" ");
  const openWeight = () => useUserStore.getState().setModalPesoAberto(true);
  return (
    <div className="app-page custom-scrollbar">
      <PageHeader
        eyebrow="Seu acompanhamento"
        title="Evolução"
        action={
          <button
            className="app-icon-button"
            aria-label="Registrar peso"
            onClick={openWeight}
          >
            <Icon name="plus" size={21} />
          </button>
        }
      />
      <div className="app-stat-pair">
        <button className="app-card app-stat-card" onClick={openWeight}>
          <span>
            <Icon name="scale" size={18} /> Peso atual
          </span>
          <strong>
            {numberText(Number(dados.peso) || 70, 1)}
            <small> kg</small>
          </strong>
          <p>
            Atualizar peso <Icon name="chevron" size={13} />
          </p>
        </button>
        <button
          className="app-card app-stat-card app-streak-card"
          onClick={() => setStreakInfo(true)}
        >
          <span>
            <Icon name="flame" size={18} /> Sequência{" "}
            <Icon name="help" size={14} />
          </span>
          <strong>
            {streak}
            <small> {streak === 1 ? "dia" : "dias"}</small>
          </strong>
          <p>Dias de metas completas</p>
        </button>
      </div>
      <section>
        <SectionHeading title="Histórico de peso" />
        {weights.length > 1 ? (
          <div className="app-card app-weight-chart">
            <div className="app-weight-chart-summary">
              <span>Últimos {weights.length} registros</span>
              <strong>
                {numberText(weights.at(-1)!.value - weights[0].value, 1)}
                <small> kg no período</small>
              </strong>
            </div>
            <div className="app-chart-axis">
              <span>{numberText(max, 1)} kg</span>
              <span>{numberText(min, 1)} kg</span>
            </div>
            <svg
              viewBox="0 0 300 110"
              role="img"
              aria-label={`Peso entre ${numberText(min, 1)} e ${numberText(
                max,
                1
              )} quilos nos últimos ${weights.length} registros`}
            >
              <path d="M12 24H288M12 94H288" className="app-chart-grid" />
              <polyline points={points} className="app-chart-line" />
              {weights.map((item, i) => (
                <circle
                  key={item.date}
                  cx={12 + (i / Math.max(1, weights.length - 1)) * 276}
                  cy={94 - ((item.value - min) / span) * 70}
                  r="3"
                />
              ))}
            </svg>
            <div className="app-chart-dates">
              <span>
                {weights[0].date.split("-").reverse().slice(0, 2).join("/")}
              </span>
              <span>
                {weights
                  .at(-1)!
                  .date.split("-")
                  .reverse()
                  .slice(0, 2)
                  .join("/")}
              </span>
            </div>
          </div>
        ) : (
          <div className="app-card app-weight-empty">
            <span className="app-icon-tile">
              <Icon name="chart" size={23} />
            </span>
            <div>
              <h3>Cada registro conta</h3>
              <p>
                {weights.length
                  ? "Seu primeiro peso já está salvo. Com o próximo registro, você verá sua evolução."
                  : "Registre seu peso para começar a acompanhar sua evolução."}
              </p>
            </div>
            <button className="app-text-button" onClick={openWeight}>
              Registrar peso <Icon name="plus" size={15} />
            </button>
          </div>
        )}
      </section>
      <section>
        <SectionHeading title="Hoje" />
        <div className="app-card app-today-list">
          <div>
            <span>
              <Icon name="water" size={19} /> Água consumida
            </span>
            <strong className="app-text-blue">
              {litersText(dados.aguaConsumida || 0)} L
            </strong>
          </div>
          <div>
            <span>
              <Icon name="flame" size={19} /> Alimentação
            </span>
            <strong>{numberText(dados.caloriasConsumidas || 0)} kcal</strong>
          </div>
        </div>
      </section>
      <section>
        <SectionHeading title="Seu histórico" />
        <CalendarHistory />
      </section>
      {streakInfo && (
        <Sheet
          title="Sua sequência de dias"
          description="Um incentivo para acompanhar sua rotina."
          onClose={() => setStreakInfo(false)}
        >
          <div className="app-streak-detail">
            <Icon name="flame" size={28} />
            <strong>
              {streak}
              <small> {streak === 1 ? "dia" : "dias"}</small>
            </strong>
          </div>
          <p className="app-body-copy">
            Cada dia em que você atinge a meta de água e registra todas as
            refeições do plano soma um ponto à sua sequência.
          </p>
          <div className="app-streak-milestone">
            <span>Próximo marco</span>
            <strong>{milestone} dias</strong>
            <p>Faltam {milestone - streak} dias completos.</p>
          </div>
          <button
            className="app-button app-button--secondary app-wide-button"
            onClick={() => setStreakInfo(false)}
          >
            Entendi
          </button>
        </Sheet>
      )}
    </div>
  );
}
