import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from '../pages/Home';
import { Plano } from '../pages/Plano';
import { Evolucao } from '../pages/Evolucao';
import { Perfil } from '../pages/Perfil';

const rotasMain = ['/', '/plano', '/evolucao', '/perfil'];
const components = [Home, Plano, Evolucao, Perfil];

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const routerIndex = rotasMain.indexOf(location.pathname);
  
  // 1. ESTADO VISUAL: É aqui que está a magia para o zero-delay!
  // Guarda qual é a aba que o utilizador está a ver agora instantaneamente.
  const [visualIndex, setVisualIndex] = useState(routerIndex !== -1 ? routerIndex : 0);

  // Se o utilizador clicar na barra de navegação lá em baixo, sincronizamos a animação
  useEffect(() => {
    if (routerIndex !== -1 && routerIndex !== visualIndex) {
      setVisualIndex(routerIndex);
    }
  }, [routerIndex]);

  // Se estiver numa página como o onboarding, apenas renderiza normal
  if (routerIndex === -1) {
    return <>{children}</>;
  }

  const handleDragEnd = (_e: any, info: any) => {
    const threshold = 50; 
    const velocityThreshold = 300;

    const swipeLeft = info.offset.x < -threshold || info.velocity.x < -velocityThreshold;
    const swipeRight = info.offset.x > threshold || info.velocity.x > velocityThreshold;

    let newIndex = visualIndex;

    // Calcula a próxima página
    if (swipeLeft && visualIndex < rotasMain.length - 1) {
      newIndex = visualIndex + 1;
    } else if (swipeRight && visualIndex > 0) {
      newIndex = visualIndex - 1;
    }

    // Se houve mudança de página
    if (newIndex !== visualIndex) {
      setVisualIndex(newIndex);      // MUDA INSTANTANEAMENTE NA TELA (Mata o bug do tremor)
      navigate(rotasMain[newIndex]); // Atualiza o sistema/URL de fundo sem o utilizador notar
    }
  };

  return (
    <div className="overflow-hidden w-full relative flex-1 flex flex-col">
      <motion.div
        className="flex w-[400%] flex-1 h-full"
        // Usa o visualIndex para ser instantâneo
        animate={{ x: `-${visualIndex * 25}%` }} 
        // Física de mola polida para emular iOS / Android Nativo
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.9 }}
        
        drag="x"
        dragDirectionLock={true}
        dragConstraints={{ left: 0, right: 0 }} 
        dragElastic={0.2}
        dragMomentum={false} // Desliga a inércia errada no final do deslize
        onDragEnd={handleDragEnd}
        
        // pan-y: Resolve os bugs de scroll vertical
        // willChange: 'transform' obriga o telemóvel a usar o chip gráfico para esta animação
        style={{ touchAction: 'pan-y', willChange: 'transform' }}
      >
        {components.map((Component, index) => (
          <div 
            key={rotasMain[index]} 
            className="w-1/4 h-full flex flex-col overflow-y-auto overflow-x-hidden pb-24"
          >
            <Component />
          </div>
        ))}
      </motion.div>
    </div>
  );
}