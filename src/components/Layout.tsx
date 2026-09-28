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

  // Lê o estado do tema (por predefinição é verdadeiro / escuro)
  const temaEscuro = dados.temaEscuro ?? true;

  const isOnboarding = location.pathname === '/onboarding';
  const isSemRegisto = !dados.nome;

  const deveMostrarNavbar = !isOnboarding && !isSemRegisto && mostrarNavbar;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`flex flex-col h-[100dvh] w-full max-w-md mx-auto relative overflow-hidden overscroll-none transition-colors duration-300 ${
      temaEscuro ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
    }`}>
      
      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pb-32">
        {children}
      </main>

      {/* BARRA DE NAVEGAÇÃO INFERIOR FLUTUANTE */}
      {deveMostrarNavbar && (
        <div className="absolute bottom-6 left-4 right-4 z-40 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 pb-[env(safe-area-inset-bottom)]">
          <nav className={`backdrop-blur-2xl border rounded-full px-3 py-2 flex items-center justify-between transition-colors duration-300 ${
            temaEscuro 
              ? 'bg-zinc-900/90 border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.6)]' 
              : 'bg-white/90 border-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
          }`}>
            
            <button 
              onClick={() => navigate('/')}
              aria-label="Início"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/') 
                  ? 'text-green-500 bg-green-500/10' 
                  : temaEscuro ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="text-xl">🏠</span>
            </button>

            <button 
              onClick={() => navigate('/plano')}
              aria-label="Plano"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/plano') 
                  ? 'text-green-500 bg-green-500/10' 
                  : temaEscuro ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="text-xl">🥗</span>
            </button>

            <button 
              onClick={() => navigate('/')}
              aria-label="Adicionar"
              className="relative -top-3 w-14 h-14 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 text-zinc-950 flex items-center justify-center shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-zinc-950"
            >
              <span className="text-2xl font-bold">+</span>
            </button>

            <button 
              onClick={() => navigate('/evolucao')}
              aria-label="Evolução"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/evolucao') 
                  ? 'text-green-500 bg-green-500/10' 
                  : temaEscuro ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <span className="text-xl">📊</span>
            </button>

            <button 
              onClick={() => navigate('/perfil')}
              aria-label="Perfil"
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                isActive('/perfil') 
                  ? 'text-green-500 bg-green-500/10' 
                  : temaEscuro ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-800'
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