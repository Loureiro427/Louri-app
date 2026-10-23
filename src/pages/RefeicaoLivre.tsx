import { mealCatalog } from "../utils/appFeatures";
import { useNavigate } from "react-router-dom";
import { MealComposer } from "../components/MealComposer";
import { calcularPorcoes } from "../data/alimentos";
import { useUserStore } from "../store/useUserStore";

export function RefeicaoLivre() {
  const navigate = useNavigate();
  const dados = useUserStore((s) => s.dados);
  const foods = mealCatalog(dados);
  const registrar = useUserStore((state) => state.registrarRefeicao);
  return (
    <div className="app-free-meal">
      <MealComposer
        alimentos={foods}
        memoriaKey="livre"
        titulo="Refeição Livre"
        onClose={() => navigate("/")}
        onConfirm={(porcoes) => {
          const selectedFoods = mealCatalog(
            dados,
            undefined,
            Object.keys(porcoes)
          );
          const total = calcularPorcoes(porcoes, selectedFoods);
          registrar(
            "refeicaoLivre_" + crypto.randomUUID(),
            "Refeição Livre",
            "🍔",
            total.calorias,
            Object.keys(porcoes).map(
              (id) => selectedFoods.find((a) => a.id === id)?.nome || id
            ),
            total.macros,
            porcoes
          );
          navigate("/");
        }}
      />
    </div>
  );
}
