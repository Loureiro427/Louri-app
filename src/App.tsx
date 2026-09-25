import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Se a URL for só a barra (/), mostre a tela Home */}
        <Route path="/" element={<Home />} />
        
        {/* Se a URL for /onboarding, mostre a tela de Onboarding */}
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </BrowserRouter>
  );
}