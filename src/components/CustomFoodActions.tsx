import { removeCustomFood } from "../utils/removeCustomFood";
import { useState } from "react";
import type { Alimento } from "../data/alimentos";
import { useUserStore } from "../store/useUserStore";
import { Sheet, Icon } from "./ui/AppUI";
import { FoodVisual } from "./FoodVisual";

export function CustomFoodActions({
  food,
  onDeleted,
}: {
  food: Alimento;
  onDeleted?: () => void;
}) {
  const [mode, setMode] = useState<"visual" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (visual: Partial<Alimento>) => {
    const state = useUserStore.getState();
    state.setDados({
      alimentosPersonalizados: state.dados.alimentosPersonalizados?.map((f) =>
        f.id === food.id ? { ...f, ...visual } : f,
      ),
    });
  };
  return (
    <>
      <div className="app-custom-food-tools">
        <button
          className="app-text-button"
          aria-label={`Alterar ícone ou foto de ${food.nome}`}
          onClick={() => {
            setError("");
            setMode("visual");
          }}
        >
          <Icon name="edit" size={16} /> Ícone ou foto
        </button>
        <button
          className="app-text-button"
          aria-label={`Apagar ${food.nome}`}
          onClick={() => setMode("delete")}
        >
          <Icon name="close" size={17} /> Apagar
        </button>
      </div>
      {mode === "visual" && (
        <Sheet
          title="Ícone ou foto"
          description={food.nome}
          onClose={() => setMode(null)}
        >
          <div className="app-food-visual-preview">
            <FoodVisual food={food} />
          </div>
          <div
            className="app-food-icon-grid"
            role="group"
            aria-label="Escolher ícone"
          >
            {[
              "🍽️",
              "🍎",
              "🍌",
              "🥦",
              "🥗",
              "🍚",
              "🍞",
              "🥚",
              "🍗",
              "🐟",
              "🥛",
              "🥣",
              "🧀",
              "🥜",
              "🍰",
              "🥤",
            ].map((emoji) => (
              <button
                key={emoji}
                aria-label={`Usar ícone ${emoji}`}
                aria-pressed={!food.imagem && food.emoji === emoji}
                onClick={() => update({ emoji, imagem: undefined })}
              >
                {emoji}
              </button>
            ))}
          </div>
          <label className="app-button app-button--secondary app-photo-picker">
            {busy ? "Preparando foto…" : "Escolher foto do celular"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                if (
                  !/^image\/(jpeg|png|webp)$/.test(file.type) ||
                  file.size > 15 * 1024 * 1024
                ) {
                  setError("Escolha uma foto JPG, PNG ou WebP de até 15 MB.");
                  return;
                }
                setBusy(true);
                setError("");
                const url = URL.createObjectURL(file);
                try {
                  const image = new Image();
                  image.src = url;
                  await image.decode();
                  const canvas = document.createElement("canvas");
                  canvas.width = 160;
                  canvas.height = 160;
                  const ctx = canvas.getContext("2d");
                  if (!ctx) throw new Error();
                  const side = Math.min(image.width, image.height);
                  ctx.fillStyle = "#fff";
                  ctx.fillRect(0, 0, 160, 160);
                  ctx.drawImage(
                    image,
                    (image.width - side) / 2,
                    (image.height - side) / 2,
                    side,
                    side,
                    0,
                    0,
                    160,
                    160,
                  );
                  update({ imagem: canvas.toDataURL("image/jpeg", 0.8) });
                } catch {
                  setError(
                    "Não foi possível abrir essa foto. Tente outra imagem.",
                  );
                } finally {
                  URL.revokeObjectURL(url);
                  setBusy(false);
                }
              }}
            />
          </label>
          <p className="app-helper">
            A foto é recortada no centro e reduzida. As alterações são salvas
            automaticamente neste aparelho.
          </p>
          {error && (
            <p className="app-field-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="app-button app-button--primary app-wide-button"
            onClick={() => setMode(null)}
          >
            Concluir
          </button>
        </Sheet>
      )}
      {mode === "delete" && (
        <Sheet
          title="Apagar alimento?"
          description={`“${food.nome}” sairá dos seus alimentos, favoritos e combinações. As refeições já registradas serão preservadas.`}
          onClose={() => setMode(null)}
        >
          <div className="app-feature-form">
            <button
              className="app-button app-button--secondary"
              onClick={() => setMode(null)}
            >
              Manter alimento
            </button>
            <button
              className="app-button app-button--primary"
              onClick={() => {
                const state = useUserStore.getState(),
                  dados = state.dados;
                state.setDados(removeCustomFood(dados, food.id));
                onDeleted?.();
                setMode(null);
              }}
            >
              Apagar alimento
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
