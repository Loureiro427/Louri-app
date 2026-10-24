import type { Alimento } from "../data/alimentos";
import type { UserData } from "../store/useUserStore";
import { recipeForCatalog } from "./appFeatures";
import { localDayKey } from "./dailyStreak";

// Existing approximate portions, matched by exact food name (never to custom foods).
// Spoons refer to the prepared food; oats use a full tablespoon.
export function householdMeasure(food: Alimento) {
  if (food.id.startsWith("custom_")) return undefined;
  const measures: Record<
    string,
    { label: string; grams: number; choice?: string }
  > = {
    "Pão Francês": { label: "pão de 50 g", grams: 50, choice: "Unidades" },
    Ovo: { label: "unidade de 50 g", grams: 50, choice: "Unidades" },
    "Ovo Cozido": { label: "unidade de 50 g", grams: 50, choice: "Unidades" },
    Banana: { label: "unidade de 80 g", grams: 80, choice: "Unidades" },
    Maçã: { label: "unidade de 130 g", grams: 130, choice: "Unidades" },
    Arroz: { label: "colher de sopa cheia", grams: 25, choice: "Colheres" },
    Feijão: { label: "concha média", grams: 120, choice: "Conchas" },
    Aveia: { label: "colher de sopa cheia", grams: 15, choice: "Colheres" },
    "Açúcar refinado": {
      label: "colher de sopa cheia",
      grams: 30,
      choice: "Colheres",
    },
  };
  return measures[food.nome];
}

export function lastMealPortions(dados: UserData, key: string) {
  const saved = dados.ultimasPorcoes?.[key];
  if (saved && Object.keys(saved).length) {
    const portions = recipeForCatalog(dados, saved, key);
    if (Object.keys(portions).length) return portions;
  }
  const today = localDayKey(new Date());
  for (const date of Object.keys(dados.historico || {})
    .filter((d) => d <= today)
    .sort()
    .reverse()) {
    const meals = Object.entries(
      dados.historico[date]?.refeicoesDetalhadas || {},
    );
    const meal = meals
      .reverse()
      .find(([id]) =>
        key === "livre" ? id.startsWith("refeicaoLivre_") : id === key,
      )?.[1];
    if (meal?.porcoes) {
      const portions = recipeForCatalog(dados, meal.porcoes, key);
      if (Object.keys(portions).length) return portions;
    }
  }
  return {};
}
