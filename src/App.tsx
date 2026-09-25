import { Button } from './components/Button';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-900 gap-6">
      <h1 className="text-3xl font-bold text-green-400">
        Nosso App de Nutrição!
      </h1>
      
      <Button onClick={() => alert('O botão está funcionando, chefe!')}>
        Começar agora
      </Button>
    </div>
  );
}