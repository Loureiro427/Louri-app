import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { calculateCaloricGoal, calculateIMC, calculateWaterGoal } from '../utils/nutritionMath';

export function Home() {
  const navigate = useNavigate();
  // Puxa o pacote de dados inteiro da nossa "Caixa de Memória"
  const dados = useUserStore((state) => state.dados);

  // Se o usuário não tem nome salvo, obriga ele a ir pro Onboarding
  if (!dados.nome) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 text-center px-4 gap-4">
        <h1 className="text-2xl text-white font-bold">Olá! Vamos configurar seu perfil?</h1>
        <button 
          onClick={() => navigate('/onboarding')}
          className="bg-green-500 text-zinc-900 font-bold py-3 px-6 rounded-xl"
        >
          Começar agora
        </button>
      </div>
    );
  }

  // Convertendo textos para números antes de mandar para a matemática
  const peso = Number(dados.peso);
  const altura = Number(dados.altura);
  const idade = Number(dados.idade);

  // Fazendo os cálculos usando nosso arquivo de utilidades
  const metaAgua = calculateWaterGoal(peso);
  const imc = calculateIMC(peso, altura);
  const metaCalorias = calculateCaloricGoal(peso, altura, idade, dados.sexo, dados.objetivo);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 p-6">
      
      {/* Cabeçalho */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-zinc-400 text-sm">Bom dia,</p>
          <h1 className="text-2xl font-bold text-white">{dados.nome}</h1>
        </div>
        <button 
          onClick={() => navigate('/onboarding')}
          className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-zinc-700"
        >
          Editar Perfil
        </button>
      </header>

      {/* Grid de Cartões (Cards) */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Card: Calorias (Ocupa as duas colunas inteiras) */}
        <div className="col-span-2 bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex flex-col gap-1">
          <span className="text-zinc-400 text-sm font-medium">Meta Calórica</span>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-green-400">{metaCalorias}</span>
            <span className="text-zinc-500 mb-1">kcal/dia</span>
          </div>
        </div>

        {/* Card: Água */}
        <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex flex-col gap-1">
          <span className="text-zinc-400 text-sm font-medium">Água Diária</span>
          <span className="text-2xl font-bold text-blue-400">{metaAgua} ml</span>
        </div>

        {/* Card: IMC */}
        <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex flex-col gap-1">
          <span className="text-zinc-400 text-sm font-medium">Seu IMC</span>
          <span className="text-2xl font-bold text-white">{imc}</span>
        </div>

      </div>

    </div>
  );
}