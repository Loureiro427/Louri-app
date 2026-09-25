import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

const ALIMENTOS_COMUNS = [
  { id: 'arroz', nome: 'Arroz', emoji: '🍚' },
  { id: 'feijao', nome: 'Feijão', emoji: '🍲' },
  { id: 'frango', nome: 'Frango', emoji: '🍗' },
  { id: 'ovo', nome: 'Ovo', emoji: '🍳' },
  { id: 'carne', nome: 'Carne', emoji: '🥩' },
  { id: 'pao', nome: 'Pão Francês', emoji: '🥖' },
  { id: 'aveia', nome: 'Aveia', emoji: '🥣' },
  { id: 'banana', nome: 'Banana', emoji: '🍌' },
  { id: 'maca', nome: 'Maçã', emoji: '🍎' },
  { id: 'leite', nome: 'Leite', emoji: '🥛' },
  { id: 'cafe', nome: 'Café', emoji: '☕' },
  { id: 'mandioca', nome: 'Batata / Mandioca', emoji: '🥔' },
];

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const [step, setStep] = useState(1);
  
  // Garantia absoluta de que alimentos é sempre um array
  const [formData, setFormData] = useState({
    ...dadosGlobais,
    alimentos: Array.isArray(dadosGlobais.alimentos) ? dadosGlobais.alimentos : [],
  });
  
  const [error, setError] = useState('');
  const totalSteps = 5;

  const handleChange = (campo: string, valor: any) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  const toggleAlimento = (idAlimento: string) => {
    const alimentosAtuais = Array.isArray(formData.alimentos) ? formData.alimentos : [];
    if (alimentosAtuais.includes(idAlimento)) {
      setFormData({
        ...formData,
        alimentos: alimentosAtuais.filter((item) => item !== idAlimento),
      });
    } else {
      setFormData({
        ...formData,
        alimentos: [...alimentosAtuais, idAlimento],
      });
    }
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
    const alimentosSelecionados = Array.isArray(formData.alimentos) ? formData.alimentos : [];
    if (alimentosSelecionados.length === 0) {
      setError('Selecione pelo menos 1 alimento que costuma comer.');
      return;
    }
    setDados(formData);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 px-6 py-8">
      
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
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Gabriel Loureiro"
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
              <h1 className="text-3xl font-bold text-white tracking-tight">Seus Alimentos</h1>
              <p className="text-zinc-400 text-sm mt-1">Toque nos alimentos que consome regularmente</p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
              {ALIMENTOS_COMUNS.map((alimento) => {
                const selecionados = Array.isArray(formData.alimentos) ? formData.alimentos : [];
                const estaSelecionado = selecionados.includes(alimento.id);
                return (
                  <button
                    key={alimento.id}
                    onClick={() => toggleAlimento(alimento.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 gap-1 ${
                      estaSelecionado
                        ? 'bg-green-500/10 border-green-500 text-green-400 shadow-lg shadow-green-500/10'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-2xl">{alimento.emoji}</span>
                    <span className="text-xs font-medium truncate w-full">{alimento.nome}</span>
                  </button>
                );
              })}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="mt-2">
              <Button onClick={handleFinish}>Finalizar Registo</Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}