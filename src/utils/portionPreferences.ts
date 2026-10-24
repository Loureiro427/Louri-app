import type { Alimento } from "../data/alimentos";
import { householdMeasure } from "./easyMeals";

export type PortionPreference = {
  modo: "base" | "caseira" | "copo" | "xicara";
  copoMl?: number;
  xicaraMl?: number;
};
export function parseVesselVolume(value: string) {
  const volume = Number(value.trim().replace(",", "."));
  return Number.isFinite(volume) && volume >= 10 && volume <= 2000
    ? volume
    : null;
}
export function sanitizePortionPreference(
  value: unknown,
): PortionPreference | undefined {
  if (!value || typeof value !== "object") return undefined;
  const pref = value as Partial<PortionPreference>;
  if (!["base", "caseira", "copo", "xicara"].includes(pref.modo || ""))
    return undefined;
  const valid = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n >= 10 && n <= 2000;
  return {
    modo: pref.modo!,
    ...(valid(pref.copoMl) ? { copoMl: pref.copoMl } : {}),
    ...(valid(pref.xicaraMl) ? { xicaraMl: pref.xicaraMl } : {}),
  };
}
export function portionPreference(food: Alimento, value?: unknown) {
  const measure = householdMeasure(food);
  const pref = sanitizePortionPreference(value);
  let modo = pref?.modo || (measure ? "caseira" : "base");
  if (
    (modo === "caseira" && !measure) ||
    (["copo", "xicara"].includes(modo) && food.unidade !== "ml")
  )
    modo = "base";
  const copoMl = pref?.copoMl || 200,
    xicaraMl = pref?.xicaraMl || 150;
  const factor =
    modo === "copo"
      ? copoMl
      : modo === "xicara"
        ? xicaraMl
        : modo === "caseira"
          ? measure!.grams
          : 1;
  return { modo, copoMl, xicaraMl, factor, measure };
}
export function resizedVesselAmount(
  amount: number,
  oldCapacity: number,
  newCapacity: number,
) {
  return Math.min(9999, Math.max(0, (amount / oldCapacity) * newCapacity));
}
export function defaultFoodPortion(food: Alimento, preference?: unknown) {
  const pref = portionPreference(food, preference);
  return pref.modo !== "base"
    ? pref.factor
    : food.porcaoReferencia || pref.measure?.grams || 100;
}
