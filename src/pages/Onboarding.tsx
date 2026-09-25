import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

export function Onboarding() {
  const navigate = useNavigate();
  // Puxando os dados e a função de salvar do Zustand
  const dadosGlobais = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  // Controle de qual "página" do formulário estamos vendo
  const [step, setStep] = useState(1);
  
  // Memória temporária para o que o usuário está preenchendo agora
  const [formData, setFormData] = useState(dadosGlobais);

  // Função genérica para atualizar qualquer campo do formulário
  const handleChange = (campo: string, valor: string) => {
    setFormData({ ...formData, [campo]: valor });
  };

  // Funções dos botões
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const handleFinish = () => {
    setDados(formData); // Salva no Zustand
    navigate('/'); // Volta pro Início
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
          <Button onClick={nextStep}>Avançar</Button>
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

          <div className="flex gap-4 mt-2">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={nextStep}>Avançar</Button>
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

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleFinish}>Finalizar</Button>
          </div>
        </div>
      )}

      {/* Indicador de progresso visual */}
      <div className="flex gap-2 mt-4">
        <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
      </div>

    </div>
  );
}