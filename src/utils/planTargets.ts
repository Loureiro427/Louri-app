import type { UserData } from "../store/useUserStore";
import { calculateCaloricGoal, calculateWaterGoal } from "./nutritionMath";
export function getPlanTargets(
  dados: Pick<UserData, "peso" | "altura" | "idade" | "sexo" | "objetivo">
) {
  const weight = Number(dados.peso) || 70;
  const calories = calculateCaloricGoal(
    weight,
    Number(dados.altura) || 170,
    Number(dados.idade) || 25,
    dados.sexo || "M",
    dados.objetivo
  );
  const ratios =
    dados.objetivo === "perder"
      ? [0.35, 0.4, 0.25]
      : dados.objetivo === "ganhar"
      ? [0.3, 0.5, 0.2]
      : [0.3, 0.45, 0.25];
  return {
    weight,
    calories,
    water: calculateWaterGoal(weight),
    objective:
      dados.objetivo === "perder"
        ? "Emagrecimento"
        : dados.objetivo === "ganhar"
        ? "Ganho de massa"
        : "Manutenção",
    macros: [
      {
        key: "proteina" as const,
        label: "Proteína",
        grams: Math.round((calories * ratios[0]) / 4),
        percentage: Math.round(ratios[0] * 100),
        color: "var(--app-blue)",
      },
      {
        key: "carbo" as const,
        label: "Carboidratos",
        grams: Math.round((calories * ratios[1]) / 4),
        percentage: Math.round(ratios[1] * 100),
        color: "var(--app-green)",
      },
      {
        key: "gordura" as const,
        label: "Gorduras",
        grams: Math.round((calories * ratios[2]) / 9),
        percentage: Math.round(ratios[2] * 100),
        color: "var(--app-orange)",
      },
    ],
  };
}
