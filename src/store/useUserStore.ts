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
  qtdRefeicoes: string;
  alimentos: string[];
}

interface UserStore {
  dados: UserData;
  setDados: (novosDados: Partial<UserData>) => void;
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
        alimentos: [], // Garante que nunca começa indefinido
      },
      setDados: (novosDados) =>
        set((state) => ({
          dados: { ...state.dados, ...novosDados },
        })),
    }),
    {
      name: 'nutri-app-storage',
    }
  )
);