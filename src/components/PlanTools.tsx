import { ShoppingList } from "./ShoppingList";
import { useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { getCronograma } from "../utils/nutritionMath";
import { mealCatalog } from "../utils/appFeatures";
import { MealComposer } from "./MealComposer";
import { Icon, Sheet } from "./ui/AppUI";
export function PlanTools() {
  const dados = useUserStore((s) => s.dados);
  const [panel, setPanel] = useState<"times" | "shopping" | null>(null);
  const [meal, setMeal] = useState<string | null>(null);
  const [times, setTimes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { pathname } = useLocation();
  useEffect(() => {
    setMeal(null);
    setPanel(null);
  }, [pathname]);
  const schedule = getCronograma(dados);
  return (
    <>
      <div className="app-tools-grid">
        <button
          className="app-button app-button--secondary"
          onClick={() => {
            setTimes(
              Object.fromEntries(schedule.map((r) => [r.key, r.horario]))
            );
            setError("");
            setPanel("times");
          }}
        >
          <Icon name="clock" size={18} />
          Horários
        </button>
        <button
          className="app-button app-button--secondary"
          onClick={() => setPanel("shopping")}
        >
          <Icon name="file" size={18} />
          Lista de compras
        </button>
      </div>
      <section>
        <div className="app-section-heading">
          <h2>Alimentos do plano</h2>
        </div>
        <p className="app-helper">
          Toque na refeição para trocar alimentos ou ajustar as porções. Isso
          altera o plano, sem registrar consumo.
        </p>
        <div className="app-card app-settings-list">
          {schedule.map((r) => (
            <button
              key={r.key}
              className="app-action-row"
              onClick={() => setMeal(r.key)}
            >
              <span>{r.icone}</span>
              <span className="app-row-copy">
                <strong>{r.titulo}</strong>
                <small>
                  {(Array.isArray(dados.alimentos?.[r.key])
                    ? dados.alimentos[r.key]
                    : []
                  )
                    .map(
                      (id) =>
                        mealCatalog(dados, r.key).find((f) => f.id === id)?.nome
                    )
                    .filter(Boolean)
                    .join(" · ") || "Escolher alimentos"}
                </small>
              </span>
              <Icon name="edit" size={16} />
            </button>
          ))}
        </div>
      </section>
      {panel === "times" && (
        <Sheet
          title="Seus horários"
          description="Defina um horário para cada refeição."
          onClose={() => setPanel(null)}
        >
          <form
            className="app-feature-form"
            onSubmit={(e) => {
              e.preventDefault();
              const savedTimes = Object.fromEntries(
                new FormData(e.currentTarget).entries()
              ) as Record<string, string>;
              if (
                Object.values(savedTimes).some(
                  (v) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(v)
                )
              ) {
                setError("Preencha todos os horários.");
                return;
              }
              useUserStore
                .getState()
                .setDados({ horariosRefeicoes: savedTimes });
              setPanel(null);
            }}
          >
            {schedule.map((r) => (
              <label key={r.key}>
                {r.icone} {r.titulo}
                <input
                  aria-label={`Horário de ${r.titulo}`}
                  name={r.key}
                  type="time"
                  required
                  value={times[r.key] || ""}
                  onInput={(e) =>
                    setTimes({ ...times, [r.key]: e.currentTarget.value })
                  }
                />
              </label>
            ))}
            {error && <p role="alert">{error}</p>}
            <button className="app-button app-button--primary" type="submit">
              Salvar horários
            </button>
          </form>
        </Sheet>
      )}
      {panel === "shopping" && <ShoppingList onClose={() => setPanel(null)} />}
      {meal &&
        createPortal(
          <div
            className={`app-themed app-meal-overlay ${
              dados.temaEscuro ? "" : "app-light"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Editar alimentos do plano"
          >
            <div className="app-composer-sheet">
              <MealComposer
                alimentos={mealCatalog(dados, meal)}
                memoriaKey={meal}
                titulo={schedule.find((r) => r.key === meal)?.titulo || "Plano"}
                initialPorcoes={
                  dados.porcoesPlano?.[meal] ||
                  Object.fromEntries(
                    (Array.isArray(dados.alimentos?.[meal])
                      ? dados.alimentos[meal]
                      : []
                    ).map((id) => [id, 100])
                  )
                }
                confirmLabel="Salvar no plano"
                onClose={() => setMeal(null)}
                onConfirm={(porcoes) => {
                  useUserStore.getState().setDados({
                    alimentos: {
                      ...dados.alimentos,
                      [meal]: Object.keys(porcoes),
                    },
                    porcoesPlano: { ...dados.porcoesPlano, [meal]: porcoes },
                  });
                  setMeal(null);
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
