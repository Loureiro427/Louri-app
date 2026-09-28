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
  caloriasPorRefeicao: Record<string, number>; // NOVO: Guarda as calorias exatas consumidas em cada refeição do dia
  ultimaData: string;
}

interface UserStore {
  dados: UserData;
  mostrarNavbar: boolean;
  setMostrarNavbar: (visivel: boolean) => void;
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void;
  registrarRefeicao: (refeicaoKey: string, calorias: number, alimentosConsumidos: string[]) => void;
  desfazerRefeicao: (refeicaoKey: string) => void; // O parâmetro 'calorias' não é mais necessário aqui
  zerarDieta: () => void;
  verificarViradaDeDia: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      dados: {
        nome: '',
        idade: '',
        peso: '',
        altura: '',
        sexo: '',
        objetivo: '',
        horaAcorda: '',
        horaDorme: '',
        qtdRefeicoes: '4',
        alimentos: { cafeManha: [], almoco: [], cafeTarde: [], janta: [] },
        aguaConsumida: 0,
        caloriasConsumidas: 0,
        refeicoesConcluidas: [],
        caloriasPorRefeicao: {}, // Inicializa vazio
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
      
      registrarRefeicao: (refeicaoKey, calorias, alimentosConsumidos) => set((state) => {
        const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
        const caloriasAtuais = state.dados.caloriasConsumidas || 0;
        const historicoCalorias = state.dados.caloriasPorRefeicao || {};
        
        return {
          dados: {
            ...state.dados,
            caloriasConsumidas: caloriasAtuais + calorias,
            caloriasPorRefeicao: { ...historicoCalorias, [refeicaoKey]: calorias }, // Grava as calorias exatas
            refeicoesConcluidas: [...refeicoesAtuais, refeicaoKey],
            alimentos: { ...state.dados.alimentos, [refeicaoKey]: alimentosConsumidos }
          },
        };
      }),
      
      desfazerRefeicao: (refeicaoKey) => set((state) => {
        const refeicoesAtuais = state.dados.refeicoesConcluidas || [];
        const caloriasAtuais = state.dados.caloriasConsumidas || 0;
        const historicoCalorias = state.dados.caloriasPorRefeicao || {};
        
        // Pega as calorias exatas que foram registadas anteriormente
        const caloriasParaSubtrair = historicoCalorias[refeicaoKey] || 0;
        
        // Remove esta refeição da memória de calorias de hoje
        const novoHistoricoCalorias = { ...historicoCalorias };
        delete novoHistoricoCalorias[refeicaoKey];

        return {
          dados: {
            ...state.dados,
            caloriasConsumidas: Math.max(0, caloriasAtuais - caloriasParaSubtrair),
            caloriasPorRefeicao: novoHistoricoCalorias,
            refeicoesConcluidas: refeicoesAtuais.filter((r) => r !== refeicaoKey),
          },
        };
      }),

      zerarDieta: () => set((state) => ({
        dados: { ...state.dados, caloriasConsumidas: 0, refeicoesConcluidas: [], caloriasPorRefeicao: {} }
      })),

      verificarViradaDeDia: () => set((state) => {
        const hoje = new Date().toLocaleDateString('pt-BR');
        if (state.dados.ultimaData && state.dados.ultimaData !== hoje) {
          return {
            dados: { 
              ...state.dados, 
              ultimaData: hoje, 
              aguaConsumida: 0, 
              caloriasConsumidas: 0, 
              refeicoesConcluidas: [],
              caloriasPorRefeicao: {} // Limpa a memória de calorias no novo dia
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