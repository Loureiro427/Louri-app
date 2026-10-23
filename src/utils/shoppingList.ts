import type { UserData } from "../store/useUserStore";
import { shoppingItems } from "./appFeatures";
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
};
export type ShoppingListData = { dias: number; itens: ShoppingItem[] };
export function buildShoppingList(
  dados: UserData,
  days: number,
  previous: ShoppingItem[] = []
): ShoppingItem[] {
  const period = Math.max(1, Math.min(30, Math.round(days) || 7));
  const generated = shoppingItems(dados).map((food) => {
    const id = `plano:${food.id}`;
    const grams = Math.round(food.grams * period);
    const existing = previous.find((item) => item.id === id);
    return {
      id,
      nome: food.nome,
      emoji: food.emoji,
      categoria: food.category,
      quantidade: existing?.quantidadeEditada
        ? existing.quantidade
        : grams
        ? String(grams >= 1000 ? Math.round(grams / 10) / 100 : grams)
        : "",
      unidade: existing?.quantidadeEditada
        ? existing.unidade
        : grams >= 1000
        ? "kg"
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
  return [
    ...generated,
    ...previous.filter((item) => !generated.some((g) => g.id === item.id)),
  ];
}
export function shoppingProgress(items: ShoppingItem[]) {
  const bought = items.filter((i) => i.comprado && !i.emCasa).length;
  const pantry = items.filter((i) => i.emCasa).length;
  return {
    bought,
    pantry,
    pending: items.filter((i) => !i.comprado && !i.emCasa).length,
    missing: items.filter(
      (i) => !i.comprado && !i.emCasa && !i.quantidade.trim()
    ).length,
  };
}
