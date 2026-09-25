import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. O Contrato: Agora agrupamos tudo dentro de "dados"
interface UserData {
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  sexo: string;
  objetivo: string;
}

interface UserStore {
  dados: UserData;
  setDados: (novosDados: Partial<UserData>) => void;
}

// 2. A Caixa de Memória
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
      },
      // Aqui usamos os ... (Spread) para atualizar só o que mudou, sem apagar o resto
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