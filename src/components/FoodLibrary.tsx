import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { Sheet } from "./ui/AppUI";
import { fullCatalog } from "../utils/appFeatures";
export function FoodLibrary({
  porcoes,
  onApply,
  onClose,
}: {
  porcoes: Record<string, number>;
  onApply: (p: Record<string, number>) => void;
  onClose: () => void;
}) {
  const dados = useUserStore((s) => s.dados);
  const [tab, setTab] = useState<"recipes" | "food">("recipes");
  const [name, setName] = useState("");
  const [foodName, setFoodName] = useState("");
  const [base, setBase] = useState("100");
  const [values, setValues] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const saveFood = () => {
    const numbers = values.map((v) => Number(v.replace(",", "."))),
      grams = Number(base.replace(",", "."));
    if (
      !foodName.trim() ||
      !Number.isFinite(grams) ||
      grams <= 0 ||
      grams > 10000 ||
      values.some((v) => !v.trim()) ||
      numbers.some((v) => !Number.isFinite(v) || v < 0) ||
      numbers[0] <= 0 ||
      (numbers[0] / grams) * 100 > 1000 ||
      numbers.slice(1).some((n) => n > grams) ||
      numbers.slice(1).reduce((a, b) => a + b, 0) > grams + 1
    ) {
      setError(
        "Confira o nome, a porção, as calorias e os macros da embalagem."
      );
      return;
    }
    const food = {
      id: `custom_${crypto.randomUUID()}`,
      nome: foodName.trim(),
      emoji: "🍽️",
      kcal100g: (numbers[0] / grams) * 100,
      prot: (numbers[1] / grams) * 100,
      carbo: (numbers[2] / grams) * 100,
      gord: (numbers[3] / grams) * 100,
    };
    useUserStore
      .getState()
      .setDados({
        alimentosPersonalizados: [
          ...(dados.alimentosPersonalizados || []),
          food,
        ],
      });
    setMessage(
      "Alimento adicionado ao catálogo. Busque pelo nome para usá-lo."
    );
    setError("");
    setFoodName("");
    setValues(["", "", "", ""]);
  };
  return (
    <Sheet title="Minha coleção" onClose={onClose}>
      <div className="app-tools-grid">
        <button
          className={`app-button app-button--${
            tab === "recipes" ? "primary" : "secondary"
          }`}
          onClick={() => {
            setTab("recipes");
            setError("");
            setMessage("");
          }}
        >
          Refeições salvas
        </button>
        <button
          className={`app-button app-button--${
            tab === "food" ? "primary" : "secondary"
          }`}
          onClick={() => {
            setTab("food");
            setError("");
            setMessage("");
          }}
        >
          Novo alimento
        </button>
      </div>
      {tab === "recipes" ? (
        <>
          <form
            className="app-feature-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim() || !Object.values(porcoes).some((g) => g > 0)) {
                setError("Selecione alimentos e dê um nome à combinação.");
                return;
              }
              useUserStore
                .getState()
                .setDados({
                  refeicoesSalvas: [
                    ...(dados.refeicoesSalvas || []),
                    {
                      id: crypto.randomUUID(),
                      nome: name.trim(),
                      porcoes: Object.fromEntries(
                        Object.entries(porcoes).filter(([, g]) => g > 0)
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
                value={name}
                placeholder="Meu café de sempre"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button className="app-button app-button--secondary" type="submit">
              Salvar seleção atual
            </button>
          </form>
          <p className="app-helper">
            Usar uma combinação substitui a seleção atual. Revise as porções
            antes de registrar.
          </p>
          {(dados.refeicoesSalvas || []).map((recipe) => (
            <div className="app-recipe-row" key={recipe.id}>
              <button
                onClick={() => {
                  onApply(recipe.porcoes);
                  onClose();
                }}
              >
                <strong>{recipe.nome}</strong>
                <small>
                  {Object.entries(recipe.porcoes)
                    .map(
                      ([id, g]) =>
                        `${
                          fullCatalog(dados).find((f) => f.id === id)?.nome ||
                          id
                        } (${g} g)`
                    )
                    .join(" · ")}
                </small>
              </button>
              <button
                aria-label={`Excluir combinação ${recipe.nome}`}
                onClick={() =>
                  useUserStore
                    .getState()
                    .setDados({
                      refeicoesSalvas: dados.refeicoesSalvas?.filter(
                        (r) => r.id !== recipe.id
                      ),
                    })
                }
              >
                ×
              </button>
            </div>
          ))}
        </>
      ) : (
        <form
          className="app-feature-form"
          onSubmit={(e) => {
            e.preventDefault();
            saveFood();
          }}
        >
          <p className="app-helper">
            Copie os valores do rótulo para a porção indicada. O app converte
            para 100 g.
          </p>
          <label>
            Nome do alimento
            <input
              maxLength={70}
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </label>
          <label>
            Porção do rótulo (g)
            <input
              inputMode="decimal"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
          {[
            "Calorias (kcal)",
            "Proteína (g)",
            "Carboidratos (g)",
            "Gorduras (g)",
          ].map((label, i) => (
            <label key={label}>
              {label}
              <input
                inputMode="decimal"
                value={values[i]}
                onChange={(e) =>
                  setValues(
                    values.map((v, j) => (j === i ? e.target.value : v))
                  )
                }
              />
            </label>
          ))}
          <button className="app-button app-button--primary" type="submit">
            Adicionar alimento
          </button>
        </form>
      )}
      {error && (
        <p className="app-field-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="app-helper" role="status">
          {message}
        </p>
      )}
    </Sheet>
  );
}
