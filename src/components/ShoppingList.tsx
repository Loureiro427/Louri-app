import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import {
  buildShoppingList,
  consolidateShoppingItems,
  shoppingProgress,
} from "../utils/shoppingList";
import type { ShoppingItem, ShoppingListData } from "../utils/shoppingList";
import { Icon, Progress, Sheet } from "./ui/AppUI";
export function ShoppingList({ onClose }: { onClose: () => void }) {
  const dados = useUserStore((s) => s.dados);
  const savedList = dados.listaCompras || {
    dias: 7,
    itens: buildShoppingList(dados, 7),
  };
  const list = {
    ...savedList,
    itens: consolidateShoppingItems(savedList.itens),
  };
  const [days, setDays] = useState(list.dias);
  const [filter, setFilter] = useState<"pending" | "all" | "pantry">("pending");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("un");
  const [category, setCategory] = useState("Mercearia");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [removed, setRemoved] = useState<ShoppingItem | null>(null);
  const save = (data: ShoppingListData) =>
    useUserStore.getState().setDados({ listaCompras: data });
  const update = (id: string, patch: Partial<ShoppingItem>) =>
    save({
      ...list,
      itens: list.itens.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  const progress = shoppingProgress(list.itens);
  const shown = list.itens.filter(
    (item) =>
      filter === "all" ||
      (filter === "pantry" ? item.emCasa : !item.comprado && !item.emCasa),
  );
  const categories = [...new Set(shown.map((item) => item.categoria))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
  const units = ["un", "g", "kg", "ml", "L"];
  return (
    <Sheet
      title="Sua próxima compra"
      description="Planeje a compra, tire o que já tem em casa e leve só o que falta."
      onClose={onClose}
    >
      <div className="app-shop-summary">
        <div>
          <strong>{progress.pending}</strong>
          <span>itens para comprar</span>
        </div>
        <small>
          {progress.bought} comprados · {progress.pantry} em casa
        </small>
      </div>
      <Progress
        value={list.itens.length - progress.pending}
        max={list.itens.length || 1}
        label="Progresso da compra"
      />
      <div className="app-shop-period">
        <label>
          Compra para
          <select
            aria-label="Dias da compra"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            {[1, 3, 5, 7, 10, 14, 21, 30].map((day) => (
              <option key={day} value={day}>
                {day} {day === 1 ? "dia" : "dias"}
              </option>
            ))}
          </select>
        </label>
        <button
          className="app-button app-button--secondary"
          onClick={() => {
            save({
              dias: days,
              itens: buildShoppingList(dados, days, list.itens),
            });
            setMessage(
              `Plano atualizado para ${days} dias. Seus itens e ajustes foram mantidos.`,
            );
          }}
        >
          Usar meu plano
        </button>
      </div>
      <p className="app-helper">
        As porções do plano viram uma referência para {list.dias} dias. Confira
        o rendimento de alimentos cozidos e ajuste a quantidade de compra.
        Quantidades editadas por você não mudam ao atualizar o plano.
      </p>
      {progress.missing > 0 && (
        <p className="app-shop-notice">
          {progress.missing}{" "}
          {progress.missing === 1
            ? "item precisa de quantidade"
            : "itens precisam de quantidade"}
          . Preencha abaixo para levar uma lista pronta ao mercado.
        </p>
      )}
      <div className="app-shop-toolbar">
        <div className="app-segmented">
          <button
            className={filter === "pending" ? "is-active" : ""}
            aria-pressed={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Falta comprar
          </button>
          <button
            className={filter === "pantry" ? "is-active" : ""}
            aria-pressed={filter === "pantry"}
            onClick={() => setFilter("pantry")}
          >
            Em casa ({progress.pantry})
          </button>
          <button
            className={filter === "all" ? "is-active" : ""}
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            Todos ({list.itens.length})
          </button>
        </div>
        <button className="app-text-button" onClick={() => setAdding(!adding)}>
          <Icon name="plus" size={16} />
          Adicionar
        </button>
      </div>
      {adding && (
        <form
          className="app-feature-form app-shop-add"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              setError("Dê um nome ao item.");
              return;
            }
            if (
              list.itens.some(
                (item) =>
                  item.nome.toLocaleLowerCase("pt-BR") ===
                  name.trim().toLocaleLowerCase("pt-BR"),
              )
            ) {
              setError("Esse item já está na lista. Confira a aba Todos.");
              return;
            }
            save({
              ...list,
              itens: [
                ...list.itens,
                {
                  id: `manual:${crypto.randomUUID()}`,
                  nome: name.trim(),
                  emoji: "🛒",
                  categoria: category,
                  quantidade: amount,
                  unidade: unit,
                  comprado: false,
                  emCasa: false,
                  manual: true,
                  quantidadeEditada: true,
                  referenciaGramas: 0,
                },
              ],
            });
            setName("");
            setAmount("");
            setError("");
            setAdding(false);
            setMessage("Item adicionado.");
          }}
        >
          <label>
            Item
            <input
              aria-label="Nome do item de compra"
              maxLength={70}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: detergente ou café"
            />
          </label>
          <div className="app-shop-quantity">
            <label>
              Quantidade
              <input
                aria-label="Quantidade do novo item"
                inputMode="decimal"
                maxLength={12}
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^\d,.]/g, ""))
                }
              />
            </label>
            <label>
              Unidade
              <select
                aria-label="Unidade do novo item"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Categoria
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {[
                "Hortifruti",
                "Proteínas",
                "Laticínios",
                "Mercearia",
                "Casa e higiene",
                "Outros",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <button className="app-button app-button--primary" type="submit">
            Adicionar à compra
          </button>
          {error && (
            <p className="app-field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
      {categories.map((c) => (
        <section key={c}>
          <h3 className="app-sheet-section-title">{c}</h3>
          {shown
            .filter((i) => i.categoria === c)
            .map((item) => (
              <article
                key={item.id}
                className={`app-shop-item ${
                  item.comprado || item.emCasa ? "is-resolved" : ""
                }`}
              >
                <div className="app-shop-item-title">
                  <input
                    type="checkbox"
                    aria-label={`Já comprei ${item.nome}`}
                    checked={item.comprado}
                    onChange={() =>
                      update(item.id, {
                        comprado: !item.comprado,
                        emCasa: false,
                      })
                    }
                  />
                  <span aria-hidden="true">{item.emoji}</span>
                  <strong>
                    {item.nome}
                    {item.preparo && (
                      <small className="app-shopping-prep">
                        {item.preparo}
                      </small>
                    )}
                  </strong>
                  <button
                    className="app-icon-button"
                    aria-label={`Remover ${item.nome} da lista`}
                    onClick={() => {
                      setRemoved(item);
                      save({
                        ...list,
                        itens: list.itens.filter((i) => i.id !== item.id),
                      });
                    }}
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
                <div className="app-shop-item-controls">
                  <input
                    aria-label={`Quantidade de ${item.nome}`}
                    inputMode="decimal"
                    placeholder="Quantidade"
                    value={item.quantidade}
                    maxLength={12}
                    onChange={(e) =>
                      update(item.id, {
                        quantidade: e.target.value.replace(/[^\d,.]/g, ""),
                        quantidadeEditada: true,
                      })
                    }
                  />
                  <select
                    aria-label={`Unidade de ${item.nome}`}
                    value={item.unidade}
                    onChange={(e) =>
                      update(item.id, {
                        unidade: e.target.value,
                        quantidadeEditada: true,
                      })
                    }
                  >
                    {units.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                  <button
                    aria-label={`Já tenho ${item.nome} em casa`}
                    aria-pressed={item.emCasa}
                    className={`app-shop-pantry ${
                      item.emCasa ? "is-active" : ""
                    }`}
                    onClick={() =>
                      update(item.id, { emCasa: !item.emCasa, comprado: false })
                    }
                  >
                    {item.emCasa ? (
                      <Icon name="check" size={13} />
                    ) : (
                      <Icon name="home" size={13} />
                    )}
                    {item.emCasa ? "Em casa" : "Já tenho em casa"}
                  </button>
                </div>
              </article>
            ))}
        </section>
      ))}
      {!shown.length && (
        <div className="app-empty-state">
          <Icon name={list.itens.length ? "check" : "file"} size={29} />
          <h3>
            {filter === "pantry"
              ? "Ainda sem itens em casa"
              : list.itens.length
                ? "Tudo resolvido por aqui"
                : "Monte sua lista"}
          </h3>
          <p>
            {filter === "pantry"
              ? "Use Já tenho em casa em um item da lista para separá-lo do que falta comprar."
              : list.itens.length
                ? "Os itens comprados e os que você já tem estão na aba Todos."
                : "Use os alimentos do plano ou adicione o que precisa comprar."}
          </p>
        </div>
      )}
      {removed && (
        <div className="app-shop-undo" role="status">
          <span>{removed.nome} removido</span>
          <button
            onClick={() => {
              save({ ...list, itens: [...list.itens, removed] });
              setRemoved(null);
            }}
          >
            Desfazer
          </button>
        </div>
      )}
      {message && (
        <p className="app-helper" role="status">
          {message}
        </p>
      )}
      {list.itens.length > 0 && (
        <button
          className="app-button app-button--secondary app-wide-button"
          onClick={() => {
            save({
              ...list,
              itens: list.itens.map((item) => ({ ...item, comprado: false })),
            });
            setFilter("pending");
            setMessage(
              "Nova compra iniciada. Os itens em casa continuam separados.",
            );
          }}
        >
          Reutilizar lista para outra compra
        </button>
      )}
    </Sheet>
  );
}
