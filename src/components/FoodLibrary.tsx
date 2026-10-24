import { CustomFoodActions } from "./CustomFoodActions";
import { FoodVisual } from "./FoodVisual";
import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { Icon, Sheet } from "./ui/AppUI";
import { fullCatalog } from "../utils/appFeatures";
import { CustomFoodForm } from "./CustomFoodForm";
import type { CustomFoodFormHandle } from "./CustomFoodForm";
import type { Alimento } from "../data/alimentos";
import { foodMatches } from "../utils/foodSearch";
import { numberText } from "./ui/format";
import { DiscardChanges } from "./DiscardChanges";
export function FoodLibrary({
  porcoes = {},
  onApply,
  onSelect,
  onEdited,
  onClose,
  initialName = "",
}: {
  porcoes?: Record<string, number>;
  onApply?: (p: Record<string, number>) => void;
  onSelect?: (id: string, grams: number) => void;
  onEdited?: (before: Alimento, after: Alimento) => void;
  onClose: () => void;
  initialName?: string;
}) {
  const dados = useUserStore((s) => s.dados);
  const [tab, setTab] = useState<"recipes" | "food">("food");
  const [adding, setAdding] = useState(Boolean(initialName));
  const [name, setName] = useState("");
  const form = useRef<CustomFoodFormHandle>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty = Boolean(name.trim());
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  const close = () =>
    adding && tab === "food"
      ? form.current?.requestClose(() => (dirty ? setDiscard(true) : onClose()))
      : dirty
        ? setDiscard(true)
        : onClose();
  const foods = (dados.alimentosPersonalizados || []).filter(
    (f) => !f.arquivado,
  );
  return (
    <>
      <Sheet
        title="Meus alimentos"
        description="Seus alimentos personalizados e combinações ficam salvos neste aparelho."
        onClose={close}
      >
        <div
          className="app-segmented app-personal-tabs"
          aria-label="Minha alimentação"
        >
          <button
            aria-pressed={tab === "food"}
            className={tab === "food" ? "is-active" : ""}
            onClick={() => setTab("food")}
          >
            Alimentos
          </button>
          <button
            aria-pressed={tab === "recipes"}
            disabled={adding}
            className={tab === "recipes" ? "is-active" : ""}
            onClick={() => setTab("recipes")}
          >
            Refeições salvas
          </button>
        </div>
        {tab === "food" ? (
          <>
            {!adding && (
              <button
                className="app-button app-button--primary app-wide-button"
                onClick={() => {
                  setAdding(true);
                  setError("");
                }}
              >
                <Icon name="plus" size={17} />
                Adicionar alimento
              </button>
            )}
            {adding && (
              <CustomFoodForm
                ref={form}
                initialName={initialName}
                onCancel={() => setAdding(false)}
                onSave={(result) => {
                  const state = useUserStore.getState();
                  state.setDados({
                    alimentosPersonalizados: [
                      ...(state.dados.alimentosPersonalizados || []),
                      result,
                    ],
                  });
                  setAdding(false);
                  if (onSelect) {
                    onSelect(result.id, result.porcaoReferencia || 100);
                    onClose();
                  } else
                    setMessage(
                      "Alimento salvo. Use ‘Ícone ou foto’ para personalizá-lo.",
                    );
                }}
              />
            )}
            {!adding && (
              <>
                {foods.length > 0 && (
                  <label className="app-search">
                    <Icon name="search" size={18} />
                    <input
                      aria-label="Buscar nos meus alimentos"
                      placeholder="Buscar nos meus alimentos"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                )}
                <div className="app-personal-list">
                  {foods
                    .filter((f) => foodMatches(f, query))
                    .map((f) => (
                      <article className="app-personal-food" key={f.id}>
                        <span aria-hidden="true">
                          <FoodVisual food={f} />
                        </span>
                        <div>
                          <strong>{f.nome}</strong>
                          <small>
                            {numberText(f.kcal100g, 1)} kcal por 100{" "}
                            {f.unidade || "g"}
                          </small>
                        </div>
                        <CustomFoodActions food={f} onEdited={onEdited} />
                        {onSelect && (
                          <button
                            className="app-text-button"
                            onClick={() => {
                              onSelect(f.id, f.porcaoReferencia || 100);
                              onClose();
                            }}
                          >
                            Usar
                          </button>
                        )}
                      </article>
                    ))}
                </div>
                {!foods.length && (
                  <div className="app-empty-state">
                    <Icon name="plan" size={28} />
                    <h3>Seu cantinho de alimentos</h3>
                    <p>
                      Não achou o que vai comer? Adicione pelo rótulo. Depois,
                      basta buscar pelo nome.
                    </p>
                  </div>
                )}
                {foods.length > 0 &&
                  !foods.some((f) => foodMatches(f, query)) && (
                    <p className="app-empty">
                      Nenhum dos seus alimentos tem esse nome.
                    </p>
                  )}
              </>
            )}
          </>
        ) : (
          <>
            {onApply && (
              <form
                className="app-feature-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    !name.trim() ||
                    !Object.values(porcoes).some((g) => g > 0)
                  ) {
                    setError(
                      "Escolha alimentos na refeição e dê um nome à combinação.",
                    );
                    return;
                  }
                  useUserStore.getState().setDados({
                    refeicoesSalvas: [
                      ...(dados.refeicoesSalvas || []),
                      {
                        id: crypto.randomUUID(),
                        nome: name.trim(),
                        porcoes: Object.fromEntries(
                          Object.entries(porcoes).filter(([, g]) => g > 0),
                        ),
                      },
                    ],
                  });
                  setName("");
                  setError("");
                  setMessage("Combinação salva.");
                }}
              >
                <label>
                  Nome da combinação
                  <input
                    maxLength={60}
                    placeholder="Meu café de sempre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <button className="app-button app-button--secondary">
                  Salvar seleção atual
                </button>
                {error && (
                  <p className="app-field-error" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
            <p className="app-helper">
              {onApply
                ? "Usar uma combinação substitui a seleção atual. Confira as porções antes de registrar."
                : "Para salvar uma combinação, abra uma refeição, escolha alimentos e toque em Meus alimentos → Refeições salvas."}
            </p>
            {(dados.refeicoesSalvas || []).map((recipe) => (
              <div className="app-recipe-row" key={recipe.id}>
                <button
                  disabled={!onApply}
                  onClick={() => {
                    onApply?.(recipe.porcoes);
                    onClose();
                  }}
                >
                  <strong>{recipe.nome}</strong>
                  <small>
                    {Object.entries(recipe.porcoes)
                      .map(
                        ([id, g]) =>
                          `${fullCatalog(dados).find((f) => f.id === id)?.nome || id} (${numberText(g, 1)} ${fullCatalog(dados).find((f) => f.id === id)?.unidade || "g"})`,
                      )
                      .join(" · ")}
                  </small>
                </button>
                <button
                  aria-label={`Excluir combinação ${recipe.nome}`}
                  onClick={() =>
                    useUserStore.getState().setDados({
                      refeicoesSalvas: dados.refeicoesSalvas?.filter(
                        (r) => r.id !== recipe.id,
                      ),
                    })
                  }
                >
                  ×
                </button>
              </div>
            ))}
            {!dados.refeicoesSalvas?.length && (
              <p className="app-empty">Suas combinações vão aparecer aqui.</p>
            )}
          </>
        )}
        {message && (
          <p className="app-inline-notice" role="status">
            {message}
          </p>
        )}
      </Sheet>
      {discard && (
        <DiscardChanges onKeep={() => setDiscard(false)} onDiscard={onClose} />
      )}
    </>
  );
}
