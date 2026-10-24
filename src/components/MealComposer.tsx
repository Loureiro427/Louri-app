import { CustomFoodActions } from "./CustomFoodActions";
import { FoodVisual } from "./FoodVisual";
import { DiscardChanges } from "./DiscardChanges";
import {
  foodMatches,
  recentFoodRanks,
  samePortions,
} from "../utils/foodSearch";
import type { Ref } from "react";
import { PortionInput } from "./PortionInput";
import { ContextTip } from "./AppGuide";
import { householdMeasure, lastMealPortions } from "../utils/easyMeals";
import { fullCatalog } from "../utils/appFeatures";
import { recipeForCatalog } from "../utils/appFeatures";
import { FoodLibrary } from "./FoodLibrary";
import { useBackLayer } from "../hooks/useBackLayer";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Alimento } from "../data/alimentos";
import { calcularPorcoes, todosAlimentos } from "../data/alimentos";
import { normalizeMealPreferences } from "../utils/mealPreferences";
import { useUserStore } from "../store/useUserStore";
import { Icon } from "./ui/AppUI";
import { numberText } from "./ui/format";
import {
  replacementCandidates,
  replacementPortion,
} from "../utils/dailyExperience";
export type MealComposerHandle = { requestClose: () => void };
type Props = {
  ref?: Ref<MealComposerHandle>;
  alimentos: Alimento[];
  initialPorcoes?: Record<string, number>;
  confirmLabel?: string;
  memoriaKey: string;
  titulo: string;
  onClose: () => void;
  onConfirm: (porcoes: Record<string, number>) => void;
};
export function MealComposer({
  ref,
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
  const [newFoodName, setNewFoodName] = useState("");
  const [discard, setDiscard] = useState(false);
  const [busca, setBusca] = useState("");
  const [swap, setSwap] = useState<Alimento | null>(null);
  const [swapSearch, setSwapSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [foodFilter, setFoodFilter] = useState<"all" | "favorites" | "custom">(
    "all",
  );
  const [porcoes, setPorcoes] =
    useState<Record<string, number>>(initialPorcoes);
  const [initial] = useState(() => ({ ...initialPorcoes }));
  const dirty = !samePortions(initial, porcoes);
  const requestClose = useCallback(
    () => (dirty ? setDiscard(true) : onClose()),
    [dirty, onClose],
  );
  useImperativeHandle(ref, () => ({ requestClose }), [requestClose]);
  useBackLayer(true, () => {
    if (library) setLibrary(false);
    else if (swap) setSwap(null);
    else requestClose();
  });
  useEffect(() => {
    if (!dirty) return;
    const prevent = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", prevent);
    return () => window.removeEventListener("beforeunload", prevent);
  }, [dirty]);
  const recent = useMemo(() => recentFoodRanks(dados), [dados]);
  const recentNames = useMemo(() => {
    const result = new Map<string, number>();
    for (const food of fullCatalog(dados)) {
      const rank = recent.get(food.id);
      if (rank !== undefined)
        result.set(
          food.nome,
          Math.min(result.get(food.nome) ?? Infinity, rank),
        );
    }
    return result;
  }, [dados, recent]);
  const alimentos = [
    ...fullCatalog(dados).filter((f) => Object.keys(porcoes).includes(f.id)),
    ...suppliedFoods,
    ...(dados.alimentosPersonalizados || []).filter((f) => !f.arquivado),
  ].filter(
    (f, i, all) =>
      all.findIndex(
        (a) =>
          a.id === f.id ||
          (!f.id.startsWith("custom_") &&
            !a.id.startsWith("custom_") &&
            a.nome === f.nome),
      ) === i,
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
    item.id.startsWith("custom_")
      ? item.id
      : todosAlimentos.find((a) => a.nome === item.nome)?.id || item.id;
  const isFavorite = (item: Alimento) =>
    favorites.includes(favoriteId(item)) || favorites.includes(item.id);
  const repeat = useMemo(
    () => lastMealPortions(dados, memoriaKey),
    [dados, memoriaKey],
  );
  const filtered = alimentos
    .filter(
      (item) =>
        (!item.arquivado || porcoes[item.id] !== undefined) &&
        foodMatches(item, busca) &&
        (foodFilter === "all" ||
          (foodFilter === "favorites"
            ? isFavorite(item)
            : item.id.startsWith("custom_"))),
    )
    .sort(
      (a, b) =>
        (recentNames.get(a.nome) ?? Infinity) -
          (recentNames.get(b.nome) ?? Infinity) ||
        Number(isFavorite(b)) - Number(isFavorite(a)) ||
        Number(preferences.includes(b.id)) - Number(preferences.includes(a.id)),
    );
  const total = calcularPorcoes(porcoes, alimentos);
  const alternatives = swap
    ? replacementCandidates(swap, porcoes[swap.id], alimentos)
        .filter((f) => foodMatches(f, swapSearch))
        .slice(0, swapSearch ? 50 : 8)
    : [];
  const count = Object.values(porcoes).filter((g) => g > 0).length;
  const toggle = (item: Alimento) =>
    setPorcoes((previous) => {
      const next = { ...previous };
      if (next[item.id] !== undefined) delete next[item.id];
      else next[item.id] = householdMeasure(item)?.grams || 100;
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
          (dados.temaEscuro ?? true) ? "" : "app-light"
        }`}
        aria-label={titulo}
        onKeyDown={(e) => {
          if (!section.current?.contains(e.target as Node)) return;
          if (e.key === "Escape") {
            e.preventDefault();
            requestClose();
          }
          if (e.key !== "Tab") return;
          const items = Array.from(
            section.current?.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input:not(:disabled)",
            ) || [],
          ).filter((item) => item.getClientRects().length > 0);
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
              onClick={requestClose}
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
            onClick={() => {
              setNewFoodName("");
              setLibrary(true);
            }}
          >
            <Icon name="plus" size={14} />
            Adicionar alimento ou usar combinação
          </button>
          <div className="app-composer-toolbar">
            <div
              className="app-segmented"
              role="group"
              aria-label="Filtrar alimentos"
            >
              <button
                aria-pressed={foodFilter === "all"}
                className={foodFilter === "all" ? "is-active" : ""}
                onClick={() => setFoodFilter("all")}
              >
                Todos
              </button>
              <button
                aria-pressed={foodFilter === "favorites"}
                className={foodFilter === "favorites" ? "is-active" : ""}
                onClick={() => setFoodFilter("favorites")}
              >
                <Icon name="star" size={12} /> Favoritos
              </button>
              <button
                aria-pressed={foodFilter === "custom"}
                className={foodFilter === "custom" ? "is-active" : ""}
                onClick={() => setFoodFilter("custom")}
              >
                Meus alimentos
              </button>
            </div>
            {Object.keys(repeat).length > 0 && (
              <button
                className="app-repeat-button"
                onClick={() => {
                  setPorcoes(repeat);
                  setBusca("");
                  setFoodFilter("all");
                  setNotice(
                    "Última combinação preenchida. Confira os alimentos e as quantidades; só será registrada quando você salvar.",
                  );
                }}
              >
                <Icon name="reset" size={14} /> Repetir última
              </button>
            )}
          </div>
        </header>
        <div className="app-composer-body custom-scrollbar">
          {notice && (
            <p className="app-inline-notice" role="status">
              {notice}
            </p>
          )}
          {swap && (
            <section
              className="app-swap-panel"
              aria-label={`Trocar ${swap.nome}`}
            >
              <div className="app-section-heading">
                <h3>Trocar {swap.nome}</h3>
                <button
                  className="app-icon-button"
                  aria-label="Cancelar troca"
                  onClick={() => setSwap(null)}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>
              <p>
                Escolha o que você tem. A porção sugerida mantém calorias
                próximas; proteínas, carboidratos e gorduras podem mudar.
              </p>
              <label className="app-search">
                <Icon name="search" size={18} />
                <input
                  autoFocus
                  aria-label="Buscar substituto"
                  placeholder="O que você tem hoje?"
                  value={swapSearch}
                  onChange={(e) => setSwapSearch(e.target.value)}
                />
              </label>
              <div className="app-swap-options">
                {alternatives.map((f) => {
                  const amount = replacementPortion(swap, porcoes[swap.id], f)!;
                  return (
                    <button
                      key={f.id}
                      className="app-swap-option"
                      onClick={() => {
                        setPorcoes((previous) => {
                          const next = { ...previous };
                          delete next[swap.id];
                          next[f.id] = (next[f.id] || 0) + amount;
                          return next;
                        });
                        setNotice(
                          `${swap.nome} trocado por ${f.nome}. Confira a quantidade antes de salvar.`,
                        );
                        setSwap(null);
                      }}
                    >
                      <span aria-hidden="true">
                        <FoodVisual food={f} />
                      </span>
                      <span>
                        <strong>{f.nome}</strong>
                        <small>
                          {numberText(amount)} g ·{" "}
                          {numberText((f.kcal100g * amount) / 100)} kcal
                        </small>
                      </span>
                      <Icon name="chevron" size={16} />
                    </button>
                  );
                })}
              </div>
              {!alternatives.length && (
                <p>Nenhuma opção por esse nome. Tente outro alimento.</p>
              )}
              {!swapSearch && <p>Busque por nome para ver outras opções.</p>}
            </section>
          )}
          <ContextTip id="meal-portions">
            Toque no alimento para escolher. Depois ajuste a quantidade. Nos
            alimentos com medida caseira, você pode usar unidades ou colheres.
          </ContextTip>
          <p className="app-composer-helper">
            Escolha os alimentos e ajuste as quantidades.
          </p>
          <div className="app-food-list">
            {filtered.map((item) => {
              const selected = porcoes[item.id] !== undefined;
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
                        <FoodVisual food={item} />
                      </span>
                      <span className="app-food-list-copy">
                        <strong>{item.nome}</strong>
                        {item.preparo && <small>{item.preparo}</small>}
                        <small>
                          {selected
                            ? `${Math.round(
                                (item.kcal100g * porcoes[item.id]) / 100,
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
                  {item.id.startsWith("custom_") && !item.arquivado && (
                    <CustomFoodActions
                      food={item}
                      onDeleted={() =>
                        setPorcoes((previous) => {
                          const next = { ...previous };
                          delete next[item.id];
                          return next;
                        })
                      }
                    />
                  )}
                  {selected && (
                    <div className="app-quantity-panel">
                      <button
                        className="app-text-button app-swap-trigger"
                        onClick={() => {
                          setSwap(item);
                          setSwapSearch("");
                          section.current
                            ?.querySelector(".app-composer-body")
                            ?.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Icon name="reset" size={14} /> Trocar alimento
                      </button>
                      <PortionInput
                        food={item}
                        grams={porcoes[item.id]}
                        onChange={(grams) => quantity(item.id, grams)}
                      />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <div className="app-empty-state">
              <Icon
                name={foodFilter === "favorites" ? "star" : "search"}
                size={26}
              />
              <h3>
                {busca
                  ? "Nenhum alimento encontrado"
                  : foodFilter === "custom"
                    ? "Seus alimentos ficam aqui"
                    : foodFilter === "favorites"
                      ? "Seus favoritos ficam aqui"
                      : "Nenhum alimento encontrado"}
              </h3>
              <p>
                {busca
                  ? "Tente outro nome ou adicione seu próprio alimento."
                  : foodFilter === "custom"
                    ? "Adicione um alimento pelo rótulo para encontrá-lo facilmente aqui."
                    : foodFilter === "favorites"
                      ? "Toque na estrela ao lado de um alimento para salvar."
                      : "Tente um nome popular ou adicione seu próprio alimento."}
              </p>
            </div>
          )}
          <button
            className="app-text-button app-add-personal"
            onClick={() => {
              setNewFoodName(busca.trim());
              setLibrary(true);
            }}
          >
            <Icon name="plus" size={16} />
            {foodFilter === "custom"
              ? "Adicionar alimento"
              : "Não achei meu alimento · adicionar"}
          </button>
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
              disabled={count === 0 || saving}
              onClick={() => {
                if (submitted.current || count === 0) return;
                submitted.current = true;
                setSaving(true);
                onConfirm(
                  Object.fromEntries(
                    Object.entries(porcoes).filter(([, g]) => g > 0),
                  ),
                );
              }}
            >
              {saving ? "Salvando…" : confirmLabel}
              <Icon name="check" size={17} />
            </button>
          </div>
        </footer>
      </section>
      {discard && (
        <DiscardChanges onKeep={() => setDiscard(false)} onDiscard={onClose} />
      )}
      {library && (
        <FoodLibrary
          porcoes={porcoes}
          initialName={newFoodName}
          onSelect={(id, grams) => {
            setPorcoes((previous) => ({ ...previous, [id]: grams }));
            setBusca("");
            setFoodFilter("custom");
            setNotice(
              "Alimento selecionado. Confira a quantidade antes de registrar.",
            );
          }}
          onApply={(p) => setPorcoes(recipeForCatalog(dados, p, memoriaKey))}
          onClose={() => setLibrary(false)}
        />
      )}
    </>
  );
}
