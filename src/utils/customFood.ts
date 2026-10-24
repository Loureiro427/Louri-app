import type { Alimento } from "../data/alimentos";
export function createCustomFood(
  name: string,
  base: string,
  values: string[],
  id: string,
): Alimento | string {
  const grams = Number(base.replace(",", "."));
  const numbers = values.map((v) => Number(v.replace(",", ".")));
  if (!name.trim()) return "Dê um nome ao alimento, como aparece na embalagem.";
  if (!Number.isFinite(grams) || grams <= 0 || grams > 9999)
    return "Informe o peso da porção do rótulo, em gramas.";
  if (
    values.length !== 4 ||
    values.some((v) => !v.trim()) ||
    numbers.some((n) => !Number.isFinite(n) || n < 0)
  )
    return "Preencha os quatro valores do rótulo. Se aparecer zero, digite 0.";
  if (
    (numbers[0] / grams) * 100 > 1000 ||
    numbers.slice(1).reduce((a, b) => a + b, 0) > grams + 1
  )
    return "Os valores parecem maiores que a porção. Confira se todos pertencem à mesma coluna do rótulo.";
  return {
    id,
    nome: name.trim().slice(0, 70),
    emoji: "🍽️",
    kcal100g: (numbers[0] / grams) * 100,
    prot: (numbers[1] / grams) * 100,
    carbo: (numbers[2] / grams) * 100,
    gord: (numbers[3] / grams) * 100,
    porcaoReferencia: grams,
    preparo: "Personalizado · valores do seu rótulo",
    fonte: "Informado por você",
  };
}
