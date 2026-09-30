import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { configurarNotificacoesNativas } from '../services/notificationService';

export function Perfil() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);
  const setModalPesoAberto = useUserStore((state: any) => state.setModalPesoAberto); // <-- NOVA IMPORTAÇÃO

  const temaEscuro = dados.temaEscuro ?? true;
  const notificacoes = dados.notificacoes ?? true;

  const [mostrarModalSair, setMostrarModalSair] = useState(false);
  const [modalSuporte, setModalSuporte] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  
  const [estrelas, setEstrelas] = useState(0);
  const [enviouFeedback, setEnviouFeedback] = useState(false);

  const confirmarSaida = () => {
    setDados({ nome: '', aguaConsumida: 0, caloriasConsumidas: 0, refeicoesConcluidas: [] }); // Limpa os dados principais da sessão
    setMostrarModalSair(false);
    navigate('/');
  };

  const fecharFeedback = () => {
    setModalFeedback(false);
    setEstrelas(0);
    setEnviouFeedback(false);
  };

  const peso = Number(dados.peso) || 70;
  const alturaM = (Number(dados.altura) || 170) / 100;
  const imc = Number((peso / (alturaM * alturaM)).toFixed(1));
  
  let imcCategoria = 'Normal';
  let imcCor = 'text-green-500';
  
  if (imc < 18.5) {
    imcCategoria = 'Abaixo do peso';
    imcCor = 'text-blue-500';
  } else if (imc >= 25 && imc <= 29.9) {
    imcCategoria = 'Sobrepeso';
    imcCor = 'text-orange-500';
  } else if (imc >= 30) {
    imcCategoria = 'Obesidade';
    imcCor = 'text-red-500';
  }

  let objetivoTexto = 'Manutenção';
  let objetivoCor = temaEscuro ? 'text-zinc-300' : 'text-zinc-700';
  if (dados.objetivo === 'perder') {
    objetivoTexto = 'Emagrecimento';
  } else if (dados.objetivo === 'ganhar') {
    objetivoTexto = 'Ganho de Massa';
  }

  const inicial = dados.nome ? dados.nome.charAt(0).toUpperCase() : 'U';

  return (
    <div className={`flex flex-col px-6 py-8 gap-6 relative pb-28 max-w-md mx-auto w-full overflow-y-auto overscroll-none custom-scrollbar h-[100dvh] transition-colors duration-300 ${
      temaEscuro ? 'text-white' : 'text-zinc-900'
    }`}>
      
      <header className="shrink-0 flex justify-between items-center">
        <h1 className={`text-2xl font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Perfil</h1>
      </header>

      <div className={`border rounded-3xl p-5 flex items-center justify-between shadow-lg shrink-0 transition-colors ${
        temaEscuro ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-2xl font-black text-zinc-950 shadow-md">
            {inicial}
          </div>
          <div className="flex flex-col justify-center">
            <h2 className={`text-xl font-bold capitalize ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{dados.nome || 'Utilizador'}</h2>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Suas medidas</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <div className={`flex justify-between items-center p-4 border-b ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Peso atual</span>
            {/* 👇 AQUI: Agora abre o modal global de peso em vez de ir para o onboarding */}
            <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setModalPesoAberto(true)}>
              <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'} underline decoration-green-500/50 decoration-2 underline-offset-4`}>{peso} kg</span>
            </div>
          </div>

          <div className={`flex justify-between items-center p-4 border-b ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Altura</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{dados.altura || '--'} cm</span>
          </div>

          <div className={`flex justify-between items-center p-4 border-b ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <span className={`text-sm font-medium flex items-center gap-1 ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>
              IMC <span className="text-[10px] text-zinc-500 font-normal">({imcCategoria})</span>
            </span>
            <span className={`text-sm font-bold ${imcCor}`}>{imc}</span>
          </div>

          <div className="flex justify-between items-center p-4">
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Objetivo</span>
            <span className={`text-sm font-bold ${objetivoCor}`}>{objetivoTexto}</span>
          </div>

        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Horários</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <div className={`flex justify-between items-center p-4 border-b ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Acordar</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{dados.horaAcorda || '--:--'}</span>
          </div>

          <div className="flex justify-between items-center p-4">
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Dormir</span>
            <span className={`text-sm font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>{dados.horaDorme || '--:--'}</span>
          </div>

        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Suporte</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <button 
            onClick={() => setModalFeedback(true)}
            className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${
              temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'
            }`}
          >
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Enviar feedback</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

          <button 
            onClick={() => setModalSuporte(true)}
            className={`flex justify-between items-center p-4 transition-colors group w-full text-left ${
              temaEscuro ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
            }`}
          >
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Precisas de ajuda?</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Geral</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <div className={`flex justify-between items-center p-4 border-b ${temaEscuro ? 'border-zinc-800/50' : 'border-zinc-100'}`}>
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Notificações</span>
            <button 
              onClick={() => {
                const novoEstado = !notificacoes;
                setDados({ notificacoes: novoEstado });
                configurarNotificacoesNativas(); 
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notificacoes ? 'bg-green-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${notificacoes ? 'translate-x-6 bg-zinc-950' : 'translate-x-0 bg-white'}`} />
            </button>
          </div>

          <div className="flex justify-between items-center p-4">
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Tema Escuro</span>
            <button 
              onClick={() => setDados({ temaEscuro: !temaEscuro })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${temaEscuro ? 'bg-green-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${temaEscuro ? 'translate-x-6 bg-zinc-950' : 'translate-x-0 bg-white'}`} />
            </button>
          </div>

        </div>
      </div>

      <div className="shrink-0 flex flex-col gap-3">
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Conta</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <button 
            onClick={() => navigate('/onboarding')}
            className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${
              temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'
            }`}
          >
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Refazer Configuração Inicial</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

          <button 
            onClick={() => setMostrarModalSair(true)}
            className={`flex justify-between items-center p-4 transition-colors group w-full text-left ${
              temaEscuro ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
            }`}
          >
            <span className="text-sm font-medium text-red-500">Terminar Sessão</span>
          </button>

        </div>
      </div>

      {modalSuporte && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="text-4xl">🛠️</div>
            <h3 className="text-lg font-bold">Aviso de Versão Beta</h3>
            <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Por enquanto não temos um suporte ativo, pois o aplicativo ainda se encontra em fase Beta. Obrigado pela compreensão!
            </p>
            <button onClick={() => setModalSuporte(false)} className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3 rounded-xl text-xs mt-2 transition-colors">Entendido</button>
          </div>
        </div>,
        document.body
      )}

      {modalFeedback && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            
            {enviouFeedback ? (
              <>
                <div className="text-4xl animate-bounce">💖</div>
                <h3 className="text-lg font-bold">Muito Obrigado!</h3>
                <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  O teu feedback foi registado com sucesso e ajuda-nos a evoluir o Louri Fit.
                </p>
                <button onClick={fecharFeedback} className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3 rounded-xl text-xs mt-2 transition-colors">Fechar</button>
              </>
            ) : (
              <>
                <div className="text-3xl">⭐</div>
                <h3 className="text-lg font-bold">Avalie o Louri Fit</h3>
                <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  O que estás a achar da tua experiência com o aplicativo?
                </p>
                
                <div className="flex justify-center gap-2 my-2">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <button
                      key={estrela}
                      onClick={() => setEstrelas(estrela)}
                      className={`text-2xl transition-transform active:scale-125 ${estrela <= estrelas ? 'text-yellow-400' : temaEscuro ? 'text-zinc-700' : 'text-zinc-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <button onClick={fecharFeedback} className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-colors ${
                    temaEscuro ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}>Cancelar</button>
                  <button 
                    onClick={() => { if (estrelas > 0) setEnviouFeedback(true); }}
                    disabled={estrelas === 0}
                    className={`flex-1 font-bold py-3 rounded-xl text-xs transition-all ${
                      estrelas > 0 ? 'bg-green-500 hover:bg-green-400 text-zinc-950 shadow-md' : temaEscuro ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    Enviar
                  </button>
                </div>
              </>
            )}

          </div>
        </div>,
        document.body
      )}

      {mostrarModalSair && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-5 text-center shadow-2xl ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-500">
              🚪
            </div>
            
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold">Terminar Sessão?</h3>
              <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Isto irá limpar os dados locais do dispositivo. Tens a certeza de que queres sair?
              </p>
            </div>

            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => setMostrarModalSair(false)} 
                className={`flex-1 py-3.5 rounded-2xl font-semibold text-xs transition-colors border ${
                  temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'
                }`}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarSaida} 
                className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3.5 rounded-2xl text-xs transition-colors shadow-lg shadow-red-500/25"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}