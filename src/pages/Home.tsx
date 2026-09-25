import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useUserStore } from '../store/useUserStore';

export function Home() {
  const navigate = useNavigate(); // Ferramenta para trocar de tela
  const nome = useUserStore((state) => state.nome); // Pega o nome lá da nossa caixa global

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 gap-6 text-center px-4">
      <h1 className="text-3xl font-bold text-green-400">
        {nome ? `Bem-vindo de volta, ${nome}!` : 'Nosso App de Nutrição!'}
      </h1>
      <p className="text-zinc-400">Sua jornada para uma vida mais saudável começa aqui.</p>
      
      <Button onClick={() => navigate('/onboarding')}>
        {nome ? 'Atualizar Perfil' : 'Começar agora'}
      </Button>
    </div>
  );
}