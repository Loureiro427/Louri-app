export type ReminderTarget = {
  route?: string;
  meal?: string;
  kind?: string;
  day?: string;
};
export function createReminderInbox() {
  let pending: ReminderTarget | null = null;
  const listeners = new Set<() => void>();
  return {
    get: () => pending,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    publish: (target: ReminderTarget) => {
      pending = { ...target };
      for (const listener of listeners) listener();
    },
    acknowledge: (target: ReminderTarget) => {
      if (pending !== target) return;
      pending = null;
      for (const listener of listeners) listener();
    },
  };
}
// Retains a tap until the destination is mounted; there is no timing assumption.
export const reminderInbox = createReminderInbox();
import type { UserData } from "../store/useUserStore";
import { getCronograma } from "./nutritionMath";
import { validPastOrToday } from "./dailyExperience";
import { localDayKey } from "./dailyStreak";
export function resolveReminder(
  dados: UserData,
  target: ReminderTarget,
  now = new Date(),
) {
  if (
    target.day &&
    validPastOrToday(target.day, now) &&
    target.day < localDayKey(now)
  )
    return { type: "history", day: target.day } as const;
  if (target.meal) {
    if (dados.refeicoesConcluidas.includes(target.meal))
      return { type: "record", key: target.meal } as const;
    const meal = getCronograma(dados).find((r) => r.key === target.meal);
    return meal
      ? ({ type: "meal", meal } as const)
      : ({ type: "unavailable" } as const);
  }
  return target.kind === "water"
    ? ({ type: "water" } as const)
    : ({ type: "none" } as const);
}
