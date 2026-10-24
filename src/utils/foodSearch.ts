import type { Alimento } from "../data/alimentos";
import type { UserData } from "../store/useUserStore";
import { localDayKey } from "./dailyStreak";
export const normalizeFoodText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const popular: Record<string, string[]> = {
  pao: ["pao frances", "pao de sal", "cacetinho", "paozinho"],
  batatadoce: ["batata doce"],
  mandioca_cozida: ["mandioca", "aipim", "macaxeira"],
  biscoito: ["biscoito", "bolacha"],
  macarrao: ["macarrao", "massa"],
};
export function foodMatches(food: Alimento, query: string) {
  const tokens = normalizeFoodText(query).split(" ").filter(Boolean);
  const words = normalizeFoodText(
    [
      food.nome,
      food.preparo || "",
      ...(food.aliases || []),
      ...(!food.id.startsWith("custom_") ? popular[food.id] || [] : []),
    ].join(" "),
  );
  return tokens.every((token) => words.includes(token));
}
export function recentFoodRanks(dados: UserData) {
  const ranks = new Map<string, number>();
  for (const date of Object.keys(dados.historico || {})
    .filter((day) => day <= localDayKey(new Date()))
    .sort()
    .reverse()
    .slice(0, 30)) {
    for (const meal of Object.values(
      dados.historico[date]?.refeicoesDetalhadas || {},
    ).reverse()) {
      for (const id of Object.keys(meal.porcoes || {}))
        if (!ranks.has(id)) ranks.set(id, ranks.size);
    }
  }
  return ranks;
}
export function samePortions(
  a: Record<string, number>,
  b: Record<string, number>,
) {
  const positive = (p: Record<string, number>) =>
    Object.entries(p).filter(([, g]) => Number.isFinite(g) && g > 0);
  const entries = positive(a),
    other = positive(b);
  return (
    entries.length === other.length && entries.every(([id, g]) => b[id] === g)
  );
}
