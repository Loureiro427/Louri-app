export const WEIGHT_MIN = 30;
export const WEIGHT_MAX = 300;
export const WEIGHT_ERROR = `Informe um peso entre ${WEIGHT_MIN} e ${WEIGHT_MAX} kg.`;
export function parseWeight(value: string) {
  const weight = Number(value.trim().replace(",", "."));
  return value.trim() &&
    Number.isFinite(weight) &&
    weight >= WEIGHT_MIN &&
    weight <= WEIGHT_MAX
    ? weight
    : null;
}
