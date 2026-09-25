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
  const [error, setError] = useState('');

  const handleChange = (campo: string, valor: string) => {
    setFormData({ ...formData, [campo]: valor });
    setError(''); 
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.nome || formData.nome.trim() === '') {
        setError('Por favor, digite seu nome.');
        return;
      }
    }
    if (step === 2) {
      const idade = Number(formData.idade);
      const peso = Number(formData.peso);
      const altura = Number(formData.altura);

      if (!idade || idade < 14 || idade > 120) {
        setError('A idade deve ser entre 14 e 120 anos.'); return;
      }
      if (!peso || peso < 30 || peso > 300) {
        setError('O peso deve ser entre 30 e 300 kg.'); return;
      }
      if (!altura || altura < 100 || altura > 250) {
        setError('A altura deve ser entre 100 e 250 cm.'); return;
      }
      if (!formData.sexo) {
        setError('Por favor, selecione seu sexo biológico.'); return;
      }
    }
    if (step === 3) {
      if (!formData.objetivo) {
        setError('Por favor, selecione um objetivo.'); return;
      }
    }

    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleFinish = () => {
    // Validação da Etapa 4
    if (!formData.horaAcorda || !formData.horaDorme) {
      setError('Por favor, preencha os horários.');
      return;
    }
    setDados(formData);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 gap-8 px-4 text-center">
      
      {/* ETAPA 1, 2 e 3 CONTINUAM IGUAIS... */}
      {step === 1 && (
        <div className="flex flex-col gap-6 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Qual o seu nome?</h1>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:border-green-500 focus:outline-none w-full"
          />
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <Button onClick={handleNextStep}>Avançar</Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Suas medidas</h1>
          <input type="number" placeholder="Idade (ex: 21)" value={formData.idade} onChange={(e) => handleChange('idade', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full" />
          <input type="number" placeholder="Peso em kg (ex: 70)" value={formData.peso} onChange={(e) => handleChange('peso', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full" />
          <input type="number" placeholder="Altura em cm (ex: 175)" value={formData.altura} onChange={(e) => handleChange('altura', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full" />
          <select value={formData.sexo} onChange={(e) => handleChange('sexo', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full">
            <option value="">Selecione o sexo biológico</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
          </select>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <div className="flex gap-4 mt-2">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleNextStep}>Avançar</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Qual o seu objetivo?</h1>
          <select value={formData.objetivo} onChange={(e) => handleChange('objetivo', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full">
            <option value="">Selecione uma opção</option>
            <option value="perder">Perder Peso (Emagrecimento)</option>
            <option value="manter">Manter Peso / Saúde</option>
            <option value="ganhar">Ganhar Massa Muscular</option>
          </select>
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleNextStep}>Avançar</Button>
          </div>
        </div>
      )}

      {/* ETAPA 4: ROTINA (NOVA) */}
      {step === 4 && (
        <div className="flex flex-col gap-4 w-full max-w-xs animate-in fade-in slide-in-from-bottom-4">
          <h1 className="text-2xl font-bold text-green-400">Sua Rotina</h1>
          <p className="text-zinc-400 text-sm">Precisamos disso para organizar seus horários de refeição.</p>
          
          <div className="flex flex-col gap-1 text-left">
            <label className="text-zinc-400 text-sm pl-1">Horário que acorda</label>
            <input type="time" value={formData.horaAcorda} onChange={(e) => handleChange('horaAcorda', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full" />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-zinc-400 text-sm pl-1">Horário que dorme</label>
            <input type="time" value={formData.horaDorme} onChange={(e) => handleChange('horaDorme', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full" />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-zinc-400 text-sm pl-1">Refeições por dia</label>
            <select value={formData.qtdRefeicoes} onChange={(e) => handleChange('qtdRefeicoes', e.target.value)} className="px-4 py-3 rounded-xl bg-zinc-800 text-white border border-zinc-700 w-full">
              <option value="3">3 refeições (Café, Almoço, Janta)</option>
              <option value="4">4 refeições (Inclui lanche)</option>
              <option value="5">5 refeições (Lanche manhã e tarde)</option>
              <option value="6">6 refeições (Inclui ceia)</option>
            </select>
          </div>

          {error && <p className="text-red-400 text-sm font-medium text-center">{error}</p>}

          <div className="flex gap-4 mt-4">
            <button onClick={prevStep} className="text-zinc-400 font-bold py-3 px-6 w-full">Voltar</button>
            <Button onClick={handleFinish}>Finalizar</Button>
          </div>
        </div>
      )}

      {/* Indicador de progresso visual (AGORA SÃO 4) */}
      <div className="flex gap-2 mt-4">
        <div className={`h-2 w-6 rounded-full transition-colors ${step >= 1 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-6 rounded-full transition-colors ${step >= 2 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-6 rounded-full transition-colors ${step >= 3 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
        <div className={`h-2 w-6 rounded-full transition-colors ${step >= 4 ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
      </div>

    </div>
  );
}