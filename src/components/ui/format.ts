import type { CSSProperties } from "react";

const numberFormats = new Map<number, Intl.NumberFormat>();
const litersFormat = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const toneStyle = (color: string) =>
  ({ "--item-color": color } as CSSProperties);
export function numberText(value: number, digits = 0) {
  if (!numberFormats.has(digits))
    numberFormats.set(
      digits,
      new Intl.NumberFormat("pt-BR", { maximumFractionDigits: digits })
    );
  return numberFormats.get(digits)!.format(Number.isFinite(value) ? value : 0);
}
export const litersText = (ml: number) =>
  litersFormat.format((Number.isFinite(ml) ? ml : 0) / 1000);
