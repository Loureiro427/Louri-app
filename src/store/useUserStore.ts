import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  notificacoes: boolean; // NOVO: Guarda se as notificações estão ativas
}

interface UserStore {
  dados: UserData;
  mostrarNavbar: boolean;
  setMostrarNavbar: (visivel: boolean) => void;
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void;
  registrarRefeicao: (refeicaoKey: string, calorias: number, alimentosConsumidos: string[], macros: { proteina: number; carbo: number; gordura: number }) => void;
  desfazerRefeicao: (refeicaoKey: string) => void;
  zerarDieta: () => void;
  verificarViradaDeDia: () => void;
  verificarStreak: () => void;
}

const macrosZerados = { proteina: 0, carbo: 0, gordura: 0 };
const refeicoesPadrao = ['cafeManha', 'almoco', 'lancheTarde', 'janta'];

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
        notificacoes: true, // Inicia ativado por predefinição
      },
      mostrarNavbar: true,
      setMostrarNavbar: (visivel) => set({ mostrarNavbar: visivel }),
      setDados: (novosDados) => set((state) => ({ dados: { ...state.dados, ...novosDados } })),
      
      adicionarAgua: (quantidade, metaMax) => {
        set((state) => {
          const atual = state.dados.aguaConsumida || 0;
          return { dados: { ...state.dados, aguaConsumida: Math.max(0, Math.min(metaMax, atual + quantidade)) } };
        });
        get().verificarStreak();
      },
      
      zerarAgua: () => set((state) => ({ dados: { ...state.dados, aguaConsumida: 0 } })),
      
      registrarRefeicao: (refeicaoKey, calorias, alimentosConsumidos, macros) => {
        set((state) => {
          const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
          const caloriasAtuais = state.dados.caloriasConsumidas || 0;
          const macrosAtuais = state.dados.macrosConsumidos || { ...macrosZerados };
          
          return {
            dados: {
              ...state.dados,
              caloriasConsumidas: caloriasAtuais + calorias,
              caloriasPorRefeicao: { ...state.dados.caloriasPorRefeicao, [refeicaoKey]: calorias },
              macrosConsumidos: {
                proteina: macrosAtuais.proteina + macros.proteina,
                carbo: macrosAtuais.carbo + macros.carbo,
                gordura: macrosAtuais.gordura + macros.gordura,
              },
              macrosPorRefeicao: { ...state.dados.macrosPorRefeicao, [refeicaoKey]: macros },
              refeicoesConcluidas: [...refeicoesAtuais, refeicaoKey],
              alimentos: { ...state.dados.alimentos, [refeicaoKey]: alimentosConsumidos }
            },
          };
        });
        get().verificarStreak();
      },
      
      desfazerRefeicao: (refeicaoKey) => set((state) => {
        const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
        const caloriasAtuais = state.dados.caloriasConsumidas || 0;
        const macrosAtuais = state.dados.macrosConsumidos || { ...macrosZerados };
        
        const caloriasParaSubtrair = state.dados.caloriasPorRefeicao?.[refeicaoKey] || 0;
        const macrosParaSubtrair = state.dados.macrosPorRefeicao?.[refeicaoKey] || { ...macrosZerados };
        
        const novoHistCalorias = { ...state.dados.caloriasPorRefeicao };
        delete novoHistCalorias[refeicaoKey];
        
        const novoHistMacros = { ...state.dados.macrosPorRefeicao };
        delete novoHistMacros[refeicaoKey];

        return {
          dados: {
            ...state.dados,
            caloriasConsumidas: Math.max(0, caloriasAtuais - caloriasParaSubtrair),
            caloriasPorRefeicao: novoHistCalorias,
            macrosConsumidos: {
              proteina: Math.max(0, macrosAtuais.proteina - macrosParaSubtrair.proteina),
              carbo: Math.max(0, macrosAtuais.carbo - macrosParaSubtrair.carbo),
              gordura: Math.max(0, macrosAtuais.gordura - macrosParaSubtrair.gordura),
            },
            macrosPorRefeicao: novoHistMacros,
            refeicoesConcluidas: refeicoesAtuais.filter((r) => r !== refeicaoKey),
          },
        };
      }),

      zerarDieta: () => set((state) => ({
        dados: { ...state.dados, caloriasConsumidas: 0, refeicoesConcluidas: [], caloriasPorRefeicao: {}, macrosConsumidos: { ...macrosZerados }, macrosPorRefeicao: {} }
      })),

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
        } else if (!state.dados.ultimoDiaPontuado) {
          novoStreak = 1;
        } else {
          novoStreak = 1;
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
        const hoje = new Date().toLocaleDateString('pt-BR');
        if (state.dados.ultimaData && state.dados.ultimaData !== hoje) {
          return {
            dados: { 
              ...state.dados, ultimaData: hoje, aguaConsumida: 0, caloriasConsumidas: 0, 
              refeicoesConcluidas: [], caloriasPorRefeicao: {}, macrosConsumidos: { ...macrosZerados }, macrosPorRefeicao: {}
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