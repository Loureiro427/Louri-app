import { useNavigate } from 'react-router-dom';
import { MealComposer } from '../components/MealComposer';
import { calcularPorcoes, todosAlimentos } from '../data/alimentos';
import { useUserStore } from '../store/useUserStore';

export function RefeicaoLivre() {
  const navigate = useNavigate();
  const registrar = useUserStore(state => state.registrarRefeicao);
  return <div className="h-[100dvh] w-full max-w-md mx-auto overflow-hidden">
    <MealComposer alimentos={todosAlimentos} memoriaKey="livre" titulo="Refeição Livre" onClose={() => navigate('/')} onConfirm={porcoes => {
      const total = calcularPorcoes(porcoes, todosAlimentos);
      registrar('refeicaoLivre_' + crypto.randomUUID(), 'Refeição Livre', '🍔', total.calorias,
        Object.keys(porcoes).map(id => todosAlimentos.find(a => a.id === id)?.nome || id), total.macros, porcoes);
      navigate('/');
    }} />
  </div>;
}
