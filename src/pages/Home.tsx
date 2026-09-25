import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

export function Home() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);
  const adicionarAgua = useUserStore((state) => state.adicionarAgua);
  const zerarAgua = useUserStore((state) => state.zerarAgua);

  const [mostrarModalDesfazer, setMostrarModalDesfazer] = useState(false);

  // Se o utilizador não tem nome salvo, mostra o ecrã de boas-vindas do Louri
  if (!dados.nome) {
    return (
      // overscroll-none impede que a tela seja "puxada" no celular
      <div className="flex flex-col min-h-[100dvh] bg-zinc-900 px-6 py-12 overflow-hidden overscroll-none">
        
        {/* Área Central com Logotipo e Emojis Orbitando */}
        <div className="flex-1 flex flex-col items-center justify-center mt-10 z-10">
          
          <div className="relative w-64 h-64 flex items-center justify-center mb-2">
            
            <div className="absolute inset-0 animate-[spin_25s_linear_infinite]">
              <div className="absolute top-4 left-0 text-3xl opacity-80">🔥</div>
              <div className="absolute top-0 right-4 text-4xl opacity-80">💪</div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-6 text-4xl opacity-80">🍎</div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-4 text-3xl opacity-80">🥗</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-80">🍊</div>
              <div className="absolute bottom-0 right-2 text-3xl opacity-80">👟</div>
            </div>

            <div className="text-8xl drop-shadow-lg z-10">🍃</div>
            
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight">
            Louri
          </h1>
        </div>

        {/* Área de Textos e Botões */}
        <div className="flex flex-col items-center text-center z-10 gap-6 mt-auto">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Sua dieta, do seu jeito!</h2>
            <p className="text-zinc-400 text-sm px-2">
              Descubra um app completo para organizar sua alimentação, rotina e progresso de forma simples e prática.
            </p>
          </div>

          <div className="w-full flex flex-col gap-4 mt-4">
            <button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-green-500 hover:bg-green-600 text-zinc-900 font-bold py-4 rounded-full transition-colors text-lg shadow-lg shadow-green-500/20"
            >
              Sou novo por aqui
            </button>
            <button
              onClick={() => alert('A funcionalidade de conta online será lançada em breve! Por enquanto, utilize a versão local.')}
              className="w-full bg-transparent border-2 border-green-500 text-green-500 font-bold py-4 rounded-full transition-colors text-lg hover:bg-green-500/10"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- LÓGICA DA DASHBOARD ---
  // Pega apenas a primeira palavra do nome (Ex: "Gabriel Loureiro" vira "Gabriel")
  const primeiroNome = dados.nome ? dados.nome.trim().split(' ')[0] : '';

  const pesoNumerico = Number(dados.peso) || 70;
  const metaAguaMl = Math.round(pesoNumerico * 35 / 1000) * 1000; 
  const metaLitros = (metaAguaMl / 1000).toFixed(1);
  
  const aguaAtualMl = dados.aguaConsumida || 0;
  const aguaLitros = (aguaAtualMl / 1000).toFixed(2);
  const progressoAgua = Math.min(100, Math.round((aguaAtualMl / metaAguaMl) * 100));
  
  const metaConcluida = aguaAtualMl >= metaAguaMl;

  const confirmarDesfazer = () => {
    zerarAgua();
    setMostrarModalDesfazer(false);
  };

  return (
    // min-h-[100dvh] garante preenchimento total e overscroll-none trava o arrasto da tela
    <div className="flex flex-col min-h-[100dvh] bg-zinc-900 px-6 py-8 text-white w-full max-w-md mx-auto relative overscroll-none overflow-x-hidden">
      
      {/* Cabeçalho do Painel */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <p className="text-zinc-400 text-xs uppercase tracking-wider">Bom dia,</p>
          <h1 className="text-2xl font-bold text-white capitalize">{primeiroNome}</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/onboarding')}
            className="text-xs bg-zinc-800 text-zinc-300 px-3 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-700 transition-colors"
          >
            Editar
          </button>
          
          <button 
            onClick={() => setDados({ nome: '' })}
            className="text-xs bg-red-500/10 text-red-400 px-3 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTEÚDO */}
      <div className="flex flex-col gap-5">
        
        {/* CARTÃO DE HIDRATAÇÃO DIÁRIA COM LIMITE DE META */}
        <div className={`rounded-3xl p-5 shadow-xl flex flex-col gap-4 border transition-all duration-500 ${
          metaConcluida 
            ? 'bg-gradient-to-br from-zinc-800 to-green-950/40 border-green-500/50 shadow-green-500/10' 
            : 'bg-zinc-800/80 border-zinc-700/80'
        }`}>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border transition-all ${
                metaConcluida 
                  ? 'bg-green-500/20 border-green-500/40 animate-bounce' 
                  : 'bg-blue-500/20 border-blue-500/30'
              }`}>
                {metaConcluida ? '🎉' : '💧'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Hidratação
                  {metaConcluida && <span className="text-xs bg-green-500 text-zinc-900 font-extrabold px-2 py-0.5 rounded-full">100%</span>}
                </h2>
                <p className="text-xs text-zinc-400">
                  {metaConcluida ? 'Parabéns! Meta atingida!' : 'Mantenha o metabolismo ativo'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`text-xl font-bold ${metaConcluida ? 'text-green-400' : 'text-blue-400'}`}>
                {aguaLitros}L
              </span>
              <span className="text-xs text-zinc-400 block">de {metaLitros}L</span>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 shadow-lg ${
                metaConcluida 
                  ? 'bg-green-500 shadow-green-500/50 w-full' 
                  : 'bg-blue-500 shadow-blue-500/50'
              }`}
              style={{ width: metaConcluida ? '100%' : `${progressoAgua}%` }}
            />
          </div>

          {/* Botões Rápidos */}
          <div className="grid grid-cols-4 gap-2 mt-1">
            <button
              onClick={() => adicionarAgua(200, metaAguaMl)}
              disabled={metaConcluida}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                metaConcluida 
                  ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-zinc-900 hover:bg-blue-600/20 border-zinc-700 hover:border-blue-500 text-zinc-200'
              }`}
            >
              <span className="text-sm">🥛</span>
              <span>+200ml</span>
            </button>

            <button
              onClick={() => adicionarAgua(300, metaAguaMl)}
              disabled={metaConcluida}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                metaConcluida 
                  ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-zinc-900 hover:bg-blue-600/20 border-zinc-700 hover:border-blue-500 text-zinc-200'
              }`}
            >
              <span className="text-sm">🥤</span>
              <span>+300ml</span>
            </button>

            <button
              onClick={() => adicionarAgua(500, metaAguaMl)}
              disabled={metaConcluida}
              className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 border ${
                metaConcluida 
                  ? 'bg-zinc-900/50 border-zinc-800 text-zinc-600 cursor-not-allowed' 
                  : 'bg-zinc-900 hover:bg-blue-600/20 border-zinc-700 hover:border-blue-500 text-zinc-200'
              }`}
            >
              <span className="text-sm">🍶</span>
              <span>+500ml</span>
            </button>

            <button
              onClick={() => setMostrarModalDesfazer(true)}
              title="Zerar registo de água"
              className="bg-zinc-900 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500 text-zinc-400 hover:text-red-400 py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5"
            >
              <span className="text-sm">🔄</span>
              <span>Desfazer</span>
            </button>
          </div>
        </div>

        {/* RESUMO RÁPIDO DA ROTINA */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400 uppercase font-medium">Foco Atual</span>
            <span className="text-sm font-bold text-green-400 uppercase">
              {dados.objetivo === 'perder' ? 'Emagrecimento' : dados.objetivo === 'ganhar' ? 'Ganho de Massa' : 'Manutenção'}
            </span>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs text-zinc-400 uppercase font-medium">Horários</span>
            <span className="text-xs text-zinc-200">⏰ {dados.horaAcorda || '07:00'} ➔ 🌙 {dados.horaDorme || '22:00'}</span>
          </div>
        </div>

      </div>

      {/* MODAL DE CONFIRMAÇÃO DE DESFAZER */}
      {mostrarModalDesfazer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-white">Tem certeza?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Deseja realmente zerar o registo da sua hidratação diária?
              </p>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setMostrarModalDesfazer(false)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarDesfazer}
                className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3 rounded-xl text-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}