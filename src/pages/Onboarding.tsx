import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

export function Onboarding() {
  const navigate = useNavigate();
  const dadosGlobais = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(dadosGlobais);
  
  // NOVA MEMÓRIA: Guarda a mensagem de erro atual
  const [error, setError] = useState('');

  // Toda vez que o usuário digita algo, limpamos o erro da tela
  const handleChange = (campo: string, valor: string) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  // NOVA LÓGICA DE VALIDAÇÃO
  const handleNextStep = () => {
    // Validação da Etapa 1 (Nome)
    if (step === 1) {
      if (!formData.nome || formData.nome.trim() === '') {
        setError('Por favor, digite seu nome.');
        return; // Interrompe a função aqui
      }
    }

    // Validação da Etapa 2 (Medidas)
    if (step === 2) {
      const idade = Number(formData.idade);
      const peso = Number(formData.peso);
      const altura = Number(formData.altura);

      if (!idade || idade < 14 || idade > 120) {
        setError('A idade deve ser entre 14 e 120 anos.');
        return;
      }
      if (!peso || peso < 30 || peso > 300) {
        setError('O peso deve ser entre 30 e 300 kg.');
        return;
      }
      if (!altura || altura < 100 || altura > 250) {
        setError('A altura deve ser entre 100 e 250 cm.');
        return;
      }
      if (!formData.sexo) {
        setError('Por favor, selecione seu sexo biológico.');
        return;
      }
    }

    // Se chegou até aqui, não tem erro. Limpa o erro e avança.
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError(''); // Limpa erros ao voltar
    setStep(step - 1);
  };

  const handleFinish = () => {
    if (!formData.objetivo) {
      setError('Por favor, selecione um objetivo.');
      return;
    }
    setDados(formData);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 gap-8 px-4 text-center">
      
      {/* ETAPA 1: NOME */}
      {step === 1 && (
        <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Qual o seu nome?</h1>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none w-full"
          />
          
          {/* Exibição do Erro */}
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          
          <Button onClick={handleNextStep}>Avançar</Button>
        </div>
      )}

      {/* ETAPA 2: DADOS FÍSICOS */}
      {step === 2 && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Suas medidas</h1>
          
          <input
            type="number"
            placeholder="Idade (ex: 21)"
            value={formData.idade}
            onChange={(e) => handleChange('idade', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full"
          />
          <input
            type="number"
            placeholder="Peso em kg (ex: 70)"
            value={formData.peso}
            onChange={(e) => handleChange('peso', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full"
          />
          <input
            type="number"
            placeholder="Altura em cm (ex: 175)"
            value={formData.altura}
            onChange={(e) => handleChange('altura', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full"
          />
          <select
            value={formData.sexo}
            onChange={(e) => handleChange('sexo', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full"
          >
            <option value="">Selecione o sexo biológico</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>

          {/* Exibição do Erro */}
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <div className="flex gap-4 mt-2">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleNextStep}>Avançar</Button>
          </div>
        </div>
      )}

      {/* ETAPA 3: OBJETIVO */}
      {step === 3 && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Qual o seu objetivo?</h1>
          
          <select
            value={formData.objetivo}
            onChange={(e) => handleChange('objetivo', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full"
          >
            <option value="">Selecione uma opção</option>
            <option value="perder">Perder Peso (Emagrecimento)</option>
            <option value="manter">Manter Peso / Saúde</option>
            <option value="ganhar">Ganhar Massa Muscular</option>
          </select>

          {/* Exibição do Erro */}
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleFinish}>Finalizar</Button>
          </div>
        </div>
      )}

      {/* Indicador de progresso visual */}
      <div className="flex gap-2 mt-4">
        <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full transition-colors ${step >= 3 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
      </div>

    </div>
  );
}