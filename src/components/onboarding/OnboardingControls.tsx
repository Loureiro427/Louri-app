import { useId } from "react";
import type { CSSProperties } from "react";

export function ArrowIcon({ back = false }: { back?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={back ? "M19 12H5m6-6-6 6 6 6" : "M5 12h14m-6-6 6 6-6 6"} />
    </svg>
  );
}
export function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}
export function ChoiceCard({
  title,
  detail,
  icon,
  selected,
  onClick,
  compact = false,
}: {
  title: string;
  detail?: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ob-choice ${selected ? "is-selected" : ""} ${
        compact ? "ob-choice--compact" : ""
      }`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="ob-choice-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="ob-choice-copy">
        <span className="ob-choice-title">{title}</span>
        {detail && <span className="ob-choice-detail">{detail}</span>}
      </span>
      <span className="ob-choice-check" aria-hidden="true">
        {selected && <CheckIcon />}
      </span>
    </button>
  );
}
export function MeasurementControl({
  label,
  value,
  onChange,
  min,
  max,
  unit,
  step = 1,
  detail,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  unit: string;
  step?: number;
  detail: string;
}) {
  const id = useId();
  const number = Number(value.replace(",", "."));
  const bounded = Math.min(
    max,
    Math.max(min, Number.isFinite(number) ? number : min)
  );
  const adjust = (delta: number) =>
    onChange(
      String(
        Math.round(
          Math.min(
            max,
            Math.max(min, (Number.isFinite(number) ? number : min) + delta)
          ) * 10
        ) / 10
      )
    );
  return (
    <div className="ob-measure">
      <div className="ob-measure-card">
        <label htmlFor={id} className="ob-field-caption">
          {label}
        </label>
        <div className="ob-measure-value">
          <input
            id={id}
            style={{
              width: `${Math.max(2, Math.min(5, value.length)) + 0.25}ch`,
            }}
            aria-label={label}
            type="text"
            inputMode={step < 1 ? "decimal" : "numeric"}
            autoComplete="off"
            value={value}
            maxLength={6}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{unit}</span>
        </div>
        <span className="ob-measure-hint">Toque no número para editar</span>
        <div className="ob-measure-adjust">
          <button
            type="button"
            aria-label={`Diminuir ${label.toLowerCase()}`}
            onClick={() => adjust(-step)}
            disabled={number <= min}
          >
            −
          </button>
          <span>{detail}</span>
          <button
            type="button"
            aria-label={`Aumentar ${label.toLowerCase()}`}
            onClick={() => adjust(step)}
            disabled={number >= max}
          >
            +
          </button>
        </div>
      </div>
      <div className="ob-ruler" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => (
          <span key={i} className={i % 4 === 0 ? "is-major" : ""} />
        ))}
        <i />
      </div>
      <input
        className="ob-range"
        aria-label={`Ajustar ${label.toLowerCase()}`}
        type="range"
        min={min}
        max={max}
        step={step}
        value={bounded}
        onChange={(e) => onChange(e.target.value)}
        style={
          {
            "--range-progress": `${((bounded - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
      />
      <div className="ob-range-labels">
        <span>
          {min} {unit}
        </span>
        <span>Arraste para ajustar</span>
        <span>
          {max} {unit}
        </span>
      </div>
    </div>
  );
}

// Native time pickers differ in when they emit change; commit input and blur too.
export function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="time"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      onInput={(e) => onChange(e.currentTarget.value)}
      onBlur={(e) => {
        if (e.currentTarget.value !== value) onChange(e.currentTarget.value);
      }}
    />
  );
}
