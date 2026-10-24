import type { UserData } from "../store/useUserStore";

export function removeCustomFood(
  dados: UserData,
  id: string,
): Partial<UserData> {
  if (
    !id.startsWith("custom_") ||
    !dados.alimentosPersonalizados?.some((f) => f.id === id)
  )
    return {};
  const clean = (p: Record<string, number>) =>
    Object.fromEntries(Object.entries(p).filter(([key]) => key !== id));
  // Keep the nutritional definition so previously recorded meals remain editable.
  return {
    preferenciasMedida: Object.fromEntries(
      Object.entries(dados.preferenciasMedida || {}).filter(
        ([key]) => key !== id,
      ),
    ),
    alimentosPersonalizados: dados.alimentosPersonalizados.map((f) =>
      f.id === id ? { ...f, arquivado: true } : f,
    ),
    favoritos: dados.favoritos.filter((key) => key !== id),
    alimentos: Object.fromEntries(
      Object.entries(dados.alimentos).map(([key, ids]) => [
        key,
        ids.filter((value) => value !== id),
      ]),
    ),
    porcoesPlano: Object.fromEntries(
      Object.entries(dados.porcoesPlano || {}).map(([key, p]) => [
        key,
        clean(p),
      ]),
    ),
    ultimasPorcoes: Object.fromEntries(
      Object.entries(dados.ultimasPorcoes).map(([key, p]) => [key, clean(p)]),
    ),
    refeicoesSalvas: dados.refeicoesSalvas
      ?.map((r) => ({ ...r, porcoes: clean(r.porcoes) }))
      .filter((r) => Object.keys(r.porcoes).length > 0),
  };
}
