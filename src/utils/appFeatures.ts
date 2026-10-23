import { DICIONARIO_ALIMENTOS, todosAlimentos } from "../data/alimentos";
import type { UserData } from "../store/useUserStore";
import { localDayKey, previousDay } from "./dailyStreak";
export function mealCatalog(
  dados: UserData,
  key?: string,
  keepIds: string[] = []
) {
  const selected =
    key && Array.isArray(dados.alimentos?.[key]) ? dados.alimentos[key] : [];
  const source = fullCatalog(dados);
  return [
    ...[...keepIds, ...selected]
      .map((id) => source.find((f) => f.id === id))
      .filter((f): f is (typeof source)[number] => Boolean(f)),
    ...(key ? DICIONARIO_ALIMENTOS[key] || [] : []),
    ...todosAlimentos,
    ...(dados.alimentosPersonalizados || []),
  ].filter(
    (a, i, all) =>
      all.findIndex(
        (b) =>
          b.id === a.id || (!a.id.startsWith("custom_") && b.nome === a.nome)
      ) === i
  );
}
export function fullCatalog(dados: UserData) {
  return [
    ...Object.values(DICIONARIO_ALIMENTOS).flat(),
    ...(dados.alimentosPersonalizados || []),
  ].filter((a, i, all) => all.findIndex((b) => b.id === a.id) === i);
}
export function recipeForCatalog(
  dados: UserData,
  portions: Record<string, number>,
  key?: string
) {
  const source = fullCatalog(dados),
    target = mealCatalog(dados, key, Object.keys(portions));
  const result: Record<string, number> = {};
  for (const [id, grams] of Object.entries(portions)) {
    const original = source.find((f) => f.id === id);
    const food =
      target.find((f) => f.id === id) ||
      target.find((f) => f.nome === original?.nome);
    if (food && Number.isFinite(grams) && grams > 0)
      result[food.id] = (result[food.id] || 0) + grams;
  }
  return result;
}
export function weeklySummary(dados: UserData, end = localDayKey(new Date())) {
  const days = [end];
  for (let i = 1; i < 7; i++) days.unshift(previousDay(days[0]));
  return days.map((date) => {
    const saved = dados.historico?.[date];
    const today = date === dados.ultimaData;
    return {
      date,
      complete: Boolean(dados.diasMetasConcluidas?.[date]),
      water: today ? dados.aguaConsumida || 0 : saved?.aguaConsumida || 0,
      calories: today
        ? dados.caloriasConsumidas || 0
        : saved?.caloriasConsumidas || 0,
      meals: today
        ? (dados.refeicoesConcluidas || []).length
        : Object.keys(saved?.refeicoesDetalhadas || {}).length,
      weight: dados.historicoPeso?.[date],
    };
  });
}
export function shoppingItems(dados: UserData) {
  const catalog = fullCatalog(dados);
  const ids = [
    ...new Set(
      (dados.refeicoesAtivas || []).flatMap((key) =>
        Array.isArray(dados.alimentos?.[key]) ? dados.alimentos[key] : []
      )
    ),
  ];
  const items = ids
    .map((id) => catalog.find((food) => food.id === id))
    .filter((food) => Boolean(food))
    .map((food) => {
      const name = food!.nome;
      const category = /fruta|banana|maçã|mamão|legume|salada|batata/i.test(
        name
      )
        ? "Hortifruti"
        : /frango|carne|peixe|ovo|omelete/i.test(name)
        ? "Proteínas"
        : /leite|iogurte|queijo/i.test(name)
        ? "Laticínios"
        : "Mercearia";
      const grams = (dados.refeicoesAtivas || []).reduce(
        (sum, key) => sum + (dados.porcoesPlano?.[key]?.[food!.id] || 0),
        0
      );
      return { ...food!, category, grams };
    });
  const grouped = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    const key = item.id.startsWith("custom_") ? item.id : item.nome;
    const existing = grouped.get(key);
    grouped.set(
      key,
      existing ? { ...existing, grams: existing.grams + item.grams } : item
    );
  }
  return [...grouped.values()];
}
