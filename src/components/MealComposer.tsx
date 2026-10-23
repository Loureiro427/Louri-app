import { useEffect, useRef, useState } from "react";
import type { Alimento } from "../data/alimentos";
import { calcularPorcoes, todosAlimentos } from "../data/alimentos";
import { useUserStore } from "../store/useUserStore";

type Props = {
  alimentos: Alimento[];
  memoriaKey: string;
  titulo: string;
  onClose: () => void;
  onConfirm: (porcoes: Record<string, number>) => void;
};
const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
// Atalhos aproximados; a quantidade em gramas permanece visível e editável.
function medida(item: Alimento): { nome: string; gramas: number } | undefined {
  if (item.id === "pao") return { nome: "1 pão", gramas: 50 };
  if (item.nome.includes("Ovo")) return { nome: "1 unidade", gramas: 50 };
  if (item.nome === "Banana") return { nome: "1 unidade", gramas: 80 };
  if (item.nome === "Maçã") return { nome: "1 unidade", gramas: 130 };
  if (item.nome === "Arroz") return { nome: "1 colher de sopa", gramas: 25 };
  if (item.nome === "Aveia") return { nome: "1 colher de sopa", gramas: 15 };
  return undefined;
}
export function MealComposer({
  alimentos,
  memoriaKey,
  titulo,
  onClose,
  onConfirm,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    sectionRef.current?.focus({ preventScroll: true });
    return () => {
      anterior?.focus({ preventScroll: true });
    };
  }, []);
  const dados = useUserStore((state) => state.dados);
  const toggleFavorito = useUserStore((state) => state.toggleFavorito);
  const escuro = dados.temaEscuro ?? true;
  const [busca, setBusca] = useState("");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [porcoes, setPorcoes] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const enviado = useRef(false);
  const favoritos = dados.favoritos || [];
  const anteriores = dados.ultimasPorcoes?.[memoriaKey];
  const repetiveis = Object.fromEntries(
    Object.entries(anteriores || {}).filter(
      ([id, g]) => alimentos.some((a) => a.id === id) && g > 0
    )
  );
  const preferencias = dados.alimentos[memoriaKey] || [];
  const favoritoId = (item: Alimento) =>
    todosAlimentos.find((a) => a.nome === item.nome)?.id || item.id;
  const ehFavorito = (item: Alimento) =>
    favoritos.includes(favoritoId(item)) || favoritos.includes(item.id);
  const filtrados = alimentos
    .filter(
      (a) =>
        normalizar(a.nome).includes(normalizar(busca)) &&
        (!soFavoritos || ehFavorito(a))
    )
    .sort(
      (a, b) =>
        Number(ehFavorito(b)) - Number(ehFavorito(a)) ||
        Number(preferencias.includes(b.id) || preferencias.includes(b.nome)) -
          Number(preferencias.includes(a.id) || preferencias.includes(a.nome))
    );
  const total = calcularPorcoes(porcoes, alimentos);
  const surface = escuro
    ? "bg-zinc-900 border-zinc-800 text-white"
    : "bg-white border-zinc-200 text-zinc-900";
  const muted = escuro ? "text-zinc-400" : "text-zinc-600";
  const confirmar = () => {
    if (enviado.current || total.calorias <= 0) return;
    enviado.current = true;
    setEnviando(true);
    onConfirm(
      Object.fromEntries(Object.entries(porcoes).filter(([, g]) => g > 0))
    );
  };
  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
        if (e.key !== "Tab") return;
        const controles = Array.from(
          sectionRef.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled)"
          ) || []
        );
        const primeiro = controles[0];
        const ultimo = controles.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === primeiro ||
            document.activeElement === sectionRef.current)
        ) {
          e.preventDefault();
          ultimo?.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primeiro?.focus();
        }
      }}
      className={`flex flex-col h-full min-h-0 ${surface}`}
      aria-label={titulo}
    >
      <header className="px-6 pt-6 pb-3 shrink-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className={`text-[10px] uppercase tracking-widest ${muted}`}>
              Registro de refeição
            </p>
            <h2 className="text-xl font-bold">{titulo}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar refeição"
            className={`w-10 h-10 rounded-full border text-2xl ${
              escuro
                ? "bg-zinc-800 border-zinc-700"
                : "bg-zinc-100 border-zinc-200"
            }`}
          >
            ×
          </button>
        </div>
        <label
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${
            escuro
              ? "bg-zinc-950/60 border-zinc-800"
              : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <span aria-hidden="true">🔍</span>
          <input
            aria-label="Buscar alimento"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar alimento..."
            className="bg-transparent outline-none w-full text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            aria-pressed={soFavoritos}
            onClick={() => setSoFavoritos(!soFavoritos)}
            className={`text-xs font-semibold rounded-full px-3 py-2 border ${
              soFavoritos
                ? "bg-green-500/10 border-green-500 text-green-500"
                : escuro
                ? "border-zinc-700 text-zinc-300"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            ★ Favoritos
          </button>
          {Object.keys(repetiveis).length > 0 && (
            <button
              onClick={() => setPorcoes(repetiveis)}
              className="text-xs font-semibold rounded-full px-3 py-2 border border-green-500/30 text-green-500"
            >
              ↻ Repetir última refeição
            </button>
          )}
        </div>
        <p className={`text-[10px] mt-3 ${muted}`}>
          Porções e valores aproximados. Ajuste os gramas quando precisar.
        </p>
      </header>
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 custom-scrollbar">
        {filtrados.length === 0 && (
          <p className={`text-center text-sm py-10 ${muted}`}>
            {soFavoritos
              ? "Toque na estrela de um alimento para salvá-lo aqui."
              : "Nenhum alimento encontrado."}
          </p>
        )}
        <div className="grid grid-cols-3 gap-2">
          {filtrados.map((item) => {
            const selecionado = porcoes[item.id] !== undefined;
            const atalho = medida(item);
            return (
              <div
                key={item.id}
                className={`relative rounded-2xl border p-3 pt-8 flex flex-col items-center gap-2 ${
                  selecionado
                    ? "border-green-500 bg-green-500/10"
                    : escuro
                    ? "border-zinc-800 bg-zinc-950/40"
                    : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <button
                  aria-label={`${ehFavorito(item) ? "Remover" : "Adicionar"} ${
                    item.nome
                  } dos favoritos`}
                  aria-pressed={ehFavorito(item)}
                  onClick={() => toggleFavorito(favoritoId(item))}
                  className={`absolute top-0 right-0 w-9 h-9 text-lg ${
                    ehFavorito(item) ? "text-green-500" : muted
                  }`}
                >
                  {ehFavorito(item) ? "★" : "☆"}
                </button>
                <button
                  onClick={() =>
                    setPorcoes((prev) => {
                      const next = { ...prev };
                      if (selecionado) delete next[item.id];
                      else next[item.id] = atalho?.gramas || 100;
                      return next;
                    })
                  }
                  aria-pressed={selecionado}
                  className="w-full flex flex-col items-center gap-2"
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-xs font-semibold text-center leading-tight min-h-8">
                    {item.nome}
                  </span>
                </button>
                {selecionado ? (
                  <>
                    <label
                      className={`flex items-center justify-center gap-1 rounded-xl border w-full px-2 py-2 ${
                        escuro
                          ? "bg-zinc-950 border-zinc-700"
                          : "bg-white border-zinc-200"
                      }`}
                    >
                      <input
                        aria-label={`Gramas de ${item.nome}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="9999"
                        step="1"
                        value={porcoes[item.id] || ""}
                        onChange={(e) =>
                          setPorcoes((prev) => ({
                            ...prev,
                            [item.id]: Math.min(
                              9999,
                              Math.max(0, Number(e.target.value) || 0)
                            ),
                          }))
                        }
                        onFocus={(e) =>
                          e.currentTarget.scrollIntoView({
                            block: "nearest",
                            behavior: "smooth",
                          })
                        }
                        className="w-full min-w-0 bg-transparent text-center text-sm font-bold outline-none"
                      />
                      <span className={`text-[10px] ${muted}`}>g</span>
                    </label>
                    {atalho && (
                      <button
                        onClick={() =>
                          setPorcoes((prev) => ({
                            ...prev,
                            [item.id]: atalho.gramas,
                          }))
                        }
                        className="text-[10px] text-green-500 font-semibold"
                      >
                        ≈ {atalho.nome} ({atalho.gramas}g)
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-orange-500">
                      {Math.round((item.kcal100g * porcoes[item.id]) / 100)}{" "}
                      kcal
                    </span>
                  </>
                ) : (
                  <span className={`text-[10px] ${muted}`}>
                    {item.kcal100g} kcal / 100g
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <footer
        className={`shrink-0 px-6 py-4 border-t pb-safe ${
          escuro ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
        }`}
      >
        <div className={`text-[10px] mb-2 ${muted}`}>
          Proteína {total.macros.proteina}g · Carboidratos {total.macros.carbo}g
          · Gorduras {total.macros.gordura}g
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-[10px] uppercase tracking-wider ${muted}`}>
              Total
            </p>
            <p className="text-xl font-bold text-orange-500">
              {total.calorias} kcal
            </p>
          </div>
          <button
            disabled={total.calorias <= 0 || enviando}
            onClick={confirmar}
            className="bg-green-500 text-zinc-950 font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-green-500/20 disabled:opacity-40 disabled:shadow-none active:scale-95"
          >
            {enviando ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </footer>
    </section>
  );
}
