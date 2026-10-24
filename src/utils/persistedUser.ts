import type { UserData } from "../store/useUserStore";
import { sanitizePortionPreference } from "./portionPreferences";

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
/** Keep the storage key and all valid legacy data; only fill missing/invalid containers. */
export function mergePersistedUser(
  value: unknown,
  defaults: UserData,
): UserData {
  if (!record(value)) return { ...defaults };
  const merged: Record<string, unknown> = { ...defaults, ...value };
  for (const key of [
    "nome",
    "idade",
    "peso",
    "altura",
    "sexo",
    "objetivo",
    "horaAcorda",
    "horaDorme",
    "ultimaData",
    "ultimoDiaPontuado",
  ] as const) {
    if (typeof value[key] === "number" && Number.isFinite(value[key]))
      merged[key] = String(value[key]);
    else if (typeof value[key] !== "string") merged[key] = defaults[key];
  }
  for (const key of ["aguaConsumida", "caloriasConsumidas", "streak"] as const)
    if (
      typeof value[key] !== "number" ||
      !Number.isFinite(value[key]) ||
      value[key] < 0
    )
      merged[key] = defaults[key];
  for (const key of [
    "favoritos",
    "refeicoesAtivas",
    "refeicoesConcluidas",
  ] as const)
    merged[key] = Array.isArray(value[key])
      ? value[key].filter((item) => typeof item === "string")
      : defaults[key];
  for (const key of [
    "historico",
    "historicoPeso",
    "ultimasPorcoes",
    "caloriasPorRefeicao",
    "macrosPorRefeicao",
  ] as const)
    if (!record(value[key])) merged[key] = defaults[key];
  merged.macrosConsumidos = {
    ...defaults.macrosConsumidos,
    ...(record(value.macrosConsumidos) ? value.macrosConsumidos : {}),
  };
  for (const key of ["temaEscuro", "notificacoes"] as const)
    if (typeof value[key] !== "boolean") merged[key] = defaults[key];
  if (typeof value.tutorialVisto !== "boolean") merged.tutorialVisto = false;
  merged.dicasVistas = Array.isArray(value.dicasVistas)
    ? value.dicasVistas.filter((item) => typeof item === "string")
    : [];
  merged.preferenciasMedida = record(value.preferenciasMedida)
    ? Object.fromEntries(
        Object.entries(value.preferenciasMedida).flatMap(([id, raw]) => {
          const preference = sanitizePortionPreference(raw);
          return preference ? [[id, preference]] : [];
        }),
      )
    : {};
  // Food preferences have several supported legacy formats. Leave them intact.
  if (value.alimentos === undefined || value.alimentos === null)
    merged.alimentos = defaults.alimentos;
  for (const key of [
    "alimentosPersonalizados",
    "refeicoesSalvas",
    "registrosAgua",
  ] as const)
    if (value[key] !== undefined && !Array.isArray(value[key]))
      merged[key] = [];
  return merged as unknown as UserData;
}
