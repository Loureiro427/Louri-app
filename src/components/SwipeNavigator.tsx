import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from '../pages/Home';
import { Plano } from '../pages/Plano';
import { Evolucao } from '../pages/Evolucao';
import { Perfil } from '../pages/Perfil';

const rotasMain = ['/', '/plano', '/evolucao', '/perfil'];
const components = [Home, Plano, Evolucao, Perfil];

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const routerIndex = rotasMain.indexOf(location.pathname);
  
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

  return (
    <div className="overflow-hidden w-full relative flex-1 flex flex-col">
      <motion.div
        className="flex w-[400%] flex-1 h-full"
        // Usa o visualIndex para animar suavemente ao clicar na navbar
        animate={{ x: `-${visualIndex * 25}%` }} 
        // Física de mola polida para a transição entre abas
        transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.9 }}
        
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