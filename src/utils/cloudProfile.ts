import type { UserData } from "../store/useUserStore";
import { mergePersistedUser } from "./persistedUser";

const fields = new Set([
  "preferenciasMedida",
  "tutorialVisto",
  "dicasVistas",
  "listaCompras",
  "alimentosPersonalizados",
  "refeicoesSalvas",
  "comprasMarcadas",
  "porcoesPlano",
  "lembretes",
  "registrosAgua",
  "favoritos",
  "ultimasPorcoes",
  "nome",
  "idade",
  "peso",
  "altura",
  "sexo",
  "objetivo",
  "horaAcorda",
  "horaDorme",
  "refeicoesAtivas",
  "horariosRefeicoes",
  "alimentos",
  "aguaConsumida",
  "caloriasConsumidas",
  "refeicoesConcluidas",
  "caloriasPorRefeicao",
  "macrosConsumidos",
  "macrosPorRefeicao",
  "ultimaData",
  "diasMetasConcluidas",
  "streak",
  "ultimoDiaPontuado",
  "temaEscuro",
  "historicoPeso",
  "historico",
]);
export const CLOUD_MAX_BYTES = 800_000;

function clean(value: unknown, depth = 0): unknown {
  if (depth > 30) throw new Error("Os dados têm uma estrutura inválida.");
  if (Array.isArray(value)) return value.map((item) => clean(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key, item]) =>
            !["imagem", "__proto__", "constructor", "prototype"].includes(
              key,
            ) && item !== undefined,
        )
        .map(([key, item]) => [key, clean(item, depth + 1)]),
    );
  }
  return value;
}

/** Photos and device notification permission never leave this device. */
export function encodeCloudProfile(data: UserData): string {
  const payload = JSON.stringify(
    clean(
      Object.fromEntries(
        Object.entries(data).filter(([key]) => fields.has(key)),
      ),
    ),
  );
  if (new TextEncoder().encode(payload).length > CLOUD_MAX_BYTES)
    throw new Error(
      "Seu histórico ultrapassou o limite de sincronização. Ele continua salvo neste aparelho.",
    );
  return payload;
}

export function decodeCloudProfile(
  payload: string,
  defaults: UserData,
  local?: UserData,
): UserData {
  if (new TextEncoder().encode(payload).length > CLOUD_MAX_BYTES)
    throw new Error("Dados da conta inválidos.");
  const parsed: unknown = JSON.parse(payload);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Dados da conta inválidos.");
  const safe = clean(
    Object.fromEntries(
      Object.entries(parsed).filter(([key]) => fields.has(key)),
    ),
  );
  const data = mergePersistedUser(safe, structuredClone(defaults));
  const images = new Map(
    (local?.alimentosPersonalizados || []).map((food) => [
      food.id,
      food.imagem,
    ]),
  );
  data.alimentosPersonalizados = data.alimentosPersonalizados?.map((food) => ({
    ...food,
    imagem: images.get(food.id),
  }));
  data.notificacoes = local?.notificacoes ?? defaults.notificacoes;
  return data;
}
