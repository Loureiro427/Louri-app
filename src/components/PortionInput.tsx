import { useState } from "react";
import type { Alimento } from "../data/alimentos";
import { householdMeasure } from "../utils/easyMeals";
import { numberText } from "./ui/format";

export function PortionInput({
  food,
  grams,
  onChange,
}: {
  food: Alimento;
  grams: number;
  onChange: (grams: number) => void;
}) {
  const measure = householdMeasure(food);
  const [household, setHousehold] = useState(false);
  const factor = household && measure ? measure.grams : 1;
  const step = household ? 0.5 : 25;
  const amount = grams / factor;
  return (
    <div className="app-easy-portion">
      {measure && (
        <div className="app-segmented" aria-label={`Medida de ${food.nome}`}>
          <button
            type="button"
            aria-pressed={!household}
            className={!household ? "is-active" : ""}
            onClick={() => setHousehold(false)}
          >
            Gramas
          </button>
          <button
            type="button"
            aria-pressed={household}
            className={household ? "is-active" : ""}
            onClick={() => setHousehold(true)}
          >
            Medida caseira
          </button>
        </div>
      )}
      <label htmlFor={`quantity-${food.id}`}>
        {household && measure
          ? `Quantidade · ${measure.label}`
          : "Quantidade em gramas"}
      </label>
      <div className="app-quantity-control">
        <button
          type="button"
          aria-label={`Diminuir quantidade de ${food.nome}`}
          onClick={() => onChange(Math.max(0, grams - step * factor))}
        >
          −
        </button>
        <div>
          <input
            id={`quantity-${food.id}`}
            aria-label={`${household ? "Medidas caseiras" : "Gramas"} de ${food.nome}`}
            type="number"
            inputMode="decimal"
            min="0"
            max={9999 / factor}
            step="any"
            value={grams ? Number(amount.toFixed(3)) : ""}
            onChange={(e) => onChange(Number(e.target.value) * factor)}
          />
          <span>{household ? "×" : "g"}</span>
        </div>
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${food.nome}`}
          onClick={() => onChange(grams + step * factor)}
        >
          +
        </button>
      </div>
      {household && measure && (
        <>
          <div
            className="app-portion-presets"
            aria-label={`Quantidades rápidas de ${food.nome}`}
          >
            {[0.5, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${numberText(n, 1)} vezes ${measure.label}`}
                onClick={() => onChange(n * measure.grams)}
              >
                {numberText(n, 1)}×
              </button>
            ))}
          </div>
          <p className="app-helper">
            1 {measure.label} ≈ {measure.grams} g. Total: {numberText(grams, 1)}{" "}
            g. Tamanhos variam; ajuste em gramas se souber o peso.
          </p>
        </>
      )}
    </div>
  );
}
