import { mealCatalog } from "../utils/appFeatures";
import { dailyGoals } from "../utils/dailyStreak";
import { nextDailyAction } from "../utils/dailyExperience";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { WelcomeScreen } from "../components/WelcomeScreen";
import { MealComposer } from "../components/MealComposer";
import { calcularPorcoes } from "../data/alimentos";
import {
  CONFIG_REFEICOES,
  getCronograma,
  getRotina,
} from "../utils/nutritionMath";
import { normalizeMealPreferences } from "../utils/mealPreferences";
import { getPlanTargets } from "../utils/planTargets";
import {
  Icon,
  PageHeader,
  Progress,
  SectionHeading,
  Sheet,
  litersText,
  numberText,
} from "../components/ui/AppUI";

type Meal = ReturnType<typeof getCronograma>[number];
export function Home() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const [time, setTime] = useState(() => new Date());
  const [summary, setSummary] = useState(false);
  const [meal, setMeal] = useState<Meal | null>(null);
  const [editing, setEditing] = useState(false);
  const [waterHistory, setWaterHistory] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [reset, setReset] = useState<"water" | "food" | null>(null);
  const [feedback, setFeedback] = useState<{
    text: string;
    undo?: () => void;
  } | null>(null);
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 7000);
    return () => clearTimeout(timer);
  }, [feedback]);
  const addWater = (ml: number) => {
    useUserStore.getState().adicionarAgua(ml, 99999);
    const last = useUserStore.getState().dados.registrosAgua?.at(-1);
    setFeedback({
      text: `${ml} ml de água registrados.`,
      undo: () => {
        if (
          last &&
          useUserStore.getState().dados.registrosAgua?.at(-1) === last
        )
          useUserStore.getState().desfazerUltimaAgua();
      },
    });
  };
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const open = (event: Event) => {
      const target = (event as CustomEvent<{ meal?: string; water?: boolean }>)
        .detail;
      const current = useUserStore.getState().dados;
      if (!current.nome) return;
      if (target.meal) {
        const ref = getCronograma(current).find((r) => r.key === target.meal);
        if (ref) {
          if (current.refeicoesConcluidas.includes(ref.key)) setDetail(ref.key);
          else {
            setEditing(false);
            setMeal(ref);
          }
        }
      } else if (target.water) setWaterHistory(true);
    };
    window.addEventListener("louri-reminder-open", open);
    return () => window.removeEventListener("louri-reminder-open", open);
  }, []);
  if (!dados.nome) return <WelcomeScreen dark={dados.temaEscuro ?? true} />;
  const targets = getPlanTargets(dados);
  const schedule = getCronograma(dados);
  const preferences = normalizeMealPreferences(dados.alimentos);
  const done = dados.refeicoesConcluidas || [];
  const plannedDone = schedule.filter((ref) => done.includes(ref.key)).length;
  const { acordaMin, dormeMin } = getRotina(dados);
  const clock = time.getHours() * 60 + time.getMinutes();
  const routineClock =
    dormeMin >= 1440 && clock < acordaMin ? clock + 1440 : clock;
  const today = dados.historico?.[dados.ultimaData]?.refeicoesDetalhadas || {};
  const entries = Object.entries(today);
  const selectedDetail = detail ? today[detail] : undefined;
  const water = dados.aguaConsumida || 0;
  const calories = dados.caloriasConsumidas || 0;
  const date = time
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
    .replace(/\./g, "");
  const confirmMeal = (porcoes: Record<string, number>) => {
    if (!meal) return;
    useUserStore.getState().verificarViradaDeDia();
    if (
      editing &&
      !useUserStore.getState().dados.refeicoesConcluidas.includes(meal.key)
    ) {
      setMeal(null);
      setEditing(false);
      setFeedback({
        text: "O dia virou. Você pode corrigir essa refeição pelo histórico na Evolução.",
      });
      return;
    }
    const mealKey = meal.key;
    const before = useUserStore.getState().dados;
    const recordDate = before.ultimaData;
    const previous =
      before.historico?.[recordDate]?.refeicoesDetalhadas?.[mealKey];
    const foods = mealCatalog(dados, meal.key, Object.keys(porcoes));
    const total = calcularPorcoes(porcoes, foods);
    useUserStore.getState().registrarRefeicao(
      meal.key,
      meal.titulo,
      meal.icone,
      total.calorias,
      Object.keys(porcoes).map(
        (id) => foods.find((food) => food.id === id)?.nome || id
      ),
      total.macros,
      porcoes,
      editing
    );
    setEditing(false);
    setMeal(null);
    const saved =
      useUserStore.getState().dados.historico?.[recordDate]
        ?.refeicoesDetalhadas?.[mealKey];
    setFeedback({
      text: editing
        ? "Refeição atualizada. Seu dia continua organizado."
        : "Refeição registrada. Um cuidado a menos para lembrar.",
      undo: () => {
        const state = useUserStore.getState();
        if (
          state.dados.ultimaData !== recordDate ||
          state.dados.historico?.[recordDate]?.refeicoesDetalhadas?.[
            mealKey
          ] !== saved
        )
          return;
        if (previous)
          state.registrarRefeicao(
            mealKey,
            previous.titulo,
            previous.icone,
            previous.calorias,
            previous.alimentos,
            previous.macros,
            previous.porcoes,
            true
          );
        else state.desfazerRefeicao(mealKey);
      },
    });
  };
  const { meal: next, upcoming, earlier } = nextDailyAction(dados, time);
  const goals = dailyGoals(dados);
  return (
    <div className="app-page custom-scrollbar">
      <PageHeader
        eyebrow={date}
        title={`Olá, ${dados.nome.trim().split(" ")[0]}`}
        action={
          <button
            className="app-avatar-button"
            aria-label="Abrir perfil"
            onClick={() => navigate("/perfil")}
          >
            {dados.nome.trim().charAt(0).toUpperCase()}
          </button>
        }
      />
      <button
        className="app-card app-energy-card"
        onClick={() => setSummary(true)}
        aria-label="Ver resumo da alimentação de hoje"
      >
        <div className="app-card-topline">
          <span>
            <Icon name="flame" size={18} /> Alimentação de hoje
          </span>
          <Icon name="chevron" size={16} />
        </div>
        <div className="app-energy-number">
          <strong>{numberText(calories)}</strong>
          <span>de {numberText(targets.calories)} kcal</span>
        </div>
        <Progress
          value={calories}
          max={targets.calories}
          label="Calorias consumidas"
          tone="orange"
        />
        <div className="app-card-footline">
          <span>{targets.objective}</span>
          <strong>
            {calories < targets.calories
              ? `${numberText(targets.calories - calories)} kcal restantes`
              : "Total registrado hoje"}
          </strong>
        </div>
      </button>
      <button
        className="app-card app-next-action"
        onClick={() => {
          if (next) {
            setEditing(false);
            setMeal(next);
          } else if (!goals.waterDone) setWaterHistory(true);
          else setSummary(true);
        }}
      >
        <Icon name={goals.complete ? "check" : "clock"} size={20} />
        <span>
          <small>
            {goals.complete
              ? "Tudo certo por hoje"
              : next
              ? upcoming
                ? "Mais tarde, no seu ritmo"
                : "Já fez esta refeição?"
              : !goals.waterDone
              ? "Uma pausa para se cuidar"
              : "Seu acompanhamento"}
          </small>
          <strong>
            {next
              ? next.titulo + " · " + next.horario
              : goals.complete
              ? "Dia completo!"
              : "Registrar um copo de água"}
          </strong>
        </span>
        <Icon name="chevron" size={16} />
      </button>
      {earlier && (
        <p className="app-helper">
          Ficou algum registro para trás? Você pode voltar às refeições abaixo
          quando quiser.
        </p>
      )}
      <section className="app-card app-water-card">
        <div className="app-water-heading">
          <span className="app-icon-tile app-tone-blue">
            <Icon name="water" size={23} />
          </span>
          <div>
            <h2>Hidratação</h2>
            <p>
              {water >= targets.water
                ? "Meta do dia atingida"
                : "Cada copo conta"}
            </p>
          </div>
          <div className="app-water-amount">
            <strong>
              {litersText(water)} <small>L</small>
            </strong>
            <span>de {litersText(targets.water)} L</span>
          </div>
        </div>
        <Progress
          value={water}
          max={targets.water}
          label="Água consumida"
          tone={water >= targets.water ? "green" : "blue"}
        />
        <div className="app-water-actions">
          {[200, 300, 500].map((ml) => (
            <button
              key={ml}
              aria-label={`Adicionar ${ml} ml de água`}
              onClick={() => addWater(ml)}
            >
              <Icon name="plus" size={14} />
              {ml}
              <small>ml</small>
            </button>
          ))}
          <button
            className="app-water-reset"
            aria-label="Histórico de água"
            onClick={() => setWaterHistory(true)}
          >
            <Icon name="reset" size={17} />
          </button>
        </div>
      </section>
      <button
        className="app-card app-day-reflection"
        onClick={() => setSummary(true)}
      >
        <span className="app-icon-tile">
          <Icon name="sun" size={21} />
        </span>
        <span>
          <strong>Seu dia, até aqui</strong>
          <small>
            {entries.length
              ? `${entries.length} ${
                  entries.length === 1
                    ? "refeição registrada"
                    : "refeições registradas"
                } · ${litersText(water)} L de água`
              : water > 0
              ? `${litersText(
                  water
                )} L de água registrados. Cada cuidado conta.`
              : "Comece por um copo ou pela sua primeira refeição."}
          </small>
        </span>
        <Icon name="chevron" size={16} />
      </button>
      <section className="app-meal-section">
        <SectionHeading
          title="Refeições do dia"
          action={
            <span className="app-count-label">
              {plannedDone} de {schedule.length}
            </span>
          }
        />
        <div className="app-meal-timeline">
          {schedule.map((ref) => {
            const isDone = done.includes(ref.key);
            const future = routineClock < ref.minutos - 60 && !isDone;
            const current =
              !future && !isDone && routineClock <= ref.minutos + 120;
            const foods = (
              Array.isArray(dados.alimentos?.[ref.key])
                ? dados.alimentos[ref.key]
                : preferences[ref.key] || []
            )
              .map((id) =>
                mealCatalog(dados, ref.key).find((food) => food.id === id)
              )
              .filter((food) => Boolean(food));
            return (
              <div
                key={ref.key}
                className={`app-meal-row ${isDone ? "is-done" : ""} ${
                  current ? "is-current" : ""
                }`}
              >
                <div className="app-meal-time">
                  <time>{ref.horario}</time>
                  <span>
                    {isDone ? <Icon name="check" size={12} /> : <i />}
                  </span>
                </div>
                <button
                  className="app-meal-card"
                  disabled={false}
                  onClick={() => (isDone ? setDetail(ref.key) : setMeal(ref))}
                  aria-label={
                    isDone
                      ? `Ver registro de ${ref.titulo}`
                      : `Registrar ${ref.titulo}`
                  }
                >
                  <div className="app-meal-card-heading">
                    <span className="app-meal-emoji" aria-hidden="true">
                      {ref.icone}
                    </span>
                    <h3>{ref.titulo}</h3>
                    <span
                      className={`app-meal-status ${isDone ? "is-done" : ""}`}
                    >
                      {isDone
                        ? "Concluída"
                        : future
                        ? "Mais tarde"
                        : "Registrar"}
                      {!isDone && !future && <Icon name="plus" size={12} />}
                    </span>
                  </div>
                  <p>
                    {isDone
                      ? `${numberText(
                          dados.caloriasPorRefeicao[ref.key] || 0
                        )} kcal registradas`
                      : foods.length
                      ? foods.map((food) => food!.nome).join(" · ")
                      : "Escolha os alimentos na hora de registrar"}
                  </p>
                </button>
              </div>
            );
          })}
        </div>
        <button
          className="app-inline-add"
          onClick={() => navigate("/refeicao-livre")}
        >
          <Icon name="plus" size={17} />
          <span>Adicionar refeição livre</span>
          <Icon name="chevron" size={15} />
        </button>
      </section>
      {waterHistory && (
        <Sheet
          title="Água de hoje"
          description="Desfaça o último copo sem perder os demais registros."
          onClose={() => setWaterHistory(false)}
        >
          <div className="app-sheet-total">
            <strong>{litersText(water)}</strong>
            <span>litros registrados</span>
          </div>
          <div className="app-water-actions">
            {[200, 300, 500].map((ml) => (
              <button key={ml} onClick={() => addWater(ml)}>
                +{ml} ml
              </button>
            ))}
          </div>
          {(dados.registrosAgua || [])
            .slice()
            .reverse()
            .map((r, i) => (
              <div className="app-daily-goal-row" key={i}>
                <span>{r.hora}</span>
                <strong>+{r.quantidade} ml</strong>
              </div>
            ))}
          {!dados.registrosAgua?.length && (
            <p className="app-empty">
              Não há copos individuais para desfazer. Valores de versões
              anteriores continuam no total.
            </p>
          )}
          <button
            className="app-button app-button--secondary app-wide-button"
            disabled={!dados.registrosAgua?.length}
            onClick={() => useUserStore.getState().desfazerUltimaAgua()}
          >
            Desfazer último copo
          </button>
          <button
            className="app-button app-button--danger app-wide-button"
            onClick={() => {
              setWaterHistory(false);
              setReset("water");
            }}
          >
            Zerar água de hoje
          </button>
        </Sheet>
      )}
      {summary && (
        <Sheet
          title="Alimentação de hoje"
          description={`${entries.length} ${
            entries.length === 1
              ? "refeição registrada"
              : "refeições registradas"
          }`}
          onClose={() => setSummary(false)}
        >
          <div className="app-sheet-total">
            <strong>{numberText(calories)}</strong>
            <span>de {numberText(targets.calories)} kcal</span>
          </div>
          <p className="app-body-copy">
            {entries.length || water > 0
              ? `Você registrou ${entries.length} ${
                  entries.length === 1 ? "refeição" : "refeições"
                } e ${litersText(
                  water
                )} L de água hoje. O que ficou sem registrar pode ser ajustado com calma.`
              : "Seu dia ainda está começando por aqui. Registre o que fizer sentido na sua rotina; não precisa preencher tudo de uma vez."}
          </p>
          <Progress
            value={calories}
            max={targets.calories}
            label="Total de calorias"
            tone="orange"
          />
          <div className="app-record-list">
            {entries.length ? (
              entries.map(([key, ref]) => (
                <button
                  key={key}
                  className="app-record-row"
                  onClick={() => {
                    setSummary(false);
                    setDetail(key);
                  }}
                >
                  <span aria-hidden="true">{ref.icone}</span>
                  <span>
                    <strong>{ref.titulo}</strong>
                    <small>
                      {Array.isArray(ref.alimentos)
                        ? ref.alimentos.join(" · ")
                        : ""}
                    </small>
                  </span>
                  <b>
                    {numberText(ref.calorias)}
                    <small> kcal</small>
                  </b>
                  <Icon name="chevron" size={15} />
                </button>
              ))
            ) : (
              <p className="app-empty">
                Suas refeições vão aparecer aqui depois do primeiro registro.
              </p>
            )}
          </div>
          {entries.length > 0 && (
            <button
              className="app-button app-button--danger"
              onClick={() => {
                setSummary(false);
                setReset("food");
              }}
            >
              Zerar registros de alimentação
            </button>
          )}
        </Sheet>
      )}
      {detail && (
        <Sheet
          title={
            selectedDetail?.titulo ||
            CONFIG_REFEICOES[detail]?.titulo ||
            "Refeição"
          }
          description="Registro de hoje"
          onClose={() => setDetail(null)}
        >
          <div className="app-sheet-total">
            <strong>
              {numberText(
                selectedDetail?.calorias ||
                  dados.caloriasPorRefeicao[detail] ||
                  0
              )}
            </strong>
            <span>kcal registradas</span>
          </div>
          <div className="app-food-tags">
            {(selectedDetail?.alimentos || []).map((name, i) => (
              <span key={`${name}-${i}`}>{name}</span>
            ))}
          </div>
          <p className="app-helper">
            Edite os alimentos e as quantidades para corrigir este registro.
          </p>
          <button
            className="app-button app-button--primary app-wide-button"
            onClick={() => {
              const key = detail;
              const info = CONFIG_REFEICOES[key] || {
                titulo: selectedDetail?.titulo || "Refeição livre",
                icone: selectedDetail?.icone || "🍔",
              };
              setEditing(true);
              setMeal({ key, ...info, horario: "", minutos: 0 });
              setDetail(null);
            }}
          >
            Editar refeição
          </button>
          <button
            className="app-button app-button--danger"
            onClick={() => {
              useUserStore.getState().desfazerRefeicao(detail);
              setDetail(null);
            }}
          >
            Remover este registro
          </button>
        </Sheet>
      )}
      {reset && (
        <Sheet
          title={
            reset === "water"
              ? "Zerar a água de hoje?"
              : "Zerar a alimentação de hoje?"
          }
          description={
            reset === "water"
              ? "O consumo de água de hoje voltará para zero."
              : "As refeições e calorias registradas hoje serão removidas."
          }
          onClose={() => setReset(null)}
        >
          <div className="app-button-row">
            <button
              className="app-button app-button--secondary"
              onClick={() => setReset(null)}
            >
              Cancelar
            </button>
            <button
              className="app-button app-button--danger"
              onClick={() => {
                if (reset === "water") useUserStore.getState().zerarAgua();
                else useUserStore.getState().zerarDieta();
                setReset(null);
              }}
            >
              Zerar registros
            </button>
          </div>
        </Sheet>
      )}
      {meal &&
        createPortal(
          <div
            className={`app-themed app-meal-overlay ${
              dados.temaEscuro ?? true ? "" : "app-light"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={meal.titulo}
          >
            <button
              className="app-modal-scrim"
              aria-label="Fechar janela de refeição"
              onClick={() => setMeal(null)}
            />
            <div className="app-composer-sheet">
              <MealComposer
                alimentos={mealCatalog(
                  dados,
                  meal.key,
                  editing ? Object.keys(today[meal.key]?.porcoes || {}) : []
                )}
                initialPorcoes={
                  editing
                    ? today[meal.key]?.porcoes || {}
                    : dados.porcoesPlano?.[meal.key] || {}
                }
                confirmLabel={
                  editing ? "Salvar alterações" : "Registrar refeição"
                }
                memoriaKey={meal.key}
                titulo={meal.titulo}
                onClose={() => {
                  setMeal(null);
                  setEditing(false);
                }}
                onConfirm={confirmMeal}
              />
            </div>
          </div>,
          document.body
        )}
      {feedback && (
        <div className="app-feedback" role="status">
          <Icon name="check" size={17} />
          <span>{feedback.text}</span>
          {feedback.undo && (
            <button
              onClick={() => {
                feedback.undo?.();
                setFeedback(null);
              }}
            >
              Desfazer
            </button>
          )}
          <button
            aria-label="Fechar confirmação"
            onClick={() => setFeedback(null)}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
