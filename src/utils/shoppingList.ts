import type { UserData } from "../store/useUserStore";
import { shoppingItems } from "./appFeatures";
import { normalizeFoodText } from "./foodSearch";
export type ShoppingItem = {
  id: string;
  nome: string;
  emoji: string;
  categoria: string;
  quantidade: string;
  unidade: string;
  comprado: boolean;
  emCasa: boolean;
  manual: boolean;
  quantidadeEditada: boolean;
  referenciaGramas: number;
  preparo?: string;
};
export type ShoppingListData = { dias: number; itens: ShoppingItem[] };
export function buildShoppingList(
  dados: UserData,
  days: number,
  previous: ShoppingItem[] = [],
): ShoppingItem[] {
  previous = consolidateShoppingItems(previous);
  const matched = new Set<string>();
  const period = Math.max(1, Math.min(30, Math.round(days) || 7));
  const generated = shoppingItems(dados).map((food) => {
    const volume = food.unidade === "ml";
    const id = `plano:${food.id}`;
    const grams = Math.round(food.grams * period);
    const existing =
      previous.find((item) => item.id === id) ||
      previous.find(
        (item) =>
          normalizeFoodText(item.nome) === normalizeFoodText(food.nome) &&
          (volume
            ? ["ml", "L"].includes(item.unidade)
            : !["ml", "L"].includes(item.unidade)) &&
          (!item.preparo || item.preparo === food.preparo),
      );
    if (existing) matched.add(existing.id);
    return {
      id,
      nome: food.nome,
      emoji: food.emoji,
      categoria: food.category,
      preparo: food.preparo,
      quantidade: existing?.quantidadeEditada
        ? existing.quantidade
        : grams
          ? String(grams >= 1000 ? Math.round(grams / 10) / 100 : grams)
          : "",
      unidade: existing?.quantidadeEditada
        ? existing.unidade
        : grams >= 1000
          ? volume
            ? "L"
            : "kg"
          : volume
            ? "ml"
            : "g",
      comprado:
        existing?.comprado ?? (dados.comprasMarcadas || []).includes(food.id),
      emCasa: existing?.emCasa ?? false,
      manual: false,
      quantidadeEditada: existing?.quantidadeEditada ?? false,
      referenciaGramas: grams,
    };
  });
  // Updating the plan must never discard manually added groceries or items already on the list.
  return [...generated, ...previous.filter((item) => !matched.has(item.id))];
}
/** Combine only compatible quantities with the same preparation and purchase state. */
export function consolidateShoppingItems(items: ShoppingItem[]) {
  const result: ShoppingItem[] = [];
  const unit = (u: string) =>
    (
      ({
        g: ["mass", 1],
        kg: ["mass", 1000],
        ml: ["volume", 1],
        L: ["volume", 1000],
        un: ["count", 1],
      }) as const
    )[u as "g" | "kg" | "ml" | "L" | "un"];
  for (const item of items) {
    const measure = unit(item.unidade),
      amount = Number(item.quantidade.replace(",", "."));
    const existing = result.find(
      (other) =>
        normalizeFoodText(other.nome) === normalizeFoodText(item.nome) &&
        (other.preparo || "") === (item.preparo || "") &&
        other.comprado === item.comprado &&
        other.emCasa === item.emCasa &&
        measure &&
        unit(other.unidade)?.[0] === measure[0] &&
        other.quantidade.trim() &&
        item.quantidade.trim(),
    );
    const otherAmount = existing
      ? Number(existing.quantidade.replace(",", "."))
      : NaN;
    if (
      existing &&
      measure &&
      Number.isFinite(amount) &&
      amount >= 0 &&
      Number.isFinite(otherAmount) &&
      otherAmount >= 0
    ) {
      const total =
        otherAmount * unit(existing.unidade)![1] + amount * measure[1];
      existing.unidade =
        measure[0] === "mass" ? "g" : measure[0] === "volume" ? "ml" : "un";
      existing.quantidade = String(Math.round(total * 1000) / 1000);
      existing.referenciaGramas += item.referenciaGramas || 0;
      existing.quantidadeEditada ||= item.quantidadeEditada;
      existing.manual ||= item.manual;
    } else result.push({ ...item });
  }
  return result;
}
export function shoppingProgress(items: ShoppingItem[]) {
  const bought = items.filter((i) => i.comprado && !i.emCasa).length;
  const pantry = items.filter((i) => i.emCasa).length;
  return {
    bought,
    pantry,
    pending: items.filter((i) => !i.comprado && !i.emCasa).length,
    missing: items.filter(
      (i) => !i.comprado && !i.emCasa && !i.quantidade.trim(),
    ).length,
  };
}
