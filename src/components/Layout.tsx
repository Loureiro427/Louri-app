import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dados = useUserStore((state) => state.dados);
  const mostrarNavbar = useUserStore((state) => state.mostrarNavbar);

  const isOnboarding = location.pathname === '/onboarding';
  const isSemRegisto = !dados.nome; // Esconde se estiver na tela inicial de boas-vindas

  const deveMostrarNavbar = !isOnboarding && !isSemRegisto && mostrarNavbar;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-950 text-white w-full max-w-md mx-auto relative overflow-hidden overscroll-none">
      
      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-28">
        {children}
      </main>

      {/* BARRA DE NAVEGAÇÃO INFERIOR FLUTUANTE */}
      {deveMostrarNavbar && (
        <div className="absolute bottom-6 left-4 right-4 z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <nav className="bg-zinc-900/90 backdrop-blur-2xl border border-zinc-800 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-3 py-2 flex items-center justify-between">
            
            <button 
              onClick={() => navigate('/')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/') ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">🏠</span>
            </button>

            <button 
              onClick={() => navigate('/plano')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/plano') ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">🥗</span>
            </button>

            <button 
              onClick={() => navigate('/')}
              className="relative -top-3 w-14 h-14 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-zinc-950 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-zinc-950"
            >
              <span className="text-2xl font-bold">+</span>
            </button>

            <button 
              onClick={() => navigate('/evolucao')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/evolucao') ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">📊</span>
            </button>

            <button 
              onClick={() => navigate('/perfil')}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/perfil') ? 'text-green-400 bg-green-500/10' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="text-xl">👤</span>
            </button>

          </nav>
        </div>
      )}

    </div>
  );
}