import { ContextTip } from "../components/AppGuide";
import { WeightHistory } from "../components/WeightHistory";
import { WeeklySummary } from "../components/WeeklySummary";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import CalendarHistory from "../components/CalendarHistory";
import { dailyGoals, localDayKey, previousDay } from "../utils/dailyStreak";
import {
  Icon,
  PageHeader,
  SectionHeading,
  Sheet,
} from "../components/ui/AppUI";
import { litersText, numberText } from "../components/ui/format";
export function Evolucao() {
  const dados = useUserStore((state) => state.dados);
  const [streakInfo, setStreakInfo] = useState(false);
  const streak = dados.streak || 0;
  const goals = dailyGoals(dados);
  const today = localDayKey(new Date());
  const week = [today];
  for (let i = 1; i < 7; i++) week.unshift(previousDay(week[0]));
  const milestone =
    [7, 14, 30, 90].find((value) => value > streak) || streak + 10;
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
      <ContextTip id="history-edit">
        Esqueceu ou registrou algo errado? Toque em um dia do calendário para
        ver e corrigir os registros. Você não precisa apagar tudo.
      </ContextTip>
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
      <section
        className="app-card app-daily-goals"
        aria-label="Progresso da sequência diária"
      >
        <div className="app-section-heading">
          <h2>
            {goals.complete
              ? "Dia completo!"
              : streak > 0
                ? "Mais um dia no seu ritmo"
                : "Um cuidado de cada vez"}
          </h2>
          <Icon name={goals.complete ? "check" : "flame"} size={20} />
        </div>
        <p>
          {goals.complete
            ? "Mais um dia de cuidado registrado."
            : streak > 0
              ? "Seu progresso de hoje fica aqui. Continue quando fizer sentido."
              : "Água e refeições ajudam a acompanhar sua rotina. Cada registro conta."}
        </p>
        <div className="app-streak-week" aria-label="Últimos sete dias">
          {week.map((key) => {
            const completed = Boolean(dados.diasMetasConcluidas?.[key]);
            const date = new Date(`${key}T12:00:00`);
            return (
              <div
                key={key}
                className={`${completed ? "is-complete" : ""} ${
                  key === today ? "is-today" : ""
                }`}
                aria-label={`${date.toLocaleDateString("pt-BR")}: ${
                  completed
                    ? "metas completas"
                    : key === today
                      ? "em andamento"
                      : "sem dia completo"
                }`}
              >
                <span>
                  {date
                    .toLocaleDateString("pt-BR", { weekday: "short" })
                    .replace(".", "")}
                </span>
                <i>
                  {completed ? <Icon name="check" size={15} /> : date.getDate()}
                </i>
              </div>
            );
          })}
        </div>
        <div className="app-daily-goal-row">
          <Icon name={goals.waterDone ? "check" : "water"} size={18} />
          <span>Meta de água</span>
          <strong>
            {litersText(dados.aguaConsumida || 0)} /{" "}
            {litersText(goals.waterGoal)} L
          </strong>
        </div>
        <div className="app-daily-goal-row">
          <Icon
            name={
              goals.active > 0 && goals.completed === goals.active
                ? "check"
                : "plan"
            }
            size={18}
          />
          <span>Refeições do plano</span>
          <strong>
            {goals.completed} de {goals.active}
          </strong>
        </div>
      </section>
      <WeeklySummary />
      <section>
        <SectionHeading title="Histórico de peso" />
        <WeightHistory />
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
          <p className="app-body-copy">
            Cada dia conta uma vez, até a meia-noite no seu aparelho. Sua
            sequência continua durante o dia seguinte; se passar um dia inteiro
            sem completar as metas, ela reinicia. Refeições livres não
            substituem as do plano. Se você desfizer um registro de hoje, o
            ponto é recalculado.
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
