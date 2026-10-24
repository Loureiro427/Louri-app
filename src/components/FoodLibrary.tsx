import { CustomFoodActions } from "./CustomFoodActions";
import { FoodVisual } from "./FoodVisual";
import { useEffect, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { Icon, Sheet } from "./ui/AppUI";
import { fullCatalog } from "../utils/appFeatures";
import { createCustomFood } from "../utils/customFood";
import { foodMatches, normalizeFoodText } from "../utils/foodSearch";
import { numberText } from "./ui/format";
import { DiscardChanges } from "./DiscardChanges";
export function FoodLibrary({
  porcoes = {},
  onApply,
  onSelect,
  onClose,
  initialName = "",
}: {
  porcoes?: Record<string, number>;
  onApply?: (p: Record<string, number>) => void;
  onSelect?: (id: string, grams: number) => void;
  onClose: () => void;
  initialName?: string;
}) {
  const dados = useUserStore((s) => s.dados);
  const [tab, setTab] = useState<"recipes" | "food">("food");
  const [adding, setAdding] = useState(Boolean(initialName));
  const [name, setName] = useState("");
  const [foodName, setFoodName] = useState(initialName);
  const [base, setBase] = useState("100");
  const [values, setValues] = useState(["", "", "", ""]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [discard, setDiscard] = useState(false);
  const dirty = Boolean(
    foodName.trim() || values.some((v) => v.trim()) || name.trim(),
  );
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  const close = () => (dirty ? setDiscard(true) : onClose());
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
              <form
                className="app-feature-form app-personal-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const result = createCustomFood(
                    foodName,
                    base,
                    values,
                    `custom_${crypto.randomUUID()}`,
                  );
                  if (typeof result === "string") {
                    setError(result);
                    return;
                  }
                  if (
                    foods.some(
                      (f) =>
                        normalizeFoodText(f.nome) ===
                        normalizeFoodText(result.nome),
                    )
                  ) {
                    setError(
                      "Você já tem um alimento com esse nome. Use o item salvo ou acrescente a marca ao nome.",
                    );
                    return;
                  }
                  useUserStore
                    .getState()
                    .setDados({
                      alimentosPersonalizados: [
                        ...(dados.alimentosPersonalizados || []),
                        result,
                      ],
                    });
                  setFoodName("");
                  setBase("100");
                  setValues(["", "", "", ""]);
                  setError("");
                  setAdding(false);
                  if (onSelect) {
                    onSelect(result.id, result.porcaoReferencia || 100);
                    onClose();
                  } else
                    setMessage(
                      "Alimento salvo. Use ‘Ícone ou foto’ para personalizá-lo. Ele já está disponível na busca de qualquer refeição.",
                    );
                }}
              >
                <h3 className="app-sheet-section-title">
                  O que você vai comer?
                </h3>
                <p className="app-helper">
                  Tenha a tabela nutricional da embalagem por perto. Copie tudo
                  da mesma coluna: o peso da porção e os valores abaixo.
                </p>
                <label>
                  Nome do alimento
                  <input
                    required
                    maxLength={70}
                    value={foodName}
                    placeholder="Ex.: meu iogurte de morango"
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </label>
                <label>
                  Essa porção pesa quantos gramas?
                  <input
                    required
                    inputMode="decimal"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                  />
                </label>
                <p className="app-helper">
                  Exemplo: se a coluna diz “porção de 30 g”, digite 30 e copie
                  os valores daquela coluna. Use gramas; ml não são convertidos
                  automaticamente.
                </p>
                {[
                  "Calorias (kcal)",
                  "Proteínas (g)",
                  "Carboidratos (g)",
                  "Gorduras totais (g)",
                ].map((label, i) => (
                  <label key={label}>
                    {label}
                    <input
                      required
                      inputMode="decimal"
                      value={values[i]}
                      placeholder="Digite 0 se o rótulo indicar zero"
                      onChange={(e) =>
                        setValues(
                          values.map((v, j) => (i === j ? e.target.value : v)),
                        )
                      }
                    />
                  </label>
                ))}
                {error && (
                  <p className="app-field-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="app-button app-button--primary"
                  type="submit"
                >
                  {onSelect
                    ? "Salvar e usar nesta refeição"
                    : "Salvar alimento"}
                </button>
                <button
                  className="app-text-button"
                  type="button"
                  onClick={() => setAdding(false)}
                >
                  Voltar à minha lista
                </button>
              </form>
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
                            {numberText(f.kcal100g, 1)} kcal por 100 g
                          </small>
                        </div>
                        <CustomFoodActions food={f} />
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
                          `${fullCatalog(dados).find((f) => f.id === id)?.nome || id} (${numberText(g, 1)} g)`,
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
