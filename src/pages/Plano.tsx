import { useUserStore } from '../store/useUserStore';

export function Plano() {
  const dados = useUserStore((state) => state.dados);

  return (
    <div className="flex flex-col px-6 py-8 text-white gap-6">
      <header>
        <p className="text-zinc-400 text-xs uppercase tracking-wider">Organização</p>
        <h1 className="text-2xl font-bold text-white">O Teu Plano Nutricional</h1>
      </header>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-5 shadow-lg flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Foco Atual</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-500 block">Objetivo</span>
            <span className="text-lg font-bold capitalize">{dados.objetivo || 'Não definido'}</span>
          </div>
          <div className="bg-zinc-950/50 p-3 rounded-2xl border border-zinc-800">
            <span className="text-xs text-zinc-500 block">Horário Acordar</span>
            <span className="text-lg font-bold">{dados.horaAcorda || '07:00'}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-bold text-white">Dicas do Louri</h3>
        <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800">
          Lembra-te de beber água regularmente entre as refeições para manter o metabolismo ativo. Podes alterar os alimentos diretamente no dia a dia ao clicares nos cartões da página inicial!
        </p>
      </div>
    </div>
  );
}