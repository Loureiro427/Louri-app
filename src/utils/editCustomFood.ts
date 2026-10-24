import type { Alimento } from "../data/alimentos";
import type { UserData } from "../store/useUserStore";

export function editedPortionFactor(before: Alimento, after: Alimento) {
  return (before.unidade || "g") === (after.unidade || "g")
    ? 1
    : (after.porcaoReferencia || 100) / (before.porcaoReferencia || 100);
}

export function editCustomFood(
  dados: UserData,
  id: string,
  replacement: Alimento,
): Partial<UserData> {
  const original = dados.alimentosPersonalizados?.find(
    (f) => f.id === id && !f.arquivado,
  );
  if (
    !original ||
    !id.startsWith("custom_") ||
    !replacement.id.startsWith("custom_") ||
    replacement.id === id ||
    dados.alimentosPersonalizados?.some((f) => f.id === replacement.id)
  )
    return {};
  const factor = editedPortionFactor(original, replacement);
  const remap = (portions: Record<string, number>) =>
    Object.fromEntries(
      Object.entries(portions).map(([key, value]) =>
        key === id
          ? [replacement.id, Math.min(9999, value * factor)]
          : [key, value],
      ),
    );
  const next = {
    ...replacement,
    emoji: original.emoji,
    imagem: original.imagem,
    arquivado: false,
  };
  // Old definitions and historical portions remain paired, including their original unit.
  return {
    preferenciasMedida: {
      ...Object.fromEntries(
        Object.entries(dados.preferenciasMedida || {}).filter(
          ([key]) => key !== id,
        ),
      ),
      ...(dados.preferenciasMedida?.[id]
        ? { [next.id]: dados.preferenciasMedida[id] }
        : {}),
    },
    alimentosPersonalizados: [
      ...dados.alimentosPersonalizados!.map((f) =>
        f.id === id ? { ...f, arquivado: true, substituidoPor: next.id } : f,
      ),
      next,
    ],
    favoritos: dados.favoritos.map((key) => (key === id ? next.id : key)),
    alimentos: Object.fromEntries(
      Object.entries(dados.alimentos).map(([key, ids]) => [
        key,
        ids.map((value) => (value === id ? next.id : value)),
      ]),
    ),
    porcoesPlano: Object.fromEntries(
      Object.entries(dados.porcoesPlano || {}).map(([key, p]) => [
        key,
        remap(p),
      ]),
    ),
    ultimasPorcoes: Object.fromEntries(
      Object.entries(dados.ultimasPorcoes).map(([key, p]) => [key, remap(p)]),
    ),
    refeicoesSalvas: dados.refeicoesSalvas?.map((r) => ({
      ...r,
      porcoes: remap(r.porcoes),
    })),
  };
}
