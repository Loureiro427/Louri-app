import type { ShoppingListData } from "../utils/shoppingList";
import type { Alimento } from "../data/alimentos";
import { parseWeight } from "../utils/weightValidation";
import { mergePersistedUser } from "../utils/persistedUser";
import { reconcileDailyStreak } from "../utils/dailyStreak";
import {
  replaceHistoricalMeal,
  validPastOrToday,
} from "../utils/dailyExperience";
import { refeicoesPadrao } from "../utils/nutritionMath";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RefeicaoDetalhe {
  porcoes?: Record<string, number>;
  titulo: string;
  icone: string;
  calorias: number;
  alimentos: string[]; // IDs ou nomes dos alimentos consumidos
  macros: { proteina: number; carbo: number; gordura: number };
}

export interface DayRecord {
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesDetalhadas: Record<string, RefeicaoDetalhe>;
}

export interface UserData {
  tutorialVisto?: boolean;
  dicasVistas?: string[];
  listaCompras?: ShoppingListData;
  alimentosPersonalizados?: Alimento[];
  refeicoesSalvas?: {
    id: string;
    nome: string;
    porcoes: Record<string, number>;
  }[];
  comprasMarcadas?: string[];
  porcoesPlano?: Record<string, Record<string, number>>;
  lembretes?: {
    refeicoes: string[];
    aguaIntervalo: number;
    silencioInicio: string;
    silencioFim: string;
    humor?: boolean;
    motivacao?: boolean;
  };
  registrosAgua?: { quantidade: number; hora: string }[];
  favoritos: string[];
  ultimasPorcoes: Record<string, Record<string, number>>;
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  sexo: string;
  objetivo: string;
  horaAcorda: string;
  horaDorme: string;
  refeicoesAtivas: string[];
  horariosRefeicoes?: Record<string, string>;
  alimentos: Record<string, string[]>;
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesConcluidas: string[];
  caloriasPorRefeicao: Record<string, number>;
  macrosConsumidos: { proteina: number; carbo: number; gordura: number };
  macrosPorRefeicao: Record<
    string,
    { proteina: number; carbo: number; gordura: number }
  >;
  ultimaData: string;
  diasMetasConcluidas?: Record<string, boolean>;
  streak: number;
  ultimoDiaPontuado: string;
  temaEscuro: boolean;
  notificacoes: boolean;
  historicoPeso: Record<string, string>;
  historico: Record<string, DayRecord>; // NOVO: Histórico completo diário (Água, Calorias e Refeições)
}

interface UserStore {
  dados: UserData;
  mostrarNavbar: boolean;
  modalPesoAberto: boolean;
  setMostrarNavbar: (visivel: boolean) => void;
  setModalPesoAberto: (aberto: boolean) => void;
  toggleFavorito: (id: string) => void;
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void;
  desfazerUltimaAgua: () => void;
  registrarRefeicao: (
    refeicaoKey: string,
    tituloRef: string,
    iconeRef: string,
    calorias: number,
    alimentosConsumidos: string[],
    macros: { proteina: number; carbo: number; gordura: number },
    porcoes?: Record<string, number>,
    editar?: boolean,
  ) => void;
  desfazerRefeicao: (refeicaoKey: string) => void;
  zerarDieta: () => void;
  verificarViradaDeDia: () => void;
  verificarStreak: () => void;
  atualizarPeso: (novoPeso: string) => void;
  salvarPesoNaData: (date: string, peso: string) => boolean;
  corrigirDia: (
    date: string,
    change: { agua?: number; key?: string; refeicao?: RefeicaoDetalhe },
  ) => boolean;
}

const macrosZerados = { proteina: 0, carbo: 0, gordura: 0 };

