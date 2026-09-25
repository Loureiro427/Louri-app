import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1. O Contrato (TypeScript): Dizemos o que a nossa "caixa" vai guardar
interface UserStore {
  nome: string;
  setNome: (novoNome: string) => void;
}

// 2. A Criação da Caixa:
export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      nome: '', // Começa vazio
      setNome: (novoNome) => set({ nome: novoNome }), // Função que atualiza o nome
    }),
    {
      name: 'nutri-app-storage', // Nome do "arquivo" invisível salvo no celular
    }
  )
);