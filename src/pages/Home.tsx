import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { calculateCaloricGoal, calculateIMC, calculateWaterGoal } from '../utils/nutritionMath';

export function Home() {
  const navigate = useNavigate();
  // Puxa o pacote de dados inteiro da nossa "Caixa de Memória"
  const dados = useUserStore((state) => state.dados);
  const setDados = useUserStore((state) => state.setDados);

  // Se o utilizador não tem nome salvo, mostra o ecrã de Boas-vindas (Welcome Screen)
  if (!dados.nome) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-900 px-6 py-12 overflow-hidden">
        
        {/* Área Central com Logotipo e Emojis Orbitando */}
        <div className="flex-1 flex flex-col items-center justify-center mt-10 z-10">
          
          {/* A nossa "Frame" do Figma: Caixa invisível para agrupar tudo */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-2">
            
            {/* CAMADA 1: O anel invisível que gira com os emojis */}
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
              <div className="absolute top-4 left-0 text-3xl opacity-80">🔥</div>
              <div className="absolute top-0 right-4 text-4xl opacity-80">💪</div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-6 text-4xl opacity-80">🍎</div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-4 text-3xl opacity-80">🥗</div>
              <div className="absolute bottom-4 left-4 text-4xl opacity-80">🍊</div>
              <div className="absolute bottom-0 right-2 text-3xl opacity-80">👟</div>
            </div>

            {/* Ícone Central */}
            <div className="text-8xl drop-shadow-lg z-10">🍃</div>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight">
            Louri
          </h1>
        </div>

        {/* Área de Textos e Botões (Mantida igual) */}
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
              className="w-full bg-green-500 hover:bg-green-600 text-zinc-900 font-bold py-4 rounded-full transition-colors text-lg"
            >
              Sou novo por aqui
            </button>
            <button
              onClick={() => alert('A funcionalidade de conta online será lançada em breve! Por enquanto, utilize a versão local.')}
              className="w-full bg-transparent border-2 border-green-500 text-green-500 font-bold py-4 rounded-full transition-colors text-lg"
            >
              Já tenho uma conta
            </button>
          </div>
        </div>
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
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/onboarding')}
            className="text-sm bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg border border-zinc-700"
          >
            Editar
          </button>
          
          {/* BOTÃO PARA APAGAR A MEMÓRIA E VOLTAR AO INÍCIO */}
          <button 
            onClick={() => setDados({ nome: '' })}
            className="text-sm bg-red-900/20 text-red-400 px-3 py-1 rounded-lg border border-red-900/50"
          >
            Sair
          </button>
        </div>
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