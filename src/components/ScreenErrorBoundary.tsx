import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import logo from "../assets/logo.png";

type Props = { children: ReactNode };
type State = { message: string | null };

export class ScreenErrorBoundary extends Component<Props, State> {
  state: State = { message: null };
  static getDerivedStateFromError(error: unknown): State {
    return { message: error instanceof Error ? error.message : String(error) };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "[Louri] Erro ao abrir cadastro:",
      error,
      info.componentStack
    );
  }
  render() {
    if (this.state.message === null) return this.props.children;
    return (
      <div className="h-[100dvh] overflow-y-auto bg-[#0b1114] text-white flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
          <img
            src={logo}
            alt="Louri"
            className="w-14 h-14 object-contain mb-5"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Não foi possível abrir o cadastro.
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed mt-3">
            Tente abrir novamente. Seus dados não serão apagados.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ message: null })}
            className="w-full mt-6 py-3.5 rounded-2xl bg-green-500 text-zinc-950 font-bold"
          >
            Tentar novamente
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.hash = "/";
            }}
            className="w-full mt-2 py-3 text-sm text-zinc-300"
          >
            Voltar ao início
          </button>
          <details className="mt-4 text-xs text-zinc-500">
            <summary className="cursor-pointer">
              Detalhes para o suporte
            </summary>
            <p className="mt-2 break-words select-text">{this.state.message}</p>
          </details>
        </div>
      </div>
    );
  }
}
