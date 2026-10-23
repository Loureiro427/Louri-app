import { fullCatalog } from "../utils/appFeatures";
import { recipeForCatalog } from "../utils/appFeatures";
import { FoodLibrary } from "./FoodLibrary";
import { useEffect, useRef, useState } from "react";
import type { Alimento } from "../data/alimentos";
import { calcularPorcoes, todosAlimentos } from "../data/alimentos";
import { normalizeMealPreferences } from "../utils/mealPreferences";
import { useUserStore } from "../store/useUserStore";
import { Icon, numberText } from "./ui/AppUI";
type Props = {
  alimentos: Alimento[];
  initialPorcoes?: Record<string, number>;
  confirmLabel?: string;
  memoriaKey: string;
  titulo: string;
  onClose: () => void;
  onConfirm: (porcoes: Record<string, number>) => void;
};
const normalizar = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
function medida(item: Alimento): { nome: string; gramas: number } | undefined {
  if (item.id === "pao") return { nome: "1 pão", gramas: 50 };
  if (item.nome.includes("Ovo")) return { nome: "1 unidade", gramas: 50 };
  if (item.nome === "Banana") return { nome: "1 unidade", gramas: 80 };
  if (item.nome === "Maçã") return { nome: "1 unidade", gramas: 130 };
  if (item.nome === "Arroz") return { nome: "1 colher de sopa", gramas: 25 };
  if (item.nome === "Aveia") return { nome: "1 colher de sopa", gramas: 15 };
}
export function MealComposer({
  alimentos: suppliedFoods,
  initialPorcoes = {},
  confirmLabel = "Registrar refeição",
  memoriaKey,
  titulo,
  onClose,
  onConfirm,
}: Props) {
  const section = useRef<HTMLElement>(null);
  const dados = useUserStore((state) => state.dados);
  const [library, setLibrary] = useState(false);
  const [busca, setBusca] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [porcoes, setPorcoes] =
    useState<Record<string, number>>(initialPorcoes);
  const alimentos = [
    ...fullCatalog(dados).filter((f) => Object.keys(porcoes).includes(f.id)),
    ...suppliedFoods,
    ...(dados.alimentosPersonalizados || []),
  ].filter(
    (f, i, all) =>
      all.findIndex(
        (a) =>
          a.id === f.id || (!f.id.startsWith("custom_") && a.nome === f.nome)
      ) === i
  );
  const [saving, setSaving] = useState(false);
  const submitted = useRef(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    section.current?.focus({ preventScroll: true });
    return () => previous?.focus({ preventScroll: true });
  }, []);
  const favorites = dados.favoritos || [];
  const preferences =
    normalizeMealPreferences(dados.alimentos)[memoriaKey] || [];
  const favoriteId = (item: Alimento) =>
    todosAlimentos.find((a) => a.nome === item.nome)?.id || item.id;
  const isFavorite = (item: Alimento) =>
    favorites.includes(favoriteId(item)) || favorites.includes(item.id);
  const repeat = Object.fromEntries(
    Object.entries(dados.ultimasPorcoes?.[memoriaKey] || {}).filter(
      ([id, g]) =>
        alimentos.some((a) => a.id === id) && Number.isFinite(g) && g > 0
    )
  );
  const filtered = alimentos
    .filter(
      (item) =>
        normalizar(item.nome).includes(normalizar(busca)) &&
        (!favoritesOnly || isFavorite(item))
    )
    .sort(
      (a, b) =>
        Number(isFavorite(b)) - Number(isFavorite(a)) ||
        Number(preferences.includes(b.id)) - Number(preferences.includes(a.id))
    );
  const total = calcularPorcoes(porcoes, alimentos);
  const count = Object.values(porcoes).filter((g) => g > 0).length;
  const toggle = (item: Alimento) =>
    setPorcoes((previous) => {
      const next = { ...previous };
      if (next[item.id] !== undefined) delete next[item.id];
      else next[item.id] = medida(item)?.gramas || 100;
      return next;
    });
  const quantity = (id: string, value: number) =>
    setPorcoes((previous) => ({
      ...previous,
      [id]: Math.min(9999, Math.max(0, Number.isFinite(value) ? value : 0)),
    }));
  return (
    <>
      <section
        ref={section}
        tabIndex={-1}
        className={`app-themed app-composer ${
          dados.temaEscuro ?? true ? "" : "app-light"
        }`}
        aria-label={titulo}
        onKeyDown={(e) => {
          if (!section.current?.contains(e.target as Node)) return;
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
          if (e.key !== "Tab") return;
          const items = Array.from(
            section.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input:not(:disabled)"
            ) || []
          );
          const first = items[0],
            last = items.at(-1);
          if (
            e.shiftKey &&
            (document.activeElement === first ||
              document.activeElement === section.current)
          ) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <header className="app-composer-header">
          <div className="app-composer-title">
            <div>
              <p className="app-eyebrow">Registro de refeição</p>
              <h2>{titulo}</h2>
            </div>
            <button
              className="app-icon-button"
              aria-label="Fechar refeição"
              onClick={onClose}
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <label className="app-search">
            <Icon name="search" size={19} />
            <input
              aria-label="Buscar alimento"
              placeholder="Buscar alimento"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            {busca && (
              <button
                type="button"
                aria-label="Limpar busca"
                onClick={() => setBusca("")}
              >
                <Icon name="close" size={16} />
              </button>
            )}
          </label>
          <button
            className="app-text-button app-library-button"
            onClick={() => setLibrary(true)}
          >
            <Icon name="star" size={14} />
            Minha coleção · salvar combinação ou criar alimento
          </button>
          <div className="app-composer-toolbar">
            <div className="app-segmented">
              <button
                aria-pressed={!favoritesOnly}
                className={!favoritesOnly ? "is-active" : ""}
                onClick={() => setFavoritesOnly(false)}
              >
                Todos
              </button>
              <button
                aria-pressed={favoritesOnly}
                className={favoritesOnly ? "is-active" : ""}
                onClick={() => setFavoritesOnly(true)}
              >
                <Icon name="star" size={12} /> Favoritos
              </button>
            </div>
            {Object.keys(repeat).length > 0 && (
              <button
                className="app-repeat-button"
                onClick={() => setPorcoes(repeat)}
              >
                <Icon name="reset" size={14} /> Repetir última
              </button>
            )}
          </div>
        </header>
        <div className="app-composer-body custom-scrollbar">
          <p className="app-composer-helper">
            Escolha os alimentos e ajuste as quantidades.
          </p>
          <div className="app-food-list">
            {filtered.map((item) => {
              const selected = porcoes[item.id] !== undefined;
              const shortcut = medida(item);
              return (
                <article
                  key={item.id}
                  className={`app-food-list-item ${
                    selected ? "is-selected" : ""
                  }`}
                >
                  <div className="app-food-main">
                    <button
                      className="app-food-select"
                      aria-label={item.nome}
                      aria-pressed={selected}
                      onClick={() => toggle(item)}
                    >
                      <span className="app-food-list-emoji" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span className="app-food-list-copy">
                        <strong>{item.nome}</strong>
                        <small>
                          {selected
                            ? `${Math.round(
                                (item.kcal100g * porcoes[item.id]) / 100
                              )} kcal nesta porção`
                            : `${numberText(item.kcal100g, 1)} kcal por 100 g`}
                        </small>
                      </span>
                      <span className="app-food-select-state">
                        {selected ? (
                          <Icon name="check" size={15} />
                        ) : (
                          <Icon name="plus" size={17} />
                        )}
                      </span>
                    </button>
                    <button
                      className={`app-favorite-button ${
                        isFavorite(item) ? "is-favorite" : ""
                      }`}
                      aria-label={`${
                        isFavorite(item) ? "Remover" : "Adicionar"
                      } ${item.nome} dos favoritos`}
                      aria-pressed={isFavorite(item)}
                      onClick={() =>
                        useUserStore.getState().toggleFavorito(favoriteId(item))
                      }
                    >
                      <Icon name="star" size={18} />
                    </button>
                  </div>
                  {selected && (
                    <div className="app-quantity-panel">
                      <div>
                        <label htmlFor={`quantity-${item.id}`}>
                          Quantidade
                        </label>
                        <div className="app-quantity-control">
                          <button
                            aria-label={`Diminuir quantidade de ${item.nome}`}
                            onClick={() =>
                              quantity(item.id, porcoes[item.id] - 25)
                            }
                          >
                            −
                          </button>
                          <div>
                            <input
                              id={`quantity-${item.id}`}
                              aria-label={`Gramas de ${item.nome}`}
                              type="number"
                              inputMode="decimal"
                              min="0"
                              max="9999"
                              value={porcoes[item.id] || ""}
                              onChange={(e) =>
                                quantity(item.id, Number(e.target.value))
                              }
                            />
                            <span>g</span>
                          </div>
                          <button
                            aria-label={`Aumentar quantidade de ${item.nome}`}
                            onClick={() =>
                              quantity(item.id, porcoes[item.id] + 25)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {shortcut && (
                        <button
                          className="app-portion-shortcut"
                          onClick={() => quantity(item.id, shortcut.gramas)}
                        >
                          ≈ {shortcut.nome} ({shortcut.gramas} g)
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <div className="app-empty-state">
              <Icon name={favoritesOnly ? "star" : "search"} size={26} />
              <h3>
                {favoritesOnly
                  ? "Seus favoritos ficam aqui"
                  : "Nenhum alimento encontrado"}
              </h3>
              <p>
                {favoritesOnly
                  ? "Toque na estrela ao lado de um alimento para salvar."
                  : "Tente buscar por outro nome."}
              </p>
            </div>
          )}
          <p className="app-helper">
            Porções e valores aproximados. Você pode ajustar os gramas.
          </p>
        </div>
        <footer className="app-composer-footer">
          <div className="app-composer-macros">
            <span>
              Proteína <b>{total.macros.proteina} g</b>
            </span>
            <span>
              Carboidratos <b>{total.macros.carbo} g</b>
            </span>
            <span>
              Gorduras <b>{total.macros.gordura} g</b>
            </span>
          </div>
          <div className="app-composer-confirm">
            <div>
              <span>
                {count} {count === 1 ? "alimento" : "alimentos"}
              </span>
              <strong>
                {numberText(total.calorias)}
                <small> kcal</small>
              </strong>
            </div>
            <button
              className="app-button app-button--primary"
              disabled={total.calorias <= 0 || saving}
              onClick={() => {
                if (submitted.current || total.calorias <= 0) return;
                submitted.current = true;
                setSaving(true);
                onConfirm(
                  Object.fromEntries(
                    Object.entries(porcoes).filter(([, g]) => g > 0)
                  )
                );
              }}
            >
              {saving ? "Salvando…" : confirmLabel}
              <Icon name="check" size={17} />
            </button>
          </div>
        </footer>
      </section>
      {library && (
        <FoodLibrary
          porcoes={porcoes}
          onApply={(p) => setPorcoes(recipeForCatalog(dados, p, memoriaKey))}
          onClose={() => setLibrary(false)}
        />
      )}
    </>
  );
}
