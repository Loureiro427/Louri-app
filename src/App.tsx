import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Plano } from './pages/Plano';
import { Evolucao } from './pages/Evolucao';
import { Perfil } from './pages/Perfil';
import { Layout } from './components/Layout';
import { configurarNotificacoesNativas } from './services/notificationService';

export function App() {
  useEffect(() => {
    // Inicializa o agendamento nativo das notificações em segundo plano ao abrir o app
    configurarNotificacoesNativas();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plano" element={<Plano />} />
          <Route path="/evolucao" element={<Evolucao />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}