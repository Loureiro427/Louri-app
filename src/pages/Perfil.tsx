import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { configurarNotificacoesNativas } from '../services/notificationService';

// WEBHOOKS REAIS DO DISCORD
const DISCORD_WEBHOOK_SUPORTE = 'https://discord.com/api/webhooks/1558244272577323171/k7iuhL43yojq3T1ywiYNX_7ox-fmAmQon95KbgXaLN90QX6u80dBHf7b7qJ2wYz53mrj';
const DISCORD_WEBHOOK_IDEIA = 'https://discord.com/api/webhooks/1558252865355776023/Ta3vOrPXttmhgBu7CG4HXTNKJeO2Bdp35HQ94BYfRcbUJ1H2llYmMcZZDeI03DETUHJV';

// TEMPO DE ESPERA (30 MINUTOS EM MILISSEGUNDOS)
const COOLDOWN_MS = 30 * 60 * 1000;

export function Perfil() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);
  const setModalPesoAberto = useUserStore((state: any) => state.setModalPesoAberto);

  const temaEscuro = dados.temaEscuro ?? true;
  const notificacoes = dados.notificacoes ?? true;

  const [mostrarModalSair, setMostrarModalSair] = useState(false);
  const [modalSuporte, setModalSuporte] = useState(false);
  const [modalIdeia, setModalIdeia] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [modalTermos, setModalTermos] = useState(false);
  
  // Estados do formulário de Suporte
  const [suporteTipo, setSuporteTipo] = useState('Dúvida');
  const [suporteContato, setSuporteContato] = useState('');
  const [mensagemSuporte, setMensagemSuporte] = useState('');
  const [enviandoSuporte, setEnviandoSuporte] = useState(false);
  const [sucessoSuporte, setSucessoSuporte] = useState(false);
  const [erroSuporte, setErroSuporte] = useState('');

  // Estados do formulário de Ideias
  const [mensagemIdeia, setMensagemIdeia] = useState('');
  const [enviandoIdeia, setEnviandoIdeia] = useState(false);
  const [sucessoIdeia, setSucessoIdeia] = useState(false);
  const [erroIdeia, setErroIdeia] = useState('');

  // Estados do Feedback
  const [estrelas, setEstrelas] = useState(0);
  const [enviouFeedback, setEnviouFeedback] = useState(false);

  // --- FUNÇÃO: ENVIAR SUPORTE ---
  const enviarSuporteDiscord = async () => {
    const contato = suporteContato.trim();
    
    // VERIFICAÇÃO DE COOLDOWN (30 MINUTOS)
    const ultimoEnvio = localStorage.getItem('lourifit_last_suporte');
    if (ultimoEnvio && Date.now() - Number(ultimoEnvio) < COOLDOWN_MS) {
      const minutosRestantes = Math.ceil((COOLDOWN_MS - (Date.now() - Number(ultimoEnvio))) / 60000);
      setErroSuporte(`Por favor, aguarda ${minutosRestantes} minuto(s) antes de enviar outro relatório.`);
      return;
    }

    if (!contato) {
      setErroSuporte('Por favor, insere um email ou telemóvel para contacto.');
      return;
    }

    // VALIDAÇÃO RIGOROSA DO CONTACTO
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Exige texto@texto.texto
    const hasLetters = /[a-zA-Z]/.test(contato);
    const isEmailFormat = contato.includes('@');

    if (isEmailFormat || hasLetters) {
      if (!emailRegex.test(contato)) {
        setErroSuporte('Insere um email válido (exemplo: nome@email.com).');
        return;
      }
      if (contato.length > 90) {
        setErroSuporte('O email não pode ter mais de 90 caracteres.');
        return;
      }
    } else {
      // Se não tem letras nem @, deve ser telemóvel
      const digits = contato.replace(/\D/g, ''); 
      if (digits.length < 8 || digits.length > 15) {
        setErroSuporte('O telemóvel deve conter apenas números (entre 8 a 15 dígitos).');
        return;
      }
    }

    if (!mensagemSuporte.trim()) {
      setErroSuporte('Por favor, descreve o teu problema ou dúvida.');
      return;
    }

    setEnviandoSuporte(true);
    setErroSuporte('');

    let embedColor = 0x3b82f6; // Azul (Dúvida)
    if (suporteTipo === 'Erro/Bug') embedColor = 0xef4444; // Vermelho
    if (suporteTipo === 'Outro') embedColor = 0x64748b; // Cinzento

    const payload = {
      username: 'Louri Fit - Suporte Beta',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
      embeds: [{
        title: '🚨 Novo Reporte de Utilizador',
        color: embedColor,
        fields: [
          { name: '👤 Utilizador', value: dados.nome || 'Não informado', inline: true },
          { name: '📞 Contacto', value: contato, inline: true },
          { name: '🏷️ Assunto', value: suporteTipo, inline: true },
          { name: '⚖️ Perfil', value: `${dados.peso || '--'}kg / ${dados.altura || '--'}cm - ${dados.objetivo || 'ND'}`, inline: false },
          { name: '💬 Mensagem', value: mensagemSuporte, inline: false }
        ],
        footer: { text: `Louri Fit Beta • ${new Date().toLocaleString('pt-BR')}` }
      }]
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_SUPORTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        localStorage.setItem('lourifit_last_suporte', Date.now().toString()); // Grava o cooldown
        setSucessoSuporte(true);
        setMensagemSuporte('');
        setSuporteContato('');
      } else {
        setErroSuporte('Falha ao enviar. Verifica a tua ligação à internet.');
      }
    } catch (err) {
      setErroSuporte('Erro de rede ao ligar ao servidor de suporte.');
    } finally {
      setEnviandoSuporte(false);
    }
  };

  // --- FUNÇÃO: ENVIAR IDEIA ---
  const enviarIdeiaDiscord = async () => {
    // VERIFICAÇÃO DE COOLDOWN (30 MINUTOS)
    const ultimoEnvio = localStorage.getItem('lourifit_last_ideia');
    if (ultimoEnvio && Date.now() - Number(ultimoEnvio) < COOLDOWN_MS) {
      const minutosRestantes = Math.ceil((COOLDOWN_MS - (Date.now() - Number(ultimoEnvio))) / 60000);
      setErroIdeia(`Por favor, aguarda ${minutosRestantes} minuto(s) antes de enviar outra ideia.`);
      return;
    }

    if (!mensagemIdeia.trim()) {
      setErroIdeia('Por favor, escreve a tua ideia antes de enviar.');
      return;
    }

    setEnviandoIdeia(true);
    setErroIdeia('');

    const payload = {
      username: 'Louri Fit - Ideias & Sugestões',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/427/427735.png', 
      embeds: [{
        title: '💡 Nova Ideia de Utilizador!',
        color: 0xfacc15, // Dourado
        fields: [
          { name: '👤 Utilizador', value: dados.nome || 'Não informado', inline: true },
          { name: '💬 A Ideia', value: mensagemIdeia, inline: false }
        ],
        footer: { text: `Louri Fit Beta • ${new Date().toLocaleString('pt-BR')}` }
      }]
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_IDEIA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        localStorage.setItem('lourifit_last_ideia', Date.now().toString()); // Grava o cooldown
        setSucessoIdeia(true);
        setMensagemIdeia('');
      } else {
        setErroIdeia('Falha ao enviar. Verifica a tua ligação à internet.');
      }
    } catch (err) {
      setErroIdeia('Erro de rede.');
    } finally {
      setEnviandoIdeia(false);
    }
  };

  const fecharSuporte = () => {
    setModalSuporte(false);
    setMensagemSuporte('');
    setSuporteContato('');
    setSucessoSuporte(false);
    setErroSuporte('');
  };

  const fecharIdeia = () => {
    setModalIdeia(false);
    setMensagemIdeia('');
    setSucessoIdeia(false);
    setErroIdeia('');
  };

  const fecharFeedback = () => {
    setModalFeedback(false);
    setEstrelas(0);
    setEnviouFeedback(false);
  };

  const confirmarSaida = () => {
    setDados({ nome: '', aguaConsumida: 0, caloriasConsumidas: 0, refeicoesConcluidas: [] });
    setMostrarModalSair(false);
    navigate('/');
  };

  const peso = Number(dados.peso) || 70;
  const alturaM = (Number(dados.altura) || 170) / 100;
  const imc = Number((peso / (alturaM * alturaM)).toFixed(1));
  
  let imcCategoria = 'Normal';
  let imcCor = 'text-green-500';
  if (imc < 18.5) { imcCategoria = 'Abaixo do peso'; imcCor = 'text-blue-500'; } 
  else if (imc >= 25 && imc <= 29.9) { imcCategoria = 'Sobrepeso'; imcCor = 'text-orange-500'; } 
  else if (imc >= 30) { imcCategoria = 'Obesidade'; imcCor = 'text-red-500'; }

  let objetivoTexto = 'Manutenção';
  let objetivoCor = temaEscuro ? 'text-zinc-300' : 'text-zinc-700';
  if (dados.objetivo === 'perder') { objetivoTexto = 'Emagrecimento'; } 
  else if (dados.objetivo === 'ganhar') { objetivoTexto = 'Ganho de Massa'; }

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
        <h3 className={`text-lg font-bold ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Suporte & Informação</h3>
        <div className={`border rounded-3xl flex flex-col overflow-hidden transition-colors ${
          temaEscuro ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
        }`}>
          
          <button onClick={() => setModalIdeia(true)} className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'}`}>
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Deixe sua ideia 💡</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

          <button onClick={() => setModalFeedback(true)} className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'}`}>
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Enviar feedback</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

          <button onClick={() => setModalSuporte(true)} className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'}`}>
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Precisas de ajuda?</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>

          <button onClick={() => setModalTermos(true)} className={`flex justify-between items-center p-4 transition-colors group w-full text-left ${temaEscuro ? 'hover:bg-zinc-800/50' : 'hover:bg-zinc-50'}`}>
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Termos e Diretrizes</span>
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
            <button onClick={() => { setDados({ notificacoes: !notificacoes }); configurarNotificacoesNativas(); }} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${notificacoes ? 'bg-green-500' : 'bg-zinc-700'}`}>
              <div className={`w-4 h-4 rounded-full shadow-md transform transition-transform ${notificacoes ? 'translate-x-6 bg-zinc-950' : 'translate-x-0 bg-white'}`} />
            </button>
          </div>
          <div className="flex justify-between items-center p-4">
            <span className={`text-sm font-medium ${temaEscuro ? 'text-zinc-300' : 'text-zinc-600'}`}>Tema Escuro</span>
            <button onClick={() => setDados({ temaEscuro: !temaEscuro })} className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${temaEscuro ? 'bg-green-500' : 'bg-zinc-700'}`}>
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
          <button onClick={() => navigate('/onboarding')} className={`flex justify-between items-center p-4 border-b transition-colors group w-full text-left ${temaEscuro ? 'border-zinc-800/50 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-zinc-50'}`}>
            <span className={`text-sm font-medium transition-colors ${temaEscuro ? 'text-zinc-300 group-hover:text-white' : 'text-zinc-600 group-hover:text-zinc-900'}`}>Refazer Configuração Inicial</span>
            <span className={temaEscuro ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-600'}>›</span>
          </button>
          <button onClick={() => setMostrarModalSair(true)} className={`flex justify-between items-center p-4 transition-colors group w-full text-left ${temaEscuro ? 'hover:bg-red-500/10' : 'hover:bg-red-50'}`}>
            <span className="text-sm font-medium text-red-500">Terminar Sessão</span>
          </button>
        </div>
      </div>

      {/* --- MODAIS --- */}

      {/* 💡 MODAL DE IDEIAS */}
      {modalIdeia && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5 text-center shadow-2xl ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            {sucessoIdeia ? (
              <div className="flex flex-col gap-3 py-6">
                <div className="text-5xl animate-bounce mb-2">💡</div>
                <h3 className="text-xl font-bold">Ideia Registada!</h3>
                <p className={`text-sm leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Obrigado pela tua criatividade! A nossa equipa adora novas ideias e vai analisar a tua sugestão.
                </p>
                <button onClick={fecharIdeia} className="bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3.5 rounded-xl text-sm mt-4 transition-colors">
                  Fechar
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>💡</span> Deixe sua ideia
                  </h3>
                  <button onClick={fecharIdeia} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>✕</button>
                </div>

                <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Tens alguma ideia incrível ou funcionalidade que gostavas de ver no Louri Fit? Partilha connosco!
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold pl-1 flex justify-between ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    <span>A tua sugestão</span>
                    <span className={mensagemIdeia.length >= 1000 ? 'text-red-500' : ''}>{mensagemIdeia.length}/1000</span>
                  </label>
                  <textarea
                    rows={5}
                    maxLength={1000}
                    value={mensagemIdeia}
                    onChange={(e) => setMensagemIdeia(e.target.value)}
                    placeholder="Gostava muito que a app tivesse uma função para..."
                    className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:border-yellow-400 resize-none transition-colors ${
                      temaEscuro ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'
                    }`}
                  />
                </div>

                {erroIdeia && <p className="text-red-400 text-xs font-medium text-center">{erroIdeia}</p>}

                <div className="flex gap-3 mt-2">
                  <button onClick={fecharIdeia} className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-colors ${temaEscuro ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}>
                    Cancelar
                  </button>
                  <button onClick={enviarIdeiaDiscord} disabled={enviandoIdeia} className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50">
                    {enviandoIdeia ? 'A enviar...' : 'Enviar Ideia'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 🛠️ MODAL DE SUPORTE */}
      {modalSuporte && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-8 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto flex flex-col gap-5 text-center shadow-2xl custom-scrollbar ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            {sucessoSuporte ? (
              <div className="flex flex-col gap-3 py-6">
                <div className="text-5xl animate-bounce mb-2">🚀</div>
                <h3 className="text-xl font-bold">Relatório Enviado!</h3>
                <p className={`text-sm leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Obrigado pelo contacto! A nossa equipa de desenvolvimento já recebeu a tua mensagem.
                </p>
                <button onClick={fecharSuporte} className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3.5 rounded-xl text-sm mt-4 transition-colors">
                  Voltar ao Perfil
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>🛠️</span> Precisas de ajuda?
                  </h3>
                  <button onClick={fecharSuporte} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'}`}>✕</button>
                </div>

                <p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Preenche os dados abaixo. Entraremos em contacto assim que possível.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Tipo de Assunto</label>
                  <select value={suporteTipo} onChange={(e) => setSuporteTipo(e.target.value)} className={`w-full p-3.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-green-500 transition-colors appearance-none ${temaEscuro ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-300 text-zinc-900'}`}>
                    <option value="Dúvida">💡 Tenho uma dúvida</option>
                    <option value="Erro/Bug">🐛 Encontrei um erro (Bug)</option>
                    <option value="Outro">📝 Outro assunto</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>O teu contacto</label>
                  {/* LIMITE DE 90 CARACTERES NO INPUT */}
                  <input type="text" maxLength={90} value={suporteContato} onChange={(e) => setSuporteContato(e.target.value)} placeholder="Email (ex: nome@email.com) ou Telemóvel" className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:border-green-500 transition-colors ${temaEscuro ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'}`} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold pl-1 flex justify-between ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    <span>Descreve a situação</span>
                    <span className={mensagemSuporte.length >= 1000 ? 'text-red-500' : ''}>{mensagemSuporte.length}/1000</span>
                  </label>
                  <textarea rows={4} maxLength={1000} value={mensagemSuporte} onChange={(e) => setMensagemSuporte(e.target.value)} placeholder={suporteTipo === 'Erro/Bug' ? "Onde estavas quando o erro ocorreu?" : "Escreve aqui..."} className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none focus:border-green-500 resize-none transition-colors ${temaEscuro ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400'}`} />
                </div>

                {erroSuporte && <p className="text-red-400 text-xs font-medium text-center">{erroSuporte}</p>}

                <div className="flex gap-3 mt-2">
                  <button onClick={fecharSuporte} className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-colors ${temaEscuro ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}>Cancelar</button>
                  <button onClick={enviarSuporteDiscord} disabled={enviandoSuporte} className="flex-1 bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50">{enviandoSuporte ? 'A enviar...' : 'Enviar'}</button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL TERMOS */}
      {modalTermos && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-10 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl w-full max-w-md h-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden ${temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${temaEscuro ? 'border-zinc-800 bg-zinc-900/90' : 'border-zinc-200 bg-white/90'}`}>
              <h3 className="text-base font-bold flex items-center gap-2"><span className="text-xl">📄</span> Termos e Privacidade</h3>
              <button onClick={() => setModalTermos(false)} className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${temaEscuro ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'}`}>✕</button>
            </div>
            <div className={`flex-1 overflow-y-auto px-6 py-5 text-left custom-scrollbar ${temaEscuro ? 'text-zinc-300' : 'text-zinc-700'} text-[13px] leading-relaxed space-y-5`}>
              <div><p className="font-bold text-sm mb-1 text-green-500">Bem-vindo(a) ao Louri Fit</p><p>Estes Termos de Uso e Política de Privacidade regulam a utilização da aplicação Louri Fit ("App").</p></div>
              <div><p className={`font-bold mb-1 ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>1. Isenção de Responsabilidade Médica</p><ul className="list-disc pl-4 space-y-1 opacity-90"><li>O Louri Fit é uma ferramenta informativa.</li><li><strong>A App não fornece aconselhamento médico.</strong></li></ul></div>
            </div>
            <div className={`p-4 border-t ${temaEscuro ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <button onClick={() => setModalTermos(false)} className="w-full bg-green-500 hover:bg-green-400 text-zinc-950 font-black uppercase tracking-widest py-4 rounded-2xl text-sm transition-all active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.3)]">Aceitar e Fechar</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL FEEDBACK */}
      {modalFeedback && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-4 text-center shadow-2xl ${temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            {enviouFeedback ? (
              <><div className="text-4xl animate-bounce">💖</div><h3 className="text-lg font-bold">Muito Obrigado!</h3><p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>O teu feedback foi registado.</p><button onClick={fecharFeedback} className="bg-green-500 hover:bg-green-400 text-zinc-950 font-bold py-3 rounded-xl text-xs mt-2 transition-colors">Fechar</button></>
            ) : (
              <><div className="text-3xl">⭐</div><h3 className="text-lg font-bold">Avalie o Louri Fit</h3>
                <div className="flex justify-center gap-2 my-2">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <button key={estrela} onClick={() => setEstrelas(estrela)} className={`text-2xl transition-transform active:scale-125 ${estrela <= estrelas ? 'text-yellow-400' : temaEscuro ? 'text-zinc-700' : 'text-zinc-300'}`}>★</button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={fecharFeedback} className={`flex-1 py-3 rounded-xl text-xs font-semibold transition-colors ${temaEscuro ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}>Cancelar</button>
                  <button onClick={() => { if (estrelas > 0) setEnviouFeedback(true); }} disabled={estrelas === 0} className={`flex-1 font-bold py-3 rounded-xl text-xs transition-all ${estrelas > 0 ? 'bg-green-500 text-zinc-950 shadow-md' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}>Enviar</button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* MODAL SAIR */}
      {mostrarModalSair && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-6 animate-in fade-in overscroll-none">
          <div className={`border rounded-3xl p-6 w-full max-w-xs flex flex-col gap-5 text-center shadow-2xl ${temaEscuro ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-500">🚪</div>
            <div className="flex flex-col gap-1"><h3 className="text-lg font-bold">Terminar Sessão?</h3><p className={`text-xs leading-relaxed ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Isto irá limpar os dados locais.</p></div>
            <div className="flex gap-2 mt-1">
              <button onClick={() => setMostrarModalSair(false)} className={`flex-1 py-3.5 rounded-2xl font-semibold text-xs border ${temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200'}`}>Cancelar</button>
              <button onClick={confirmarSaida} className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-red-500/25">Sim, Sair</button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}