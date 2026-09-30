import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RefeicaoDetalhe {
  titulo: string;
  icone: string;
  calorias: number;
  alimentos: string[]; // IDs ou nomes dos alimentos consumidos
  macros: { proteina: number; carbo: number; gordura: number };
}

interface DayRecord {
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesDetalhadas: Record<string, RefeicaoDetalhe>;
}

interface UserData {
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  sexo: string;
  objetivo: string;
  horaAcorda: string;
  horaDorme: string;
  refeicoesAtivas: string[];
  alimentos: Record<string, string[]>;
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesConcluidas: string[];
  caloriasPorRefeicao: Record<string, number>;
  macrosConsumidos: { proteina: number; carbo: number; gordura: number };
  macrosPorRefeicao: Record<string, { proteina: number; carbo: number; gordura: number }>;
  ultimaData: string;
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
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void;
  registrarRefeicao: (refeicaoKey: string, tituloRef: string, iconeRef: string, calorias: number, alimentosConsumidos: string[], macros: { proteina: number; carbo: number; gordura: number }) => void;
  desfazerRefeicao: (refeicaoKey: string) => void;
  zerarDieta: () => void;
  verificarViradaDeDia: () => void;
  verificarStreak: () => void;
  atualizarPeso: (novoPeso: string) => void; 
}

const macrosZerados = { proteina: 0, carbo: 0, gordura: 0 };
const refeicoesPadrao = ['cafeManha', 'almoco', 'lancheTarde', 'janta'];

