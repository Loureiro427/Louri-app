import type { Alimento } from "../data/alimentos";
import { DICIONARIO_ALIMENTOS } from "../data/alimentos";

// Older releases stored a meal as a single food, an array, or a selection map.
// Normalize only the editable draft; the persisted history is left untouched.
export function normalizeMealPreferences(
  value: unknown,
  extraFoods: Alimento[] = []
): Record<string, string[]> {
  const isRecord = (item: unknown): item is Record<string, unknown> =>
    typeof item === "object" && item !== null && !Array.isArray(item);
  const selections = (item: unknown): string[] => {
    if (typeof item === "string") return [item];
    if (Array.isArray(item))
      return item.filter((entry): entry is string => typeof entry === "string");
    if (isRecord(item))
      return Object.entries(item)
        .filter(
          ([, selected]) =>
            selected === true ||
            (typeof selected === "number" &&
              Number.isFinite(selected) &&
              selected > 0)
        )
        .map(([id]) => id);
    return [];
  };
  const globalSelection = Array.isArray(value) || typeof value === "string";
  const result: Record<string, string[]> = {};
  for (const [mealKey, foods] of Object.entries(DICIONARIO_ALIMENTOS)) {
    const source = globalSelection
      ? value
      : isRecord(value)
      ? value[mealKey]
      : undefined;
    const selected = selections(source);
    const ids = selected
      .map(
        (entry) =>
          [...foods, ...extraFoods].find(
            (food) => food.id === entry || food.nome === entry
          )?.id
      )
      .filter((id): id is string => Boolean(id));
    if (source !== undefined) result[mealKey] = [...new Set(ids)];
  }
  return result;
}
