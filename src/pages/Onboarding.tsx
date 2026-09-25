import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

const ALIMENTOS_POR_REFEICAO = {
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
  cafeTarde: [
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
};

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ...dadosGlobais,
    alimentos: dadosGlobais.alimentos || {
      cafeManha: [],
      almoco: [],
      cafeTarde: [],
      janta: [],
    },
  });

  const [refeicaoAtiva, setRefeicaoAtiva] = useState<'cafeManha' | 'almoco' | 'cafeTarde' | 'janta'>('cafeManha');
  const [error, setError] = useState('');
  const totalSteps = 5;

  const handleChange = (campo: string, valor: any) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  const toggleAlimentoRefeicao = (idAlimento: string) => {
    const listaAtual = formData.alimentos[refeicaoAtiva] || [];
    let novaLista;

    if (listaAtual.includes(idAlimento)) {
      novaLista = listaAtual.filter((item) => item !== idAlimento);
    } else {
      novaLista = [...listaAtual, idAlimento];
    }

    setFormData({
      ...formData,
      alimentos: {
        ...formData.alimentos,
        [refeicaoAtiva]: novaLista,
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

    setError('');
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
    const { cafeManha, almoco, cafeTarde, janta } = formData.alimentos;
    if (cafeManha.length < 2 || almoco.length < 2 || cafeTarde.length < 2 || janta.length < 2) {
      setError('Escolha pelo menos 2 alimentos em cada uma das 4 refeições.');
      return;
    }
    setDados(formData);
    navigate('/');
  };

  const nomesRefeicoes = {
    cafeManha: 'Café da Manhã',
    almoco: 'Almoço',
    cafeTarde: 'Café da Tarde',
    janta: 'Janta',
  };

  return (
    // min-h-[100dvh] e overscroll-none travam a tela para não ultrapassar os limites
    <div className="flex flex-col min-h-[100dvh] bg-zinc-900 px-6 py-8 overscroll-none overflow-x-hidden">
      
      {/* CABEÇALHO */}
      <header className="flex items-center relative mb-8">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 z-10 transition-colors hover:bg-zinc-700"
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
                className={`h-2 rounded-full transition-all duration-300 ${step === item ? 'w-6 bg-green-500' : 'w-2 bg-zinc-700'}`} 
              />
            ))}
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        
        {step === 1 && (
          <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Qual o seu nome?</h1>
            <p className="text-zinc-400 text-sm -mt-4 mb-4">Como prefere ser chamado</p>
            
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-zinc-400 text-sm font-medium pl-1">O seu nome</label>
              <input
                type="text"
                maxLength={25} // LIMITE DE CARACTERES ADICIONADO AQUI
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Gabriel"
                className="px-4 py-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none w-full text-lg"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={handleNextStep}>Continuar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Suas Medidas</h1>
            <p className="text-zinc-400 text-sm -mt-2 mb-2">Dados para os cálculos</p>
            
            <div className="flex flex-col gap-1 text-left w-full">
              <label className="text-zinc-400 text-xs font-medium pl-1">Idade (anos)</label>
              <input type="number" placeholder="Ex: 21" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="px-3 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full" />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className="text-zinc-400 text-xs font-medium pl-1">Peso atual (kg)</label>
              <input type="number" placeholder="Ex: 70" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className="px-3 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full" />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className="text-zinc-400 text-xs font-medium pl-1">Altura (cm)</label>
              <input type="number" placeholder="Ex: 175" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className="px-3 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full" />
            </div>

            <div className="flex flex-col gap-1 text-left w-full">
              <label className="text-zinc-400 text-xs font-medium pl-1">Sexo biológico</label>
              <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="px-3 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full appearance-none">
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
          <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Objetivo</h1>
            <p className="text-zinc-400 text-sm -mt-4 mb-2">Qual será o seu foco?</p>
            
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-zinc-400 text-sm font-medium pl-1">O seu foco principal</label>
              <select value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} className="px-4 py-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full appearance-none">
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
          <div className="flex flex-col gap-5 w-full max-w-xs animate-in fade-in slide-in-from-right-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Rotina</h1>
            <p className="text-zinc-400 text-sm -mt-3 mb-2">Os seus horários principais</p>
            
            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-zinc-400 text-sm font-medium pl-1">A que horas acorda?</label>
              <input type="time" value={formData.horaAcorda} onChange={(e) => handleChange('horaAcorda', e.target.value)} className="px-4 py-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full" />
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-zinc-400 text-sm font-medium pl-1">A que horas dorme?</label>
              <input type="time" value={formData.horaDorme} onChange={(e) => handleChange('horaDorme', e.target.value)} className="px-4 py-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full" />
            </div>

            <div className="flex flex-col gap-1.5 text-left w-full">
              <label className="text-zinc-400 text-sm font-medium pl-1">Refeições por dia</label>
              <select value={formData.qtdRefeicoes} onChange={(e) => handleChange('qtdRefeicoes', e.target.value)} className="px-4 py-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 text-lg w-full appearance-none">
                <option value="3">3 principais</option>
                <option value="4">4 refeições</option>
                <option value="5">5 refeições</option>
                <option value="6">6 refeições</option>
              </select>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button onClick={handleNextStep}>Continuar</Button>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4 w-full max-w-md animate-in fade-in slide-in-from-right-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Preferências por Refeição</h1>
              <p className="text-zinc-400 text-xs mt-1">Selecione no mínimo 2 alimentos para cada horário</p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-zinc-800 p-1.5 rounded-2xl border border-zinc-700">
              {(['cafeManha', 'almoco', 'cafeTarde', 'janta'] as const).map((refeicaoKey) => {
                const qtdSelecionada = formData.alimentos[refeicaoKey]?.length || 0;
                const estaAtiva = refeicaoAtiva === refeicaoKey;
                return (
                  <button
                    key={refeicaoKey}
                    onClick={() => setRefeicaoAtiva(refeicaoKey)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      estaAtiva
                        ? 'bg-green-500 text-zinc-900 shadow-md'
                        : 'text-zinc-300 hover:text-white bg-transparent'
                    }`}
                  >
                    <span>{nomesRefeicoes[refeicaoKey]}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${estaAtiva ? 'bg-zinc-900 text-green-400' : 'bg-zinc-700 text-zinc-300'}`}>
                      {qtdSelecionada}/2+
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
              {ALIMENTOS_POR_REFEICAO[refeicaoAtiva].map((alimento) => {
                const listaRefeicao = formData.alimentos[refeicaoAtiva] || [];
                const estaSelecionado = listaRefeicao.includes(alimento.id);
                return (
                  <button
                    key={alimento.id}
                    onClick={() => toggleAlimentoRefeicao(alimento.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-200 gap-1 ${
                      estaSelecionado
                        ? 'bg-green-500/10 border-green-500 text-green-400 shadow-md'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
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