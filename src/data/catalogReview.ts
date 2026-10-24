import type { Alimento } from "./alimentos";
// Reviewed against NEPA/UNICAMP TACO 4th edition, October 2026.
export const TACO_URL =
  "https://nepa.unicamp.br/wp-content/uploads/sites/27/2023/10/taco_4_edicao_ampliada_e_revisada.pdf";
const reference = (
  number: number,
  preparo: string,
  kcal100g: number,
  prot: number,
  carbo: number,
  gord: number,
) => ({
  preparo,
  kcal100g,
  prot,
  carbo,
  gord,
  fonte: `TACO 4 · alimento ${number}`,
});
export function reviewCatalog(catalog: Record<string, Alimento[]>) {
  const reviewed: Record<string, Partial<Alimento>> = {
    arroz: reference(3, "Branco, cozido, sem óleo", 128, 2.5, 28.1, 0.2),
    arroz_janta: reference(3, "Branco, cozido, sem óleo", 128, 2.5, 28.1, 0.2),
    feijao: reference(561, "Carioca, cozido, sem óleo", 76, 4.8, 13.6, 0.5),
    aveia: reference(7, "Flocos, sem cozinhar", 394, 13.9, 66.6, 8.5),
    queijo: {
      ...reference(461, "Minas frescal", 264, 17.4, 3.2, 20.2),
      nome: "Queijo Minas frescal",
      aliases: ["queijo", "queijo branco"],
    },
    iogurte: {
      ...reference(448, "Natural, sem sabor", 51, 4.1, 1.9, 3),
      nome: "Iogurte natural",
    },
    batatadoce: {
      nome: "Batata-doce",
      preparo: "Cozida · estimativa",
      aliases: ["batata doce"],
      fonte: "Estimativa do catálogo",
    },
    leite: {
      nome: "Leite integral",
      preparo: "Líquido · estimativa por 100 g",
      aliases: ["leite"],
      fonte: "Estimativa do catálogo",
    },
    legumes_assados: {
      nome: "Legumes assados",
      preparo: "Receita variável · estimativa",
    },
    legumes: { preparo: "Cozidos · mistura aproximada" },
    salada: { preparo: "Crua, sem molho · estimativa" },
    salada_janta: { preparo: "Crua, sem molho · estimativa" },
    frango: { preparo: "Peito sem pele, grelhado · estimativa" },
    frango_janta: { preparo: "Peito sem pele, grelhado · estimativa" },
    ovo: { preparo: "Cozido, sem óleo · estimativa" },
    ovo_almoco: { preparo: "Cozido, sem óleo · estimativa" },
    cafe: { preparo: "Sem açúcar · estimativa" },
    cafe_tarde: { nome: "Café sem açúcar", preparo: "Infusão · estimativa" },
    cha: { preparo: "Infusão, sem açúcar · estimativa" },
    chapa_noite: { preparo: "Infusão, sem açúcar · estimativa" },
    tapioca: {
      preparo: "Pronta, sem manteiga e sem recheio",
      fonte: "TBCA · BRC0906B",
      kcal100g: 289,
      prot: 0.36,
      carbo: 71.9,
      gord: 0,
    },
    tapioca_tarde: {
      preparo: "Pronta, sem manteiga e sem recheio",
      fonte: "TBCA · BRC0906B",
      kcal100g: 289,
      prot: 0.36,
      carbo: 71.9,
      gord: 0,
    },
    macarrao: { preparo: "Cozido, sem molho · estimativa" },
    pao: { preparo: "Assado, sem recheio · estimativa" },
    banana: { preparo: "Sem casca · variedade e tamanho variam" },
    maca: { preparo: "Com casca, sem miolo · estimativa" },
    mamao: { preparo: "Sem casca e sementes · estimativa" },
  };
  for (const food of Object.values(catalog).flat())
    Object.assign(
      food,
      {
        preparo: "Receita ou marca variável · estimativa",
        fonte: "Estimativa do catálogo",
      },
      reviewed[food.id],
    );
  catalog.almoco.push(
    {
      id: "arroz_cru",
      nome: "Arroz cru",
      emoji: "🍚",
      ...reference(4, "Branco, antes de cozinhar", 358, 7.2, 78.8, 0.3),
    },
    {
      id: "mandioca_cozida",
      nome: "Mandioca cozida",
      emoji: "🍠",
      ...reference(129, "Sem óleo, depois de cozinhar", 125, 0.6, 30.1, 0.3),
      aliases: ["aipim", "macaxeira"],
    },
  );
  catalog.cafeManha.push({
    id: "acucar_refinado",
    nome: "Açúcar refinado",
    emoji: "🥄",
    ...reference(494, "Refinado, branco", 387, 0.3, 99.5, 0),
    aliases: ["açúcar", "açúcar branco"],
  });
}
