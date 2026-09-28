import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export function Perfil() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  // Estado para controlar o modal de confirmação de saída
  const [mostrarModalSair, setMostrarModalSair] = useState(false);

  const confirmarSaida = () => {
    setDados({ nome: '' });
    setMostrarModalSair(false);
    navigate('/');
  };

  return (
    <div className="flex flex-col px-6 py-8 text-white gap-6 relative">
      <header>
        <p className="text-zinc-400 text-xs uppercase tracking-wider">Conta</p>
        <h1 className="text-2xl font-bold text-white capitalize">{dados.nome || 'Utilizador'}</h1>
      </header>

      {/* Cartão de Informações do Perfil */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 shadow-lg backdrop-blur-md">
        <div className="flex justify-between items-center py-2 border-b border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium">Idade</span>
          <span className="text-sm font-bold text-zinc-200">{dados.idade || '--'} anos</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-zinc-800/80">
          <span className="text-xs text-zinc-400 font-medium">Altura</span>
          <span className="text-sm font-bold text-zinc-200">{dados.altura || '--'} cm</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-zinc-400 font-medium">Sexo Biológico</span>
          <span className="text-sm font-bold text-zinc-200">{dados.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col gap-3 mt-2">
        <button 
          onClick={() => navigate('/onboarding')} 
          className="w-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold py-4 rounded-2xl text-sm transition-all border border-zinc-800 shadow-md flex items-center justify-center gap-2"
        >
          <span>⚙️</span> Refazer Configuração Inicial
        </button>
        
        <button 
          onClick={() => setMostrarModalSair(true)} 
          className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-4 rounded-2xl text-sm transition-all border border-red-500/20 shadow-md flex items-center justify-center gap-2"
        >
          <span>🚪</span> Terminar Sessão
        </button>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE SAÍDA (Estilo Moderno / Glassmorphism) */}
      {mostrarModalSair && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-5 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-400">
              🚪
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-white">Terminar Sessão?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Isto irá limpar os dados locais do dispositivo. Tens a certeza de que queres sair?
              </p>
            </div>

            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => setMostrarModalSair(false)} 
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-3.5 rounded-2xl font-semibold text-xs transition-colors border border-zinc-700/50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarSaida} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-lg shadow-red-500/20"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}