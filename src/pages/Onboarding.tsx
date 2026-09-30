import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

// Dicionário completo expandido com as 6 refeições possíveis
const ALIMENTOS_POR_REFEICAO: Record<string, { id: string; nome: string; emoji: string }[]> = {
  cafeManha: [
    { id: 'pao', nome: 'Pão Francês', emoji: '🥖' },
    { id: 'tapioca', nome: 'Tapioca / Crepioca', emoji: '🌮' },
    { id: 'ovo', nome: 'Ovo Mexido / Cozido', emoji: '🍳' },
    { id: 'queijo', nome: 'Queijo Minas / Mussarela', emoji: '🧀' },
    { id: 'cuscuz', nome: 'Cuscuz', emoji: '🌽' },
    { id: 'aveia', nome: 'Aveia', emoji: '🥣' },
    { id: 'banana', nome: 'Banana', emoji: '🍌' },
    { id: 'maca', nome: 'Maçã', emoji: '🍎' },
    { id: 'mamao', nome: 'Mamão', emoji: '🍈' },
    { id: 'leite', nome: 'Leite / Iogurte', emoji: '🥛' },
    { id: 'cafe', nome: 'Café', emoji: '☕' },
    { id: 'bolo', nome: 'Bolo Caseiro', emoji: '🥮' },
  ],
  almoco: [
    { id: 'arroz', nome: 'Arroz Branco / Integral', emoji: '🍚' },
    { id: 'feijao', nome: 'Feijão', emoji: '🍲' },
    { id: 'frango', nome: 'Frango Grelhado', emoji: '🍗' },
    { id: 'carne', nome: 'Carne Bovina / Patinho', emoji: '🥩' },
    { id: 'peixe', nome: 'Peixe / Filé', emoji: '🐟' },
    { id: 'batatadoce', nome: 'Batata Doce / Mandioca', emoji: '🍠' },
    { id: 'pure', nome: 'Purê de Batata', emoji: '🥔' },
    { id: 'macarrao', nome: 'Macarrão', emoji: '🍝' },
    { id: 'salada', nome: 'Salada Verde', emoji: '🥗' },
    { id: 'legumes', nome: 'Legumes Cozidos', emoji: '🥦' },
    { id: 'ovo_almoco', nome: 'Ovo Cozido', emoji: '🥚' },
    { id: 'farofa', nome: 'Farofa', emoji: '🌾' },
  ],
  lancheTarde: [
    { id: 'paodequeijo', nome: 'Pão de Queijo', emoji: '🧀' },
    { id: 'fruta_tarde', nome: 'Frutas Variadas', emoji: '🍌' },
    { id: 'vitamina', nome: 'Vitamina', emoji: '🥤' },
    { id: 'tapioca_tarde', nome: 'Tapioca', emoji: '🌮' },
    { id: 'castanhas', nome: 'Castanhas / Nozes', emoji: '🥜' },
    { id: 'iogurte', nome: 'Iogurte Natural', emoji: '🍶' },
    { id: 'cafe_tarde', nome: 'Café ou Chá', emoji: '☕' },
    { id: 'biscoito', nome: 'Biscoito Integral', emoji: '🍪' },
    { id: 'crepioca', nome: 'Crepioca', emoji: '🍳' },
    { id: 'sanduiche', nome: 'Sanduíche Natural', emoji: '🥪' },
  ],
  cafeTarde: [
    { id: 'cuscuz_tarde', nome: 'Cuscuz', emoji: '🌽' },
    { id: 'pao_chapa', nome: 'Pão na Chapa', emoji: '🍞' },
    { id: 'bolo_tarde', nome: 'Bolo Simples', emoji: '🥮' },
    { id: 'fruta_l', nome: 'Fruta da Hora', emoji: '🍎' },
    { id: 'cha', nome: 'Chá Gelado / Quente', emoji: '🍵' },
  ],
  janta: [
    { id: 'frango_janta', nome: 'Frango Desfiado', emoji: '🍗' },
    { id: 'sopa', nome: 'Sopa de Legumes', emoji: '🍲' },
    { id: 'omelete', nome: 'Omelete', emoji: '🍳' },
    { id: 'salada_janta', nome: 'Salada Completa', emoji: '🥗' },
    { id: 'arroz_janta', nome: 'Arroz (Porção leve)', emoji: '🍚' },
    { id: 'pure_janta', nome: 'Purê', emoji: '🥔' },
    { id: 'wrap', nome: 'Wrap / Panqueca Fit', emoji: '🌯' },
    { id: 'legumes_assados', nome: 'Legumes Assados', emoji: '🥕' },
    { id: 'carne_janta', nome: 'Carne Magra', emoji: '🥩' },
    { id: 'peixe_janta', nome: 'Peixe Grelhado', emoji: '🐟' },
  ],
  lancheNoite: [
    { id: 'chapa_noite', nome: 'Chá Relaxante', emoji: '🍵' },
    { id: 'ceia_fruta', nome: 'Fruta Leve (Banana/Maçã)', emoji: '🍌' },
    { id: 'iogurte_noite', nome: 'Iogurte Proteico', emoji: '🥛' },
    { id: 'barra_cereal', nome: 'Barra de Cereal / Castanhas', emoji: '🥜' },
  ],
};