// Função auxiliar para obter a data atual no formato YYYY-MM-DD
const getHojeStr = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(hoje.getDate()).padStart(2, "0")}`;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      dados: {
        favoritos: [],
        ultimasPorcoes: {},
        nome: "",
        idade: "",
        peso: "",
        altura: "",
        sexo: "",
        objetivo: "",
        horaAcorda: "",
        horaDorme: "",
        refeicoesAtivas: [...refeicoesPadrao],
        alimentos: {},
        aguaConsumida: 0,
        caloriasConsumidas: 0,
        refeicoesConcluidas: [],
        caloriasPorRefeicao: {},
        macrosConsumidos: { ...macrosZerados },
        macrosPorRefeicao: {},
        ultimaData: "",
        streak: 0,
        ultimoDiaPontuado: "",
        temaEscuro: true,
        notificacoes: true,
        historicoPeso: {},
        historico: {}, // Inicia vazio
      },
      mostrarNavbar: true,
      modalPesoAberto: false,
      setMostrarNavbar: (visivel) => set({ mostrarNavbar: visivel }),
      setModalPesoAberto: (aberto) => set({ modalPesoAberto: aberto }),
      salvarPesoNaData: (date, peso) => {
        const value = parseWeight(peso);
        if (!validPastOrToday(date) || value === null) return false;
        get().verificarViradaDeDia();
        set((state) => {
          const historicoPeso = {
            ...state.dados.historicoPeso,
            [date]: String(value),
          };
          const latest = Object.keys(state.dados.historicoPeso || {})
            .filter(
              (d) =>
                validPastOrToday(d) &&
                Number.isFinite(Number(historicoPeso[d])) &&
                Number(historicoPeso[d]) > 0,
            )
            .sort()
            .at(-1)!;
          return {
            dados: reconcileDailyStreak({
              ...state.dados,
              historicoPeso,
              peso:
                date === getHojeStr() || (latest && date >= latest)
                  ? String(value)
                  : state.dados.peso,
            }),
          };
        });
        return true;
      },
      corrigirDia: (date, change) => {
        if (!validPastOrToday(date) || date === getHojeStr()) return false;
        if (
          change.agua !== undefined &&
          (!Number.isFinite(change.agua) ||
            change.agua < 0 ||
            change.agua > 99999)
        )
          return false;
        const meal = change.refeicao;
        if (
          meal &&
          (!change.key ||
            !Number.isFinite(meal.calorias) ||
            meal.calorias < 0 ||
            (meal.calorias === 0 &&
              (!meal.alimentos.length ||
                !Object.values(meal.porcoes || {}).some(
                  (g) => g > 0 && Number.isFinite(g),
                ))) ||
            Object.values(meal.macros).some(
              (v) => !Number.isFinite(v) || v < 0,
            ))
        )
          return false;
        get().verificarViradaDeDia();
        set((state) => {
          let day = state.dados.historico[date] || {
            aguaConsumida: 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };
          if (change.agua !== undefined)
            day = { ...day, aguaConsumida: change.agua };
          if (change.key) day = replaceHistoricalMeal(day, change.key, meal);
          return {
            dados: {
              ...state.dados,
              historico: { ...state.dados.historico, [date]: day },
            },
          };
        });
        return true;
      },
      toggleFavorito: (id) =>
        set((state) => ({
          dados: {
            ...state.dados,
            favoritos: (state.dados.favoritos || []).includes(id)
              ? state.dados.favoritos.filter((v) => v !== id)
              : [...(state.dados.favoritos || []), id],
          },
        })),
      setDados: (novosDados) => {
        get().verificarViradaDeDia();
        set((state) => ({
          dados: reconcileDailyStreak({ ...state.dados, ...novosDados }),
        }));
      },

      atualizarPeso: (novoPeso) => {
        get().salvarPesoNaData(getHojeStr(), novoPeso);
      },

      adicionarAgua: (quantidade, metaMax) => {
        get().verificarViradaDeDia();
        if (!Number.isFinite(quantidade)) return;
        set((state) => {
          const atual = state.dados.aguaConsumida || 0;
          const novaAgua = Math.max(0, Math.min(metaMax, atual + quantidade));
          const hojeStr = getHojeStr();

          // Atualiza também no histórico do dia
          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || {
            aguaConsumida: 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };

          return {
            dados: {
              ...state.dados,
              aguaConsumida: novaAgua,
              registrosAgua:
                quantidade > 0 && novaAgua > atual
                  ? [
                      ...(state.dados.registrosAgua || []),
                      {
                        quantidade: novaAgua - atual,
                        hora: new Date().toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      },
                    ]
                  : state.dados.registrosAgua || [],
              historico: {
                ...historicoAtual,
                [hojeStr]: { ...diaAtualRegisto, aguaConsumida: novaAgua },
              },
            },
          };
        });
        get().verificarStreak();
      },

      desfazerUltimaAgua: () => {
        get().verificarViradaDeDia();
        const entries = get().dados.registrosAgua || [];
        const last = entries.at(-1);
        if (!last) return;
        get().adicionarAgua(-last.quantidade, 99999);
        set((state) => ({
          dados: { ...state.dados, registrosAgua: entries.slice(0, -1) },
        }));
      },
      zerarAgua: () => {
        get().verificarViradaDeDia();
        set((state) => {
          const hojeStr = getHojeStr();
          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || {
            aguaConsumida: 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };

          return {
            dados: {
              ...state.dados,
              aguaConsumida: 0,
              registrosAgua: [],
              historico: {
                ...historicoAtual,
                [hojeStr]: { ...diaAtualRegisto, aguaConsumida: 0 },
              },
            },
          };
        });
        get().verificarStreak();
      },

      registrarRefeicao: (
        refeicaoKey,
        tituloRef,
        iconeRef,
        calorias,
        alimentosConsumidos,
        macros,
        porcoes,
        editar = false,
      ) => {
        get().verificarViradaDeDia();
        if (
          !Number.isFinite(calorias) ||
          calorias < 0 ||
          (calorias === 0 &&
            (!alimentosConsumidos.length ||
              !Object.values(porcoes || {}).some(
                (g) => g > 0 && Number.isFinite(g),
              ))) ||
          Object.values(macros).some((v) => !Number.isFinite(v) || v < 0)
        )
          return;
        if (get().dados.refeicoesConcluidas.includes(refeicaoKey) && !editar)
          return;
        if (editar && !get().dados.refeicoesConcluidas.includes(refeicaoKey))
          return;
        set((state) => {
          const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
          const caloriasAtuais = state.dados.caloriasConsumidas || 0;
          const macrosAtuais = state.dados.macrosConsumidos || {
            ...macrosZerados,
          };
          const hojeStr = getHojeStr();

          const previousCalories = editar
            ? state.dados.caloriasPorRefeicao[refeicaoKey] || 0
            : 0;
          const previousMacros = editar
            ? state.dados.macrosPorRefeicao[refeicaoKey] || macrosZerados
            : macrosZerados;
          const novasCalorias = Math.max(
            0,
            caloriasAtuais - previousCalories + calorias,
          );
          const novasRefeicoesConcluidas = [
            ...new Set([...refeicoesAtuais, refeicaoKey]),
          ];

          const detalheRefeicao: RefeicaoDetalhe = {
            porcoes,
            titulo: tituloRef,
            icone: iconeRef,
            calorias,
            alimentos: alimentosConsumidos,
            macros,
          };

          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || {
            aguaConsumida: state.dados.aguaConsumida || 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };

          return {
            dados: {
              ...state.dados,
              ultimasPorcoes: porcoes
                ? {
                    ...(state.dados.ultimasPorcoes || {}),
                    [refeicaoKey.startsWith("refeicaoLivre_")
                      ? "livre"
                      : refeicaoKey]: { ...porcoes },
                  }
                : state.dados.ultimasPorcoes || {},
              caloriasConsumidas: novasCalorias,
              caloriasPorRefeicao: {
                ...state.dados.caloriasPorRefeicao,
                [refeicaoKey]: calorias,
              },
              macrosConsumidos: {
                proteina: Math.max(
                  0,
                  macrosAtuais.proteina -
                    previousMacros.proteina +
                    macros.proteina,
                ),
                carbo: Math.max(
                  0,
                  macrosAtuais.carbo - previousMacros.carbo + macros.carbo,
                ),
                gordura: Math.max(
                  0,
                  macrosAtuais.gordura -
                    previousMacros.gordura +
                    macros.gordura,
                ),
              },
              macrosPorRefeicao: {
                ...state.dados.macrosPorRefeicao,
                [refeicaoKey]: macros,
              },
              refeicoesConcluidas: novasRefeicoesConcluidas,
              historico: {
                ...historicoAtual,
                [hojeStr]: {
                  ...diaAtualRegisto,
                  caloriasConsumidas: novasCalorias,
                  refeicoesDetalhadas: {
                    ...diaAtualRegisto.refeicoesDetalhadas,
                    [refeicaoKey]: detalheRefeicao,
                  },
                },
              },
            },
          };
        });
        get().verificarStreak();
      },

      desfazerRefeicao: (refeicaoKey) => {
        get().verificarViradaDeDia();
        set((state) => {
          const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
          const caloriasAtuais = state.dados.caloriasConsumidas || 0;
          const macrosAtuais = state.dados.macrosConsumidos || {
            ...macrosZerados,
          };
          const hojeStr = getHojeStr();

          const caloriasParaSubtrair =
            state.dados.caloriasPorRefeicao?.[refeicaoKey] || 0;
          const macrosParaSubtrair = state.dados.macrosPorRefeicao?.[
            refeicaoKey
          ] || { ...macrosZerados };

          const novoHistCalorias = { ...state.dados.caloriasPorRefeicao };
          delete novoHistCalorias[refeicaoKey];

          const novoHistMacros = { ...state.dados.macrosPorRefeicao };
          delete novoHistMacros[refeicaoKey];

          const novasCalorias = Math.max(
            0,
            caloriasAtuais - caloriasParaSubtrair,
          );
          const novasRefeicoesConcluidas = refeicoesAtuais.filter(
            (r) => r !== refeicaoKey,
          );

          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || {
            aguaConsumida: state.dados.aguaConsumida || 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };

          const novasRefeicoesDetalhadas = {
            ...diaAtualRegisto.refeicoesDetalhadas,
          };
          delete novasRefeicoesDetalhadas[refeicaoKey];

          return {
            dados: {
              ...state.dados,
              caloriasConsumidas: novasCalorias,
              caloriasPorRefeicao: novoHistCalorias,
              macrosConsumidos: {
                proteina: Math.max(
                  0,
                  macrosAtuais.proteina - macrosParaSubtrair.proteina,
                ),
                carbo: Math.max(
                  0,
                  macrosAtuais.carbo - macrosParaSubtrair.carbo,
                ),
                gordura: Math.max(
                  0,
                  macrosAtuais.gordura - macrosParaSubtrair.gordura,
                ),
              },
              macrosPorRefeicao: novoHistMacros,
              refeicoesConcluidas: novasRefeicoesConcluidas,
              historico: {
                ...historicoAtual,
                [hojeStr]: {
                  ...diaAtualRegisto,
                  caloriasConsumidas: novasCalorias,
                  refeicoesDetalhadas: novasRefeicoesDetalhadas,
                },
              },
            },
          };
        });
        get().verificarStreak();
      },

      zerarDieta: () => {
        get().verificarViradaDeDia();
        set((state) => {
          const hojeStr = getHojeStr();
          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || {
            aguaConsumida: state.dados.aguaConsumida || 0,
            caloriasConsumidas: 0,
            refeicoesDetalhadas: {},
          };

          return {
            dados: {
              ...state.dados,
              caloriasConsumidas: 0,
              refeicoesConcluidas: [],
              caloriasPorRefeicao: {},
              macrosConsumidos: { ...macrosZerados },
              macrosPorRefeicao: {},
              historico: {
                ...historicoAtual,
                [hojeStr]: {
                  ...diaAtualRegisto,
                  caloriasConsumidas: 0,
                  refeicoesDetalhadas: {},
                },
              },
            },
          };
        });
        get().verificarStreak();
      },

      verificarStreak: () => {
        get().verificarViradaDeDia();
        set((state) => {
          const dados = reconcileDailyStreak(state.dados);
          return dados === state.dados ? state : { dados };
        });
      },

      verificarViradaDeDia: () =>
        set((state) => {
          const hoje = getHojeStr();
          const reconciled = reconcileDailyStreak(state.dados);
          if (state.dados.ultimaData && state.dados.ultimaData !== hoje) {
            return {
              dados: {
                ...state.dados,
                ...reconciled,
                ultimaData: hoje,
                aguaConsumida: 0,
                registrosAgua: [],
                caloriasConsumidas: 0,
                refeicoesConcluidas: [],
                caloriasPorRefeicao: {},
                macrosConsumidos: { ...macrosZerados },
                macrosPorRefeicao: {},
              },
            };
          } else if (!state.dados.ultimaData) {
            return {
              dados: reconcileDailyStreak({ ...reconciled, ultimaData: hoje }),
            };
          }
          return reconciled !== state.dados ? { dados: reconciled } : state;
        }),
    }),
    {
      name: "nutri-app-storage",
      version: 1,
      migrate: (persisted) => persisted as { dados: UserData },
      partialize: (state) => ({ dados: state.dados }),
      merge: (persisted, current) => {
        const saved = persisted as { dados?: Partial<UserData> } | undefined;
        return {
          ...current,
          dados: mergePersistedUser(saved?.dados, current.dados),
        };
      },
    },
  ),
);
