import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { localDayKey } from "../utils/dailyStreak";
import { WEIGHT_ERROR } from "../utils/weightValidation";
import { Sheet } from "./ui/AppUI";

export function WeightEntry({
  initial,
  onClose,
  onSaved,
}: {
  initial: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [weight, setWeight] = useState(initial);
  const [error, setError] = useState("");
  return (
    <Sheet
      title="Atualizar peso"
      description="Registre seu peso atual para acompanhar a evolução."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (
            !useUserStore
              .getState()
              .salvarPesoNaData(localDayKey(new Date()), weight)
          ) {
            setError(WEIGHT_ERROR);
            return;
          }
          onSaved();
        }}
      >
        <label className="app-weight-input">
          <span>Peso atual</span>
          <div>
            <input
              type="text"
              inputMode="decimal"
              aria-label="Peso em quilos"
              value={weight}
              maxLength={6}
              onChange={(e) => {
                setWeight(e.target.value);
                setError("");
              }}
            />
            <span>kg</span>
          </div>
        </label>
        {error && (
          <p className="app-field-error" role="alert">
            {error}
          </p>
        )}
        <div className="app-button-row">
          <button
            type="button"
            className="app-button app-button--secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button type="submit" className="app-button app-button--primary">
            Salvar peso
          </button>
        </div>
      </form>
    </Sheet>
  );
}
