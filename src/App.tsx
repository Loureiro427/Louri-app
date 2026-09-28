import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Plano } from './pages/Plano';
import { Evolucao } from './pages/Evolucao';
import { Perfil } from './pages/Perfil';
import { Layout } from './components/Layout';
import { SwipeNavigator } from './components/SwipeNavigator';
import { configurarNotificacoesNativas } from './services/notificationService';

export function App() {
  useEffect(() => {
    configurarNotificacoesNativas();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <SwipeNavigator>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plano" element={<Plano />} />
            <Route path="/evolucao" element={<Evolucao />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </SwipeNavigator>
      </Layout>
    </HashRouter>
  );
}