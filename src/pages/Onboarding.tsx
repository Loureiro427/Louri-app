import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

export function Onboarding() {
  const navigate = useNavigate();
  const setNome = useUserStore((state) => state.setNome); // Função para salvar na caixa global
  const nomeAtual = useUserStore((state) => state.nome);

  // Memória temporária da tela para o que o usuário está digitando
  const [inputValue, setInputValue] = useState(nomeAtual);

  const handleSave = () => {
    if (inputValue.trim() === '') {
      alert('Por favor, digite seu nome!');
      return;
    }
    setNome(inputValue); // Grava definitivamente
    navigate('/'); // Volta para a tela Home
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 gap-6 px-4">
      <h1 className="text-2xl font-bold text-green-400">Como podemos te chamar?</h1>
      
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Digite seu nome"
        className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none w-full max-w-xs transition-colors"
      />
      
      <Button onClick={handleSave}>
        Salvar e Continuar
      </Button>
    </div>
  );
}