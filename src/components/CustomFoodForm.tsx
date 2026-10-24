import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import type { Alimento } from "../data/alimentos";
import { createCustomFood } from "../utils/customFood";
import { normalizeFoodText } from "../utils/foodSearch";
import { useUserStore } from "../store/useUserStore";
import { DiscardChanges } from "./DiscardChanges";

export type CustomFoodFormHandle = {
  requestClose: (after?: () => void) => void;
};
export function CustomFoodForm({
  ref,
  initialFood,
  initialName = "",
  onSave,
  onCancel,
}: {
  ref?: Ref<CustomFoodFormHandle>;
  initialFood?: Alimento;
  initialName?: string;
  onSave: (food: Alimento) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialFood?.nome || initialName);
  const [unit, setUnit] = useState<"g" | "ml">(initialFood?.unidade || "g");
  const [base, setBase] = useState(
    String(initialFood?.porcaoReferencia || 100),
  );
  const [values, setValues] = useState(() =>
    initialFood
      ? [
          initialFood.kcal100g,
          initialFood.prot,
          initialFood.carbo,
          initialFood.gord,
        ].map((n) =>
          String(
            Number(
              ((n * (initialFood.porcaoReferencia || 100)) / 100).toFixed(6),
            ),
          ),
        )
      : ["", "", "", ""],
  );
  const [initial] = useState(() =>
    JSON.stringify({ name, unit, base, values }),
  );
  const dirty = JSON.stringify({ name, unit, base, values }) !== initial;
  const [error, setError] = useState("");
  const [discard, setDiscard] = useState(false);
  const discardAction = useRef(onCancel);
  const close = (after = onCancel) => {
    if (dirty) {
      discardAction.current = after;
      setDiscard(true);
    } else after();
  };
  useImperativeHandle(ref, () => ({ requestClose: close }));
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  return (
    <>
      <form
        className="app-feature-form app-personal-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (initialFood && !dirty) {
            onCancel();
            return;
          }
          const food = createCustomFood(
            name,
            base,
            values,
            `custom_${crypto.randomUUID()}`,
            unit,
          );
          if (typeof food === "string") {
            setError(food);
            return;
          }
          if (
            useUserStore
              .getState()
              .dados.alimentosPersonalizados?.some(
                (f) =>
                  !f.arquivado &&
                  f.id !== initialFood?.id &&
                  normalizeFoodText(f.nome) === normalizeFoodText(food.nome),
              )
          ) {
            setError(
              "Você já tem um alimento com esse nome. Acrescente a marca ou edite o item salvo.",
            );
            return;
          }
          onSave(food);
        }}
      >
        <h3 className="app-sheet-section-title">
          {initialFood ? "Dados do alimento" : "O que você vai consumir?"}
        </h3>
        <label>
          Nome do alimento
          <input
            required
            maxLength={70}
            value={name}
            placeholder="Ex.: meu iogurte de morango"
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div
          className="app-segmented app-personal-tabs"
          role="group"
          aria-label="Unidade do alimento"
        >
          <button
            type="button"
            aria-pressed={unit === "g"}
            className={unit === "g" ? "is-active" : ""}
            onClick={() => setUnit("g")}
          >
            Comida · g
          </button>
          <button
            type="button"
            aria-pressed={unit === "ml"}
            className={unit === "ml" ? "is-active" : ""}
            onClick={() => setUnit("ml")}
          >
            Bebida · ml
          </button>
        </div>
        <label>
          Quantidade da porção ({unit})
          <input
            required
            inputMode="decimal"
            value={base}
            onChange={(e) => setBase(e.target.value)}
          />
        </label>
        <p className="app-helper">
          Copie o rótulo inteiro da mesma coluna. Se ele informa uma porção de
          200 {unit}, digite 200 e preencha os valores dessa porção. Os
          nutrientes abaixo continuam em gramas.
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
                setValues(values.map((v, j) => (i === j ? e.target.value : v)))
              }
            />
          </label>
        ))}
        {initialFood && (
          <p className="app-helper">
            As mudanças valem para os próximos registros e seu plano. O
            histórico já registrado é preservado. Ao trocar g por ml ou
            vice-versa, o plano mantém o número de porções do rótulo; confira as
            quantidades.
          </p>
        )}
        {error && (
          <p className="app-field-error" role="alert">
            {error}
          </p>
        )}
        <button className="app-button app-button--primary" type="submit">
          {initialFood ? "Salvar alterações" : "Salvar alimento"}
        </button>
        <button
          className="app-text-button"
          type="button"
          onClick={() => close()}
        >
          {initialFood ? "Cancelar edição" : "Voltar à minha lista"}
        </button>
      </form>
      {discard && (
        <DiscardChanges
          onKeep={() => setDiscard(false)}
          onDiscard={() => discardAction.current()}
        />
      )}
    </>
  );
}
