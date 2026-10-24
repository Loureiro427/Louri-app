import { useState } from "react";
import type { Alimento } from "../data/alimentos";
import { useUserStore } from "../store/useUserStore";
import {
  portionPreference,
  parseVesselVolume,
  resizedVesselAmount,
} from "../utils/portionPreferences";
import type { PortionPreference } from "../utils/portionPreferences";
import { numberText } from "./ui/format";
import { Sheet } from "./ui/AppUI";

export function PortionInput({
  food,
  grams,
  onChange,
}: {
  food: Alimento;
  grams: number;
  onChange: (grams: number) => void;
}) {
  const saved = useUserStore((s) => s.dados.preferenciasMedida?.[food.id]);
  const pref = portionPreference(food, saved);
  const { modo, factor, measure } = pref;
  const unit = food.unidade || "g";
  const vessel = modo === "copo" || modo === "xicara";
  const household = modo === "caseira";
  const amount = grams / factor;
  const step =
    modo === "base"
      ? 25
      : household && measure?.choice === "Unidades"
        ? 1
        : 0.5;
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState("");
  const [capacityOpen, setCapacityOpen] = useState(false);
  const [capacityDraft, setCapacityDraft] = useState("");
  const [error, setError] = useState("");
  const savePreference = (change: Partial<PortionPreference>) => {
    const store = useUserStore.getState();
    store.setDados({
      preferenciasMedida: {
        ...store.dados.preferenciasMedida,
        [food.id]: {
          modo,
          copoMl: pref.copoMl,
          xicaraMl: pref.xicaraMl,
          ...change,
        },
      },
    });
  };
  const label = vessel
    ? modo === "copo"
      ? "Copos"
      : "Xícaras"
    : household
      ? measure?.choice || "Medidas caseiras"
      : unit === "ml"
        ? "Mililitros"
        : "Gramas";
  const capacityName = modo === "copo" ? "copo" : "xícara";
  return (
    <div className="app-easy-portion">
      {(measure || unit === "ml") && (
        <div
          className="app-segmented app-measure-options"
          role="group"
          aria-label={`Medida de ${food.nome}`}
        >
          <button
            type="button"
            aria-pressed={modo === "base"}
            className={modo === "base" ? "is-active" : ""}
            onClick={() => savePreference({ modo: "base" })}
          >
            {unit === "ml" ? "Mililitros" : "Gramas"}
          </button>
          {measure && (
            <button
              type="button"
              aria-pressed={household}
              className={household ? "is-active" : ""}
              onClick={() => savePreference({ modo: "caseira" })}
            >
              {measure.choice || "Medida caseira"}
            </button>
          )}
          {unit === "ml" &&
            (
              [
                ["copo", "Copos"],
                ["xicara", "Xícaras"],
              ] as const
            ).map(([mode, text]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={modo === mode}
                className={modo === mode ? "is-active" : ""}
                onClick={() => savePreference({ modo: mode })}
              >
                {text}
              </button>
            ))}
        </div>
      )}
      <label htmlFor={`quantity-${food.id}`}>
        {vessel
          ? `Quantidade · ${capacityName} de ${numberText(factor, 1)} ml`
          : household && measure
            ? `Quantidade · ${measure.label}`
            : unit === "ml"
              ? "Quantidade em mililitros"
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
            role="spinbutton"
            aria-label={`${label} de ${food.nome}`}
            type="text"
            inputMode="decimal"
            aria-valuemin={0}
            aria-valuemax={9999 / factor}
            aria-valuenow={Number(amount.toFixed(3))}
            value={focused ? draft : grams ? Number(amount.toFixed(3)) : ""}
            onFocus={() => {
              setFocused(true);
              setDraft(grams ? String(Number(amount.toFixed(3))) : "");
            }}
            onBlur={() => setFocused(false)}
            onKeyDown={(event) => {
              if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
              event.preventDefault();
              const next = Math.min(
                9999,
                Math.max(
                  0,
                  grams + (event.key === "ArrowUp" ? 1 : -1) * step * factor,
                ),
              );
              setDraft(String(Number((next / factor).toFixed(3))));
              onChange(next);
            }}
            onChange={(event) => {
              const value = event.target.value;
              if (!/^\d{0,5}([.,]\d{0,3})?$/.test(value)) return;
              setDraft(value);
              const parsed = Number(value.replace(",", "."));
              if (Number.isFinite(parsed)) {
                if (parsed * factor > 9999)
                  setDraft(String(Number((9999 / factor).toFixed(3))));
                onChange(Math.min(9999, parsed * factor));
              }
            }}
          />
          <span>
            {vessel
              ? "×"
              : household
                ? measure?.choice === "Unidades"
                  ? "un"
                  : "×"
                : unit}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Aumentar quantidade de ${food.nome}`}
          onClick={() => onChange(Math.min(9999, grams + step * factor))}
        >
          +
        </button>
      </div>
      {(household || vessel) && (
        <>
          <div
            className="app-portion-presets"
            aria-label={`Quantidades rápidas de ${food.nome}`}
          >
            {[0.5, 1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${numberText(n, 1)} vezes ${vessel ? `${capacityName} de ${factor} ml` : measure!.label}`}
                onClick={() => onChange(Math.min(9999, n * factor))}
              >
                {numberText(n, 1)}×
              </button>
            ))}
          </div>
          <p className="app-helper">
            {vessel
              ? `1 ${capacityName} = ${numberText(factor, 1)} ml. Total: ${numberText(grams, 1)} ml.`
              : `1 ${measure!.label.replace(/ de \d+ g$/, "")} ≈ ${measure!.grams} g. Total: ${numberText(grams, 1)} g. Tamanhos variam; ajuste em gramas se souber o peso.`}
          </p>
          {vessel && (
            <button
              className="app-text-button app-vessel-adjust"
              type="button"
              onClick={() => {
                setCapacityDraft(String(factor));
                setError("");
                setCapacityOpen(true);
              }}
            >
              Ajustar tamanho do {capacityName}
            </button>
          )}
        </>
      )}
      {capacityOpen && (
        <Sheet
          title={`Tamanho do ${capacityName}`}
          description="Use a capacidade do recipiente que você tem em casa."
          onClose={() => setCapacityOpen(false)}
        >
          <form
            className="app-feature-form"
            onSubmit={(event) => {
              event.preventDefault();
              const capacity = parseVesselVolume(capacityDraft);
              if (capacity === null) {
                setError("Informe entre 10 e 2.000 ml.");
                return;
              }
              if ((grams / factor) * capacity > 9999) {
                setError(
                  "O total passaria de 9.999 ml. Reduza a quantidade ou escolha um recipiente menor.",
                );
                return;
              }
              savePreference(
                modo === "copo" ? { copoMl: capacity } : { xicaraMl: capacity },
              );
              onChange(resizedVesselAmount(grams, factor, capacity));
              setCapacityOpen(false);
            }}
          >
            <label>
              Capacidade em ml
              <input
                autoFocus
                inputMode="decimal"
                value={capacityDraft}
                onChange={(e) => setCapacityDraft(e.target.value)}
              />
            </label>
            <p className="app-helper">
              O total será ajustado mantendo o número de{" "}
              {modo === "copo" ? "copos" : "xícaras"}. Essa escolha será
              lembrada para este alimento.
            </p>
            {error && (
              <p className="app-field-error" role="alert">
                {error}
              </p>
            )}
            <button className="app-button app-button--primary" type="submit">
              Usar esse tamanho
            </button>
          </form>
        </Sheet>
      )}
    </div>
  );
}
