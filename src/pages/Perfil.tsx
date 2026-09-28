import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export function Perfil() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const [mostrarModalSair, setMostrarModalSair] = useState(false);

  const confirmarSaida = () => {
    setDados({ nome: '' });
    setMostrarModalSair(false);
    navigate('/');
  };

  // --- CÁLCULO DE IMC ---
  const peso = Number(dados.peso) || 70;
  const alturaM = (Number(dados.altura) || 170) / 100;
  const imc = Number((peso / (alturaM * alturaM)).toFixed(1));
  
  let imcCategoria = 'Normal';
  let imcCor = 'text-green-400';
  
  if (imc < 18.5) {
    imcCategoria = 'Abaixo do peso';
    imcCor = 'text-blue-400';
  } else if (imc >= 25 && imc <= 29.9) {
    imcCategoria = 'Sobrepeso';
    imcCor = 'text-orange-400';
  } else if (imc >= 30) {
    imcCategoria = 'Obesidade';
    imcCor = 'text-red-500';
  }

  // Formatação do Objetivo
  let objetivoTexto = 'Manutenção';
  let objetivoCor = 'text-zinc-300';
  if (dados.objetivo === 'perder') {
    objetivoTexto = 'Emagrecimento';
    objetivoCor = 'text-green-400';
  } else if (dados.objetivo === 'ganhar') {
    objetivoTexto = 'Ganho de Massa';
    objetivoCor = 'text-blue-400';
  }

  // Inicial do nome para o Avatar
  const inicial = dados.nome ? dados.nome.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col px-6 py-8 text-white gap-6 relative pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh]">
      
      <header className="shrink-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Perfil</h1>
      </header>

      {/* --- CARTÃO DE CONTA (Avatar e Nome Limpo) --- */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl font-black text-zinc-950 shadow-md">
            {inicial}
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-bold text-white capitalize">{dados.nome || 'Utilizador'}</h2>
          </div>
        </div>
      </div>

      {/* --- SUAS MEDIDAS --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">Suas medidas</h3>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
          
          <div className="flex justify-between items-center p-4 border-b border-zinc-800/50">
            <span className="text-sm font-medium text-zinc-300">Peso atual</span>
            {/* O clique no peso continua ativo, mesmo sem o ícone do lápis */}
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/onboarding')}
            >
              <span className="text-sm font-bold text-white">{peso} kg</span>
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-zinc-800/50">
            <span className="text-sm font-medium text-zinc-300">Altura</span>
            <span className="text-sm font-bold text-white">{dados.altura || '--'} cm</span>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-zinc-800/50">
            <span className="text-sm font-medium text-zinc-300 flex items-center gap-1">
              IMC <span className="text-[10px] text-zinc-500 font-normal">({imcCategoria})</span>
            </span>
            <span className={`text-sm font-bold ${imcCor}`}>{imc}</span>
          </div>

          <div className="flex justify-between items-center p-4">
            <span className="text-sm font-medium text-zinc-300">Objetivo</span>
            <span className={`text-sm font-bold ${objetivoCor}`}>{objetivoTexto}</span>
          </div>

        </div>
      </div>

      {/* --- HORÁRIOS --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">Horários</h3>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
          
          <div className="flex justify-between items-center p-4 border-b border-zinc-800/50">
            <span className="text-sm font-medium text-zinc-300">Acordar</span>
            <span className="text-sm font-bold text-white">{dados.horaAcorda || '--:--'}</span>
          </div>

          <div className="flex justify-between items-center p-4">
            <span className="text-sm font-medium text-zinc-300">Dormir</span>
            <span className="text-sm font-bold text-white">{dados.horaDorme || '--:--'}</span>
          </div>

        </div>
      </div>

      {/* --- CONFIGURAÇÕES & AÇÕES --- */}
      <div className="shrink-0 flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">Conta</h3>
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
          
          <button 
            onClick={() => navigate('/onboarding')}
            className="flex justify-between items-center p-4 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors group w-full text-left"
          >
            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Refazer Configuração Inicial</span>
            <span className="text-zinc-600 group-hover:text-zinc-400">›</span>
          </button>

          <button 
            onClick={() => setMostrarModalSair(true)}
            className="flex justify-between items-center p-4 hover:bg-red-500/10 transition-colors group w-full text-left"
          >
            <span className="text-sm font-medium text-red-400/80 group-hover:text-red-400 transition-colors">Terminar Sessão</span>
          </button>

        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE SAÍDA */}
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