// Função auxiliar para obter a data atual no formato YYYY-MM-DD
const getHojeStr = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      dados: {
        nome: '',
        idade: '',
        peso: '',
        altura: '',
        sexo: '',
        objetivo: '',
        horaAcorda: '',
        horaDorme: '',
        refeicoesAtivas: [...refeicoesPadrao],
        alimentos: {},
        aguaConsumida: 0,
        caloriasConsumidas: 0,
        refeicoesConcluidas: [],
        caloriasPorRefeicao: {},
        macrosConsumidos: { ...macrosZerados },
        macrosPorRefeicao: {},
        ultimaData: '',
        streak: 0,
        ultimoDiaPontuado: '',
        temaEscuro: true,
        notificacoes: true,
        historicoPeso: {}, 
        historico: {}, // Inicia vazio
      },
      mostrarNavbar: true,
      modalPesoAberto: false,
      setMostrarNavbar: (visivel) => set({ mostrarNavbar: visivel }),
      setModalPesoAberto: (aberto) => set({ modalPesoAberto: aberto }),
      setDados: (novosDados) => set((state) => ({ dados: { ...state.dados, ...novosDados } })),
      
      atualizarPeso: (novoPeso) => set((state) => {
        const hojeStr = getHojeStr();
        return {
          dados: {
            ...state.dados,
            peso: novoPeso,
            historicoPeso: { ...state.dados.historicoPeso, [hojeStr]: novoPeso }
          }
        };
      }),

      adicionarAgua: (quantidade, metaMax) => {
        set((state) => {
          const atual = state.dados.aguaConsumida || 0;
          const novaAgua = Math.max(0, Math.min(metaMax, atual + quantidade));
          const hojeStr = getHojeStr();

          // Atualiza também no histórico do dia
          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || { aguaConsumida: 0, caloriasConsumidas: 0, refeicoesDetalhadas: {} };

          return { 
            dados: { 
              ...state.dados, 
              aguaConsumida: novaAgua,
              historico: {
                ...historicoAtual,
                [hojeStr]: { ...diaAtualRegisto, aguaConsumida: novaAgua }
              }
            } 
          };
        });
        get().verificarStreak();
      },
      
      zerarAgua: () => set((state) => {
        const hojeStr = getHojeStr();
        const historicoAtual = state.dados.historico || {};
        const diaAtualRegisto = historicoAtual[hojeStr] || { aguaConsumida: 0, caloriasConsumidas: 0, refeicoesDetalhadas: {} };

        return { 
          dados: { 
            ...state.dados, 
            aguaConsumida: 0,
            historico: {
              ...historicoAtual,
              [hojeStr]: { ...diaAtualRegisto, aguaConsumida: 0 }
            }
          } 
        };
      }),
      
      registrarRefeicao: (refeicaoKey, tituloRef, iconeRef, calorias, alimentosConsumidos, macros) => {
        set((state) => {
          const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
          const caloriasAtuais = state.dados.caloriasConsumidas || 0;
          const macrosAtuais = state.dados.macrosConsumidos || { ...macrosZerados };
          const hojeStr = getHojeStr();

          const novasCalorias = caloriasAtuais + calorias;
          const novasRefeicoesConcluidas = [...refeicoesAtuais, refeicaoKey];

          const detalheRefeicao: RefeicaoDetalhe = {
            titulo: tituloRef,
            icone: iconeRef,
            calorias,
            alimentos: alimentosConsumidos,
            macros
          };

          const historicoAtual = state.dados.historico || {};
          const diaAtualRegisto = historicoAtual[hojeStr] || { aguaConsumida: state.dados.aguaConsumida || 0, caloriasConsumidas: 0, refeicoesDetalhadas: {} };

          return {
            dados: {
              ...state.dados,
              caloriasConsumidas: novasCalorias,
              caloriasPorRefeicao: { ...state.dados.caloriasPorRefeicao, [refeicaoKey]: calorias },
              macrosConsumidos: {
                proteina: macrosAtuais.proteina + macros.proteina,
                carbo: macrosAtuais.carbo + macros.carbo,
                gordura: macrosAtuais.gordura + macros.gordura,
              },
              macrosPorRefeicao: { ...state.dados.macrosPorRefeicao, [refeicaoKey]: macros },
              refeicoesConcluidas: novasRefeicoesConcluidas,
              alimentos: { ...state.dados.alimentos, [refeicaoKey]: alimentosConsumidos },
              historico: {
                ...historicoAtual,
                [hojeStr]: {
                  ...diaAtualRegisto,
                  caloriasConsumidas: novasCalorias,
                  refeicoesDetalhadas: {
                    ...diaAtualRegisto.refeicoesDetalhadas,
                    [refeicaoKey]: detalheRefeicao
                  }
                }
              }
            },
          };
        });
        get().verificarStreak();
      },
      
      desfazerRefeicao: (refeicaoKey) => set((state) => {
        const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
        const caloriasAtuais = state.dados.caloriasConsumidas || 0;
        const macrosAtuais = state.dados.macrosConsumidos || { ...macrosZerados };
        const hojeStr = getHojeStr();
        
        const caloriasParaSubtrair = state.dados.caloriasPorRefeicao?.[refeicaoKey] || 0;
        const macrosParaSubtrair = state.dados.macrosPorRefeicao?.[refeicaoKey] || { ...macrosZerados };
        
        const novoHistCalorias = { ...state.dados.caloriasPorRefeicao };
        delete novoHistCalorias[refeicaoKey];
        
        const novoHistMacros = { ...state.dados.macrosPorRefeicao };
        delete novoHistMacros[refeicaoKey];

        const novasCalorias = Math.max(0, caloriasAtuais - caloriasParaSubtrair);
        const novasRefeicoesConcluidas = refeicoesAtuais.filter((r) => r !== refeicaoKey);

        const historicoAtual = state.dados.historico || {};
        const diaAtualRegisto = historicoAtual[hojeStr] || { aguaConsumida: state.dados.aguaConsumida || 0, caloriasConsumidas: 0, refeicoesDetalhadas: {} };
        
        const novasRefeicoesDetalhadas = { ...diaAtualRegisto.refeicoesDetalhadas };
        delete novasRefeicoesDetalhadas[refeicaoKey];

        return {
          dados: {
            ...state.dados,
            caloriasConsumidas: novasCalorias,
            caloriasPorRefeicao: novoHistCalorias,
            macrosConsumidos: {
              proteina: Math.max(0, macrosAtuais.proteina - macrosParaSubtrair.proteina),
              carbo: Math.max(0, macrosAtuais.carbo - macrosParaSubtrair.carbo),
              gordura: Math.max(0, macrosAtuais.gordura - macrosParaSubtrair.gordura),
            },
            macrosPorRefeicao: novoHistMacros,
            refeicoesConcluidas: novasRefeicoesConcluidas,
            historico: {
              ...historicoAtual,
              [hojeStr]: {
                ...diaAtualRegisto,
                caloriasConsumidas: novasCalorias,
                refeicoesDetalhadas: novasRefeicoesDetalhadas
              }
            }
          },
        };
      }),

      zerarDieta: () => set((state) => {
        const hojeStr = getHojeStr();
        const historicoAtual = state.dados.historico || {};
        const diaAtualRegisto = historicoAtual[hojeStr] || { aguaConsumida: state.dados.aguaConsumida || 0, caloriasConsumidas: 0, refeicoesDetalhadas: {} };

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
                refeicoesDetalhadas: {}
              }
            }
          }
        };
      }),

      verificarStreak: () => set((state) => {
        const pesoNum = Number(state.dados.peso) || 70;
        const metaAguaMl = Math.round((pesoNum * 35) / 1000) * 1000;
        
        const ativas = state.dados.refeicoesAtivas && state.dados.refeicoesAtivas.length > 0 
          ? state.dados.refeicoesAtivas 
          : refeicoesPadrao;
        
        const concluidas = state.dados.refeicoesConcluidas || [];
        const todasRefeicoesFeitas = ativas.every((r) => concluidas.includes(r));
        const aguaBatida = (state.dados.aguaConsumida || 0) >= metaAguaMl;

        if (!todasRefeicoesFeitas || !aguaBatida) return state;

        const hoje = new Date().toLocaleDateString('pt-BR');
        if (state.dados.ultimoDiaPontuado === hoje) return state;

        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const ontemStr = ontem.toLocaleDateString('pt-BR');

        let novoStreak = 1;
        if (state.dados.ultimoDiaPontuado === ontemStr) {
          novoStreak = (state.dados.streak || 0) + 1;
        }

        return {
          dados: {
            ...state.dados,
            streak: novoStreak,
            ultimoDiaPontuado: hoje,
          }
        };
      }),

      verificarViradaDeDia: () => set((state) => {
        const hoje = getHojeStr();
        if (state.dados.ultimaData && state.dados.ultimaData !== hoje) {
          return {
            dados: { 
              ...state.dados, 
              ultimaData: hoje, 
              aguaConsumida: 0, 
              caloriasConsumidas: 0, 
              refeicoesConcluidas: [], 
              caloriasPorRefeicao: {}, 
              macrosConsumidos: { ...macrosZerados }, 
              macrosPorRefeicao: {}
            }
          };
        } else if (!state.dados.ultimaData) {
          return { dados: { ...state.dados, ultimaData: hoje } };
        }
        return state;
      }),
    }),
    { name: 'nutri-app-storage' }
  )
);