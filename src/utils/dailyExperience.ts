import type { Alimento } from "../data/alimentos";
import type {
  UserData,
  DayRecord,
  RefeicaoDetalhe,
} from "../store/useUserStore";
import { localDayKey } from "./dailyStreak";
import { getCronograma, getRotina } from "./nutritionMath";

export function validPastOrToday(date: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00`);
  return (
    Number.isFinite(parsed.getTime()) &&
    localDayKey(parsed) === date &&
    date <= localDayKey(now)
  );
}

export function nextDailyAction(dados: UserData, now = new Date()) {
  const pending = getCronograma(dados).filter(
    (r) => !dados.refeicoesConcluidas.includes(r.key)
  );
  const { acordaMin, dormeMin } = getRotina(dados);
  let clock = now.getHours() * 60 + now.getMinutes();
  if (dormeMin >= 1440 && clock < acordaMin) clock += 1440;
  const due = pending.filter((r) => r.minutos <= clock);
  const meal = due.at(-1) || pending[0];
  return {
    meal,
    upcoming: Boolean(meal && meal.minutos > clock),
    earlier: due.length > 1,
  };
}

/** Similar calories only; macros are recalculated separately by the composer. */
export function replacementPortion(
  original: Alimento,
  grams: number,
  replacement: Alimento
) {
  if (
    !Number.isFinite(grams) ||
    grams <= 0 ||
    !Number.isFinite(original.kcal100g) ||
    original.kcal100g <= 0 ||
    !Number.isFinite(replacement.kcal100g) ||
    replacement.kcal100g <= 0
  )
    return null;
  const amount = Math.round((grams * original.kcal100g) / replacement.kcal100g);
  return amount >= 1 && amount <= 9999 ? amount : null;
}

export function replacementCandidates(
  original: Alimento,
  grams: number,
  catalog: Alimento[]
) {
  const profile = (food: Alimento) => {
    const energy = Math.max(1, food.prot * 4 + food.carbo * 4 + food.gord * 9);
    return [
      (food.prot * 4) / energy,
      (food.carbo * 4) / energy,
      (food.gord * 9) / energy,
    ];
  };
  const source = profile(original);
  const distance = (food: Alimento) =>
    profile(food).reduce((sum, v, i) => sum + Math.abs(v - source[i]), 0);
  return catalog
    .filter((food) => {
      const amount = replacementPortion(original, grams, food);
      return (
        food.id !== original.id &&
        food.nome !== original.nome &&
        amount !== null &&
        amount <= 1500
      );
    })
    .sort((a, b) => distance(a) - distance(b));
}

export function replaceHistoricalMeal(
  day: DayRecord,
  key: string,
  detail?: RefeicaoDetalhe
): DayRecord {
  const previous = day.refeicoesDetalhadas?.[key]?.calorias || 0;
  const entries = { ...day.refeicoesDetalhadas };
  if (detail) entries[key] = detail;
  else delete entries[key];
  return {
    ...day,
    caloriasConsumidas: Math.max(
      0,
      day.caloriasConsumidas - previous + (detail?.calorias || 0)
    ),
    refeicoesDetalhadas: entries,
  };
}

export function weightSeries(
  history: Record<string, string>,
  period: number | null,
  now = new Date()
) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (period) start.setDate(start.getDate() - period + 1);
  return Object.entries(history)
    .filter(
      ([date, value]) =>
        validPastOrToday(date, now) &&
        (!period || date >= localDayKey(start)) &&
        Number.isFinite(Number(value)) &&
        Number(value) > 0
    )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value: Number(value) }));
}