const NOMES_REFEICOES: Record<string, { nome: string; emoji: string }> = {
  cafeManha: { nome: 'Café da Manhã', emoji: '☕' },
  almoco: { nome: 'Almoço', emoji: '🍽️' },
  lancheTarde: { nome: 'Lanche da Tarde', emoji: '🍎' },
  cafeTarde: { nome: 'Café da Tarde', emoji: '🧋' },
  janta: { nome: 'Jantar', emoji: '🍲' },
  lancheNoite: { nome: 'Lanche da Noite', emoji: '🌙' },
};

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const temaEscuro = dadosGlobais.temaEscuro ?? true;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ...dadosGlobais,
    refeicoesAtivas: dadosGlobais.refeicoesAtivas || ['cafeManha', 'almoco', 'lancheTarde', 'janta'],
    alimentos: dadosGlobais.alimentos || {},
  });

  const [refeicaoAtivaModal, setRefeicaoAtivaModal] = useState<string>('cafeManha');
  const [error, setError] = useState('');
  const totalSteps = 5;

  const handleChange = (campo: string, valor: any) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  const toggleRefeicaoAtiva = (key: string) => {
    const ativas = formData.refeicoesAtivas;
    let novasAtivas;
    if (ativas.includes(key)) {
      if (ativas.length <= 1) {
        setError('Tens de manter pelo menos 1 refeição ativa.');
        return;
      }
      novasAtivas = ativas.filter((r: string) => r !== key);
    } else {
      novasAtivas = [...ativas, key];
    }
    setFormData({ ...formData, refeicoesAtivas: novasAtivas });
    setError('');
  };

  const toggleAlimentoRefeicao = (idAlimento: string) => {
    const listaAtual = formData.alimentos[refeicaoAtivaModal] || [];
    let novaLista;

    if (listaAtual.includes(idAlimento)) {
      novaLista = listaAtual.filter((item: string) => item !== idAlimento);
    } else {
      novaLista = [...listaAtual, idAlimento];
    }

    setFormData({
      ...formData,
      alimentos: {
        ...formData.alimentos,
        [refeicaoAtivaModal]: novaLista,
      },
    });
    setError('');
  };

  const handleNextStep = () => {
    if (step === 1 && (!formData.nome || formData.nome.trim() === '')) {
      setError('Por favor, digite seu nome.'); return;
    }
    if (step === 2) {
      const idade = Number(formData.idade);
      const peso = Number(formData.peso);
      const altura = Number(formData.altura);
      if (!idade || idade < 14 || idade > 120) { setError('Idade inválida (14-120).'); return; }
      if (!peso || peso < 30 || peso > 300) { setError('Peso inválido (30-300).'); return; }
      if (!altura || altura < 100 || altura > 250) { setError('Altura inválida (100-250).'); return; }
      if (!formData.sexo) { setError('Selecione o sexo biológico.'); return; }
    }
    if (step === 3 && !formData.objetivo) {
      setError('Por favor, selecione um objetivo.'); return;
    }
    if (step === 4 && (!formData.horaAcorda || !formData.horaDorme)) {
      setError('Por favor, preencha os horários.'); return;
    }
    if (step === 4 && formData.refeicoesAtivas.length === 0) {
      setError('Selecione pelo menos uma refeição.'); return;
    }

    setError('');
    if (step === 4) {
      setRefeicaoAtivaModal(formData.refeicoesAtivas[0]);
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step === 1) {
      navigate('/');
    } else {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    for (const refKey of formData.refeicoesAtivas) {
      const itens = formData.alimentos[refKey] || [];
      if (itens.length < 1) {
        setError(`Escolha pelo menos 1 alimento para ${NOMES_REFEICOES[refKey]?.nome}.`);
        return;
      }
    }
    setDados(formData);
    navigate('/');
  };

  return (
    <div className={`flex flex-col h-full px-6 py-8 overflow-y-auto overflow-x-hidden transition-colors duration-300 ${
      temaEscuro ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
    }`}>
      
      {/* CABEÇALHO */}
      <header className="flex items-center relative mb-8 shrink-0">
        <button 
          onClick={handleBack}
          className={`w-10 h-10 rounded-full border flex items-center justify-center z-10 transition-colors ${
            temaEscuro ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((item) => (
              <div 
                key={item} 
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === item ? 'w-6 bg-green-500' : temaEscuro ? 'w-2 bg-zinc-800' : 'w-2 bg-zinc-200'
                }`} 
              />
            ))}
          </div>
        </div>
      </header>

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-12">
        
        {step === 1 && (
          <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in">
            <h1 className={`text-3xl font-bold tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Qual o seu nome?</h1>
            <p className={`text-sm -mt-4 mb-4 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Como prefere ser chamado</p>
            
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className={`text-sm font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>O seu nome</label>
              <input
                type="text"
                maxLength={25}
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Gabriel"
                className={`px-4 py-4 rounded-2xl border focus:border-green-500 focus:outline-none w-full text-lg transition-colors ${
                  temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
                }`}
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={handleNextStep}>Continuar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in">
            <h1 className={`text-3xl font-bold tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Suas Medidas</h1>
            <p className={`text-sm -mt-2 mb-2 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Dados para cálculo metabólico exato</p>
            
            <div className="flex flex-col gap-1 text-left w-full">
              <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Idade (anos)</label>
              <input type="number" placeholder="Ex: 21" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-lg w-full transition-colors ${
                temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
              }`} />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Peso atual (kg)</label>
              <input type="number" placeholder="Ex: 70" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-lg w-full transition-colors ${
                temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
              }`} />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Altura (cm)</label>
              <input type="number" placeholder="Ex: 175" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-lg w-full transition-colors ${
                temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
              }`} />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Sexo biológico (para TMB)</label>
              <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-lg w-full appearance-none transition-colors ${
                temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
              }`}>
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={handleNextStep}>Continuar</Button>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in">
            <h1 className={`text-3xl font-bold tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Objetivo</h1>
            <p className={`text-sm -mt-4 mb-2 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Qual será o seu foco?</p>
            
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className={`text-sm font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>O seu foco principal</label>
              <select value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} className={`px-4 py-4 rounded-2xl border focus:border-green-500 text-lg w-full appearance-none transition-colors ${
                temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
              }`}>
                <option value="">Selecione uma opção</option>
                <option value="perder">Emagrecimento</option>
                <option value="manter">Saúde e Manutenção</option>
                <option value="ganhar">Ganho de Massa</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={handleNextStep}>Continuar</Button>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4 w-full max-w-sm animate-in fade-in">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>A sua Rotina</h1>
              <p className={`text-xs mt-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Horários e selecione as refeições que realmente faz</p>
            </div>

            <div className="flex gap-2 w-full">
              <div className="flex flex-col gap-1 text-left flex-1">
                <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Acorda</label>
                <input type="time" value={formData.horaAcorda} onChange={(e) => handleChange('horaAcorda', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-sm w-full transition-colors ${
                  temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
                }`} />
              </div>
              <div className="flex flex-col gap-1 text-left flex-1">
                <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Dorme</label>
                <input type="time" value={formData.horaDorme} onChange={(e) => handleChange('horaDorme', e.target.value)} className={`px-3 py-3 rounded-2xl border focus:border-green-500 text-sm w-full transition-colors ${
                  temaEscuro ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-zinc-900 border-zinc-200 shadow-sm'
                }`} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full mt-2">
              <label className={`text-xs font-medium pl-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-600'}`}>Quais refeições faz no dia a dia? (Toque para ativar/desativar)</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(NOMES_REFEICOES).map(([key, ref]) => {
                  const ativa = formData.refeicoesAtivas.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleRefeicaoAtiva(key)}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        ativa 
                          ? 'bg-green-500/10 border-green-500 text-green-500 shadow-md' 
                          : temaEscuro 
                            ? 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700' 
                            : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300 shadow-sm'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{ref.emoji}</span>
                        <span className={ativa ? 'text-green-500 font-bold' : ''}>{ref.nome}</span>
                      </span>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                        ativa ? 'bg-green-500 text-zinc-950 font-bold' : temaEscuro ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-zinc-300'
                      }`}>
                        {ativa ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            <div className="mt-2">
              <Button onClick={handleNextStep}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4 w-full max-w-md animate-in fade-in">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${temaEscuro ? 'text-white' : 'text-zinc-900'}`}>Preferências Alimentares</h1>
              <p className={`text-xs mt-1 ${temaEscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>Selecione os alimentos habituais para as suas refeições ativas</p>
            </div>

            {/* Abas dinâmicas baseadas estritamente nas refeições ativas escolhidas pelo utilizador */}
            <div className="flex gap-1.5 overflow-x-auto p-1 custom-scrollbar w-full">
              {formData.refeicoesAtivas.map((refeicaoKey: string) => {
                const qtdSelecionada = formData.alimentos[refeicaoKey]?.length || 0;
                const estaAtiva = refeicaoAtivaModal === refeicaoKey;
                return (
                  <button
                    key={refeicaoKey}
                    onClick={() => setRefeicaoAtivaModal(refeicaoKey)}
                    className={`py-2 px-3 rounded-2xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                      estaAtiva
                        ? 'bg-green-500 text-zinc-950 shadow-md font-bold'
                        : temaEscuro ? 'text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white' : 'text-zinc-600 bg-white border border-zinc-200 hover:text-zinc-900 shadow-sm'
                    }`}
                  >
                    <span>{NOMES_REFEICOES[refeicaoKey]?.emoji}</span>
                    <span>{NOMES_REFEICOES[refeicaoKey]?.nome}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                      estaAtiva ? 'bg-zinc-950 text-green-400' : temaEscuro ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {qtdSelecionada}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grelha de alimentos da aba ativa */}
            <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {ALIMENTOS_POR_REFEICAO[refeicaoAtivaModal]?.map((alimento) => {
                const listaRefeicao = formData.alimentos[refeicaoAtivaModal] || [];
                const estaSelecionado = listaRefeicao.includes(alimento.id);
                return (
                  <button
                    key={alimento.id}
                    onClick={() => toggleAlimentoRefeicao(alimento.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 gap-1 ${
                      estaSelecionado
                        ? 'bg-green-500/10 border-green-500 text-green-500 shadow-md font-bold'
                        : temaEscuro 
                          ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700' 
                          : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 shadow-sm'
                    }`}
                  >
                    <span className="text-xl">{alimento.emoji}</span>
                    <span className="text-[11px] font-medium truncate w-full">{alimento.nome}</span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-red-400 text-xs font-medium">{error}</p>}
            
            <div className="mt-1">
              <Button onClick={handleFinish}>Finalizar Registo</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}