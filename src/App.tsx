import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { Plano } from './pages/Plano';
import { Evolucao } from './pages/Evolucao';
import { Perfil } from './pages/Perfil';
import { RefeicaoLivre } from './pages/RefeicaoLivre'; // <-- Importa a nova página
import { Layout } from './components/Layout';
import { SwipeNavigator } from './components/SwipeNavigator';

export function App() {
  return (
    <HashRouter>
      <Layout>
        <SwipeNavigator>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plano" element={<Plano />} />
            <Route path="/evolucao" element={<Evolucao />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/refeicao-livre" element={<RefeicaoLivre />} /> {/* <-- Adiciona a rota aqui */}
            <Route path="/onboarding" element={<Onboarding />} />
          </Routes>
        </SwipeNavigator>
      </Layout>
    </HashRouter>
  );
}