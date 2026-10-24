import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import type { DayRecord } from "../store/useUserStore";
import { CONFIG_REFEICOES } from "../utils/nutritionMath";
import { localDayKey } from "../utils/dailyStreak";
import { mealCatalog } from "../utils/appFeatures";
import { calcularPorcoes } from "../data/alimentos";
import type { MealComposerHandle } from "./MealComposer";
import { MealComposer } from "./MealComposer";
import { Icon, Sheet } from "./ui/AppUI";
import { litersText, numberText } from "./ui/format";

export function DayHistoryDetail({
  date,
  record,
  onClose,
}: {
  date: string;
  record?: DayRecord;
  onClose: () => void;
}) {
  const composer = useRef<MealComposerHandle>(null);
  const dados = useUserStore((s) => s.dados);
  const navigate = useNavigate();
  const today = localDayKey(new Date());
  const past = date < today;
  const [water, setWater] = useState(String(record?.aguaConsumida || 0));
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [choice, setChoice] = useState("cafeManha");
  const entries = Object.entries(record?.refeicoesDetalhadas || {});
  const info = (key: string) =>
    record?.refeicoesDetalhadas[key] ||
    CONFIG_REFEICOES[key] || { titulo: "Refeição livre", icone: "🍽️" };
  if (editing)
    return createPortal(
      <div
        className={`app-themed app-meal-overlay ${
          (dados.temaEscuro ?? true) ? "" : "app-light"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={`Corrigir ${info(editing).titulo}`}
      >
        <button
          className="app-modal-scrim"
          aria-label="Voltar ao dia"
          onClick={() => composer.current?.requestClose()}
        />
        <div className="app-composer-sheet">
          <MealComposer
            ref={composer}
            key={`${date}-${editing}`}
            alimentos={mealCatalog(
              dados,
              editing,
              Object.keys(record?.refeicoesDetalhadas[editing]?.porcoes || {}),
            )}
            initialPorcoes={record?.refeicoesDetalhadas[editing]?.porcoes || {}}
            confirmLabel="Salvar neste dia"
            memoriaKey={editing}
            titulo={`${info(editing).titulo} · ${date
              .split("-")
              .reverse()
              .slice(0, 2)
              .join("/")}`}
            onClose={() => setEditing(null)}
            onConfirm={(porcoes) => {
              const catalog = mealCatalog(dados, editing, Object.keys(porcoes));
              const total = calcularPorcoes(porcoes, catalog);
              const saved = useUserStore.getState().corrigirDia(date, {
                key: editing,
                refeicao: {
                  ...info(editing),
                  calorias: total.calorias,
                  macros: total.macros,
                  porcoes,
                  alimentos: Object.keys(porcoes).map(
                    (id) => catalog.find((f) => f.id === id)?.nome || id,
                  ),
                },
              });
              if (saved) {
                setEditing(null);
                setMessage(
                  "Refeição salva neste dia. Os registros de hoje continuam iguais.",
                );
              }
            }}
          />
        </div>
      </div>,
      document.body,
    );
  return (
    <Sheet
      title={`Seu dia · ${date.split("-").reverse().join("/")}`}
      description={
        past
          ? "Esqueceu algo? Você pode completar ou corrigir aqui."
          : date === today
            ? "Seu acompanhamento de hoje"
            : "Esse dia ainda vai chegar."
      }
      onClose={onClose}
    >
      <div className="app-day-summary">
        <div className="app-tone-blue">
          <Icon name="water" size={19} />
          <strong>
            {litersText(record?.aguaConsumida || 0)}
            <small> L</small>
          </strong>
          <span>Água registrada</span>
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
      {past && (
        <form
          className="app-feature-form app-history-water"
          onSubmit={(e) => {
            e.preventDefault();
            const saved = useUserStore
              .getState()
              .corrigirDia(date, { agua: Number(water) });
            setMessage(
              saved
                ? "Água atualizada neste dia."
                : "Confira a quantidade de água.",
            );
          }}
        >
          <label>
            Água do dia, em ml
            <input
              aria-label="Água deste dia em ml"
              type="number"
              min="0"
              max="99999"
              required
              inputMode="numeric"
              value={water}
              onChange={(e) => setWater(e.target.value)}
            />
          </label>
          <button className="app-button app-button--secondary" type="submit">
            Salvar água
          </button>
        </form>
      )}
      <h3 className="app-sheet-section-title">Refeições registradas</h3>
      <div className="app-record-list">
        {entries.length ? (
          entries.map(([key, meal]) => (
            <article className="app-history-meal" key={key}>
              <div>
                <span aria-hidden="true">{meal.icone}</span>
                <strong>{meal.titulo}</strong>
                <b>{numberText(meal.calorias)} kcal</b>
              </div>
              <p>
                {Array.isArray(meal.alimentos)
                  ? meal.alimentos.join(" · ")
                  : ""}
              </p>
              {past && (
                <div className="app-history-actions">
                  <button
                    className="app-text-button"
                    onClick={() => {
                      setEditing(key);
                      setMessage("");
                    }}
                  >
                    <Icon name="edit" size={14} />
                    Editar
                  </button>
                  <button
                    className="app-text-button"
                    onClick={() => setRemoving(key)}
                  >
                    Remover
                  </button>
                </div>
              )}
              {past && !meal.porcoes && (
                <p className="app-helper">
                  Registro antigo sem quantidades. Ao editar, selecione
                  novamente os alimentos e as porções.
                </p>
              )}
              {removing === key && (
                <div className="app-inline-confirm">
                  <p>Remover esta refeição deste dia?</p>
                  <button
                    className="app-text-button"
                    onClick={() => setRemoving(null)}
                  >
                    Manter
                  </button>
                  <button
                    className="app-text-button"
                    onClick={() => {
                      useUserStore.getState().corrigirDia(date, { key });
                      setRemoving(null);
                      setMessage("Refeição removida deste dia.");
                    }}
                  >
                    Sim, remover
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="app-empty-state">
            <Icon name="plan" size={25} />
            <h3>Ainda sem refeições por aqui</h3>
            <p>
              {past
                ? "Lembrou do que comeu? Adicione uma refeição abaixo."
                : "Seus registros vão aparecer aqui."}
            </p>
          </div>
        )}
      </div>
      {past && (
        <div className="app-feature-form">
          <label>
            Adicionar uma refeição
            <select
              aria-label="Refeição para adicionar ao dia"
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
            >
              {Object.entries(CONFIG_REFEICOES).map(([key, meal]) => (
                <option
                  key={key}
                  value={key}
                  disabled={Boolean(record?.refeicoesDetalhadas[key])}
                >
                  {meal.titulo}
                  {record?.refeicoesDetalhadas[key] ? " · já registrada" : ""}
                </option>
              ))}
              <option value="livre">Refeição livre</option>
            </select>
          </label>
          <button
            className="app-button app-button--primary"
            disabled={
              choice !== "livre" && Boolean(record?.refeicoesDetalhadas[choice])
            }
            onClick={() =>
              setEditing(
                choice === "livre" ? `refeicaoLivre_${Date.now()}` : choice,
              )
            }
          >
            <Icon name="plus" size={16} />
            Adicionar neste dia
          </button>
          <p className="app-helper">
            Correções atualizam seu histórico e o resumo semanal. A sequência já
            conquistada é preservada; estes registros não dão pontos
            retroativos.
          </p>
        </div>
      )}
      {date === today && (
        <button
          className="app-button app-button--primary app-wide-button"
          onClick={() => {
            onClose();
            navigate("/");
          }}
        >
          Ir aos registros de hoje
        </button>
      )}
      {message && (
        <p className="app-inline-notice" role="status">
          {message}
        </p>
      )}
      <button
        className="app-button app-button--secondary app-wide-button"
        onClick={onClose}
      >
        Concluir
      </button>
    </Sheet>
  );
}
