import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { motion, AnimatePresence } from 'framer-motion';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const adicionarAgua = useUserStore((state) => state.adicionarAgua);
  
  const temaEscuro = dados.temaEscuro ?? true;
  
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [modalAtivo, setModalAtivo] = useState<'peso' | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  // 👇 AQUI ESTÁ A MAGIA! Ocultamos o menu global no Onboarding E na Refeição Livre
  if (location.pathname === '/onboarding' || location.pathname === '/refeicao-livre') {
    return <>{children}</>;
  }

  const isActive = (path: string) => location.pathname === path;

  const mostrarToast = (mensagem: string) => {
    setToastMsg(mensagem);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const acaoRapida = (acao: string) => {
    setIsFabOpen(false); 

    if (acao === 'agua') {
      adicionarAgua(250, 10000);
      mostrarToast('💧 +250ml de Água registados!');
    } else if (acao === 'peso') {
      setModalAtivo('peso');
    } else if (acao === 'refeicao') {
      navigate('/refeicao-livre');
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] w-full overflow-hidden transition-colors duration-300 relative ${
      temaEscuro ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'
    }`}>
      
      {/* AVISO FLUTUANTE (TOAST) NO TOPO */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[70] bg-green-500 text-zinc-950 px-6 py-3 rounded-full shadow-xl font-bold flex items-center gap-2 whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative w-full h-full"> 
        {children}
      </main>

      {/* MODAL PARA REGISTO DE PESO */}
      <AnimatePresence>
        {modalAtivo === 'peso' && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalAtivo(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className={`relative w-full max-w-sm p-6 rounded-3xl shadow-2xl z-10 ${
                temaEscuro ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">Atualizar Peso</h3>
              <p className="text-sm text-zinc-400 mb-6">Regista o teu peso atual em jejum.</p>
              <input 
                type="number" 
                placeholder="Ex: 75.5 kg" 
                className={`w-full p-4 rounded-xl text-lg font-medium outline-none transition-all mb-6 ${
                  temaEscuro 
                    ? 'bg-zinc-950 focus:ring-2 focus:ring-green-500 text-white' 
                    : 'bg-zinc-100 focus:ring-2 focus:ring-green-500 text-zinc-900'
                }`} 
                autoFocus 
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalAtivo(null)} 
                  className={`flex-1 p-4 rounded-xl font-bold transition-active active:scale-95 ${
                    temaEscuro ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                  }`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => { 
                    setModalAtivo(null); 
                    mostrarToast('⚖️ Peso atualizado com sucesso!'); 
                  }} 
                  className="flex-1 p-4 rounded-xl font-bold bg-green-500 text-zinc-950 shadow-lg shadow-green-500/30 transition-active active:scale-95 hover:bg-green-400"
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OVERLAY E MENU DE AÇÕES RÁPIDAS (FAB) */}
      <AnimatePresence>
        {isFabOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsFabOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-24 left-0 right-0 z-40 px-6 flex flex-col items-center gap-3 max-w-md mx-auto pointer-events-none"
            >
              <FabButton texto="Registar Peso" icone="⚖️" onClick={() => acaoRapida('peso')} temaEscuro={temaEscuro} delay={0.1} />
              <FabButton texto="Refeição Livre" icone="🍔" onClick={() => acaoRapida('refeicao')} temaEscuro={temaEscuro} delay={0.05} />
              <FabButton texto="Beber Água (+250ml)" icone="💧" onClick={() => acaoRapida('agua')} temaEscuro={temaEscuro} delay={0} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BARRA INFERIOR */}
      <nav className={`fixed bottom-0 w-full z-50 transition-colors duration-300 ${
        temaEscuro ? 'bg-zinc-950/60' : 'bg-white/60' 
      }`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: 'none',
        boxShadow: 'none'
      }}>
        <div className="pb-safe">
          <div className="flex justify-between items-center h-16 max-w-md mx-auto px-6 relative">
            
            <Link to="/" onClick={() => setIsFabOpen(false)} className="relative flex flex-col items-center justify-center w-12 h-12 group">
              <HomeIcon active={isActive('/')} temaEscuro={temaEscuro} />
              {isActive('/') && <ActiveIndicator />}
            </Link>

            <Link to="/plano" onClick={() => setIsFabOpen(false)} className="relative flex flex-col items-center justify-center w-12 h-12 group">
              <FoodIcon active={isActive('/plano')} temaEscuro={temaEscuro} />
              {isActive('/plano') && <ActiveIndicator />}
            </Link>

            <div className="relative -top-6 flex justify-center items-center w-16 group cursor-pointer z-50">
              <motion.button 
                onClick={() => setIsFabOpen(!isFabOpen)}
                animate={{ rotate: isFabOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-zinc-950 shadow-lg active:scale-90 transition-all duration-300 ${
                  isFabOpen ? 'bg-zinc-200 shadow-zinc-500/40' : 'bg-gradient-to-tr from-green-500 to-green-400 shadow-green-500/40 group-hover:shadow-green-500/60 group-hover:-translate-y-1'
                }`}
                aria-label="Menu de Ações"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </motion.button>
            </div>

            <Link to="/evolucao" onClick={() => setIsFabOpen(false)} className="relative flex flex-col items-center justify-center w-12 h-12 group">
              <ChartIcon active={isActive('/evolucao')} temaEscuro={temaEscuro} />
              {isActive('/evolucao') && <ActiveIndicator />}
            </Link>

            <Link to="/perfil" onClick={() => setIsFabOpen(false)} className="relative flex flex-col items-center justify-center w-12 h-12 group">
              <ProfileIcon active={isActive('/perfil')} temaEscuro={temaEscuro} />
              {isActive('/perfil') && <ActiveIndicator />}
            </Link>

          </div>
        </div>
      </nav>
    </div>
  );
}

// -----------------------------------------------------
// Componente de Botão do Menu de Ações
// -----------------------------------------------------
function FabButton({ texto, icone, onClick, temaEscuro, delay }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={`pointer-events-auto flex items-center justify-between w-56 px-5 py-4 rounded-2xl shadow-xl active:scale-95 transition-transform ${
        temaEscuro ? 'bg-zinc-800 border border-zinc-700 text-white' : 'bg-white border border-zinc-100 text-zinc-900'
      }`}
    >
      <span className="font-semibold text-sm">{texto}</span>
      <span className="text-xl">{icone}</span>
    </motion.button>
  );
}

// -----------------------------------------------------
// Componentes Secundários (Ícones e Indicador Ativo)
// -----------------------------------------------------
function ActiveIndicator() {
  return (
    <motion.span 
      layoutId="nav-indicator" 
      className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.9)]"
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    />
  );
}

function HomeIcon({ active, temaEscuro }: any) {
  const color = active ? 'text-green-500' : (temaEscuro ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500');
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${color} ${active ? '-translate-y-1' : ''}`}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function FoodIcon({ active, temaEscuro }: any) {
  const color = active ? 'text-green-500' : (temaEscuro ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500');
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${color} ${active ? '-translate-y-1' : ''}`}>
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M12 12v-3" />
      <path d="M12 6a3 3 0 0 0-3 3" />
      <path d="M15 9a3 3 0 0 0-3-3" />
    </svg>
  );
}

function ChartIcon({ active, temaEscuro }: any) {
  const color = active ? 'text-green-500' : (temaEscuro ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500');
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${color} ${active ? '-translate-y-1' : ''}`}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ProfileIcon({ active, temaEscuro }: any) {
  const color = active ? 'text-green-500' : (temaEscuro ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-400 group-hover:text-zinc-500');
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "2.5" : "2"} strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${color} ${active ? '-translate-y-1' : ''}`}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}