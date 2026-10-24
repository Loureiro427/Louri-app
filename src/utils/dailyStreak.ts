import type { UserData } from "../store/useUserStore";
import { calculateWaterGoal, CONFIG_REFEICOES } from "./nutritionMath";

export const localDayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
export function previousDay(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return localDayKey(new Date(year, month - 1, day - 1, 12));
}
function normalizeLegacyDay(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
}
export function dailyGoals(dados: UserData) {
  const active = [...new Set(dados.refeicoesAtivas || [])].filter(
    (key) => key in CONFIG_REFEICOES
  );
  const completed = active.filter((key) =>
    (dados.refeicoesConcluidas || []).includes(key)
  ).length;
  const waterGoal = calculateWaterGoal(Number(dados.peso) || 70);
  const waterDone = (dados.aguaConsumida || 0) >= waterGoal;
  return {
    active: active.length,
    completed,
    waterGoal,
    waterDone,
    complete: active.length > 0 && completed === active.length && waterDone,
  };
}

/** Completed dates persist independently of later changes to weight or meal plans. */
export function reconcileDailyStreak(
  dados: UserData,
  now = new Date()
): UserData {
  const today = localDayKey(now);
  const yesterday = previousDay(today);
  const days = { ...dados.diasMetasConcluidas };
  if (!dados.diasMetasConcluidas) {
    // Preserve an existing streak once, including its legacy pt-BR date format.
    let key = normalizeLegacyDay(dados.ultimoDiaPontuado || "");
    const count = Math.min(36500, Math.max(0, Math.floor(dados.streak || 0)));
    if (key && key <= today)
      for (let i = 0; i < count; i++) {
        days[key] = true;
        key = previousDay(key);
      }
  }
  if (dados.ultimaData === today) {
    if (dailyGoals(dados).complete) days[today] = true;
    else delete days[today];
  }
  let cursor = days[today] ? today : yesterday;
  let streak = 0;
  while (days[cursor]) {
    streak++;
    cursor = previousDay(cursor);
  }
  const last =
    Object.keys(days)
      .filter((key) => days[key] && key <= today)
      .sort()
      .at(-1) || "";
  if (
    dados.diasMetasConcluidas &&
    dados.streak === streak &&
    dados.ultimoDiaPontuado === last &&
    Boolean(dados.diasMetasConcluidas[today]) === Boolean(days[today])
  )
    return dados;
  return {
    ...dados,
    diasMetasConcluidas: days,
    streak,
    ultimoDiaPontuado: last,
  };
}
