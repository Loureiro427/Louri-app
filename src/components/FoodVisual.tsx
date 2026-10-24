import type { Alimento } from "../data/alimentos";
export function FoodVisual({ food }: { food: Alimento }) {
  return food.imagem?.startsWith("data:image/jpeg;base64,") ? (
    <img className="app-food-photo" src={food.imagem} alt="" />
  ) : (
    <>{food.emoji}</>
  );
}
