import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AlimentosPorRefeicao {
  cafeManha: string[];
  almoco: string[];
  cafeTarde: string[];
  janta: string[];
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
  qtdRefeicoes: string;
  alimentos: AlimentosPorRefeicao;
  aguaConsumida: number;
  caloriasConsumidas: number;
  refeicoesConcluidas: string[];
  caloriasPorRefeicao: Record<string, number>;
  // NOVO: Guarda os macros totais e por refeição
  macrosConsumidos: { proteina: number; carbo: number; gordura: number };
  macrosPorRefeicao: Record<string, { proteina: number; carbo: number; gordura: number }>;
  ultimaData: string;
}

interface UserStore {
  dados: UserData;
  mostrarNavbar: boolean;
  setMostrarNavbar: (visivel: boolean) => void;
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void;
  // NOVO: Recebe os macros ao registar
  registrarRefeicao: (refeicaoKey: string, calorias: number, alimentosConsumidos: string[], macros: { proteina: number; carbo: number; gordura: number }) => void;
  desfazerRefeicao: (refeicaoKey: string) => void;
  zerarDieta: () => void;
  verificarViradaDeDia: () => void;
}

const macrosZerados = { proteina: 0, carbo: 0, gordura: 0 };

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      dados: {
        nome: '', idade: '', peso: '', altura: '', sexo: '', objetivo: '',
        horaAcorda: '', horaDorme: '', qtdRefeicoes: '4',
        alimentos: { cafeManha: [], almoco: [], cafeTarde: [], janta: [] },
        aguaConsumida: 0, caloriasConsumidas: 0, refeicoesConcluidas: [],
        caloriasPorRefeicao: {},
        macrosConsumidos: { ...macrosZerados }, // Inicializa a 0
        macrosPorRefeicao: {},
        ultimaData: '', 
      },
      mostrarNavbar: true,
      setMostrarNavbar: (visivel) => set({ mostrarNavbar: visivel }),
      setDados: (novosDados) => set((state) => ({ dados: { ...state.dados, ...novosDados } })),
      
      adicionarAgua: (quantidade, metaMax) => set((state) => {
        const atual = state.dados.aguaConsumida || 0;
        return { dados: { ...state.dados, aguaConsumida: Math.max(0, Math.min(metaMax, atual + quantidade)) } };
      }),
      
      zerarAgua: () => set((state) => ({ dados: { ...state.dados, aguaConsumida: 0 } })),
      
      registrarRefeicao: (refeicaoKey, calorias, alimentosConsumidos, macros) => set((state) => {
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
      }),
      
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