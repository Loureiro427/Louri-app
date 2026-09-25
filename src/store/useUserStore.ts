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
}

interface UserStore {
  dados: UserData;
  setDados: (novosDados: Partial<UserData>) => void;
  adicionarAgua: (quantidade: number, metaMax: number) => void;
  zerarAgua: () => void; // NOVO: Para resetar ou desfazer tudo com segurança
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
        alimentos: {
          cafeManha: [],
          almoco: [],
          cafeTarde: [],
          janta: [],
        },
        aguaConsumida: 0,
      },
      setDados: (novosDados) =>
        set((state) => ({
          dados: { ...state.dados, ...novosDados },
        })),
      adicionarAgua: (quantidade, metaMax) =>
        set((state) => {
          const novoValor = state.dados.aguaConsumida + quantidade;
          // Impede que fique abaixo de 0 e impede que ultrapasse a meta diária
          const valorLimitado = Math.max(0, Math.min(metaMax, novoValor));
          return {
            dados: {
              ...state.dados,
              aguaConsumida: valorLimitado,
            },
          };
        }),
      zerarAgua: () =>
        set((state) => ({
          dados: {
            ...state.dados,
            aguaConsumida: 0,
          },
        })),
    }),
    {
      name: 'nutri-app-storage',
    }
  )
);