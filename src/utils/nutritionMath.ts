export function calculateWaterGoal(peso: number): number {
  return Number.isFinite(peso) && peso > 0 ? Math.round(peso * 35) : 0;
}
export function calculateIMC(peso: number, alturaCm: number): number {
  if (peso <= 0 || alturaCm <= 0) return 0;
  return Math.round((peso / (alturaCm / 100) ** 2) * 10) / 10;
}
// Estimativa única usada em todas as telas; não substitui avaliação profissional.
export function calculateCaloricGoal(
  peso: number,
  alturaCm: number,
  idade: number,
  sexo: string,
  objetivo: string
): number {
  if (
    ![peso, alturaCm, idade].every((v) => Number.isFinite(v) && v > 0) ||
    !sexo
  )
    return 0;
  const tmb =
    10 * peso + 6.25 * alturaCm - 5 * idade + (sexo === "M" ? 5 : -161);
  return Math.max(
    1200,
    Math.round(tmb * 1.3) +
      (objetivo === "perder" ? -400 : objetivo === "ganhar" ? 400 : 0)
  );
}
export const CONFIG_REFEICOES: Record<
  string,
  { titulo: string; icone: string }
> = {
  cafeManha: { titulo: "Café da Manhã", icone: "☕" },
  almoco: { titulo: "Almoço", icone: "🍽️" },
  lancheTarde: { titulo: "Lanche da Tarde", icone: "🍎" },
  cafeTarde: { titulo: "Café da Tarde", icone: "🧋" },
  janta: { titulo: "Jantar", icone: "🍲" },
  lancheNoite: { titulo: "Lanche da Noite", icone: "🌙" },
};
export const refeicoesPadrao = ["cafeManha", "almoco", "lancheTarde", "janta"];
export function converterParaMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
export function formatarMinutos(minutos: number) {
  const total = ((Math.round(minutos) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}
export function getRotina(dados: { horaAcorda: string; horaDorme: string }) {
  const acordaMin = converterParaMinutos(dados.horaAcorda || "07:00");
  let dormeMin = converterParaMinutos(dados.horaDorme || "22:00");
  if (dormeMin <= acordaMin) dormeMin += 1440;
  return {
    acordaMin,
    dormeMin,
    horasDescanso: (1440 - (dormeMin - acordaMin)) / 60,
  };
}
export function getCronograma(dados: {
  horaAcorda: string;
  horaDorme: string;
  refeicoesAtivas: string[];
}) {
  const { acordaMin, dormeMin } = getRotina(dados);
  const ativas = Object.keys(CONFIG_REFEICOES).filter((key) =>
    (dados.refeicoesAtivas?.length
      ? dados.refeicoesAtivas
      : refeicoesPadrao
    ).includes(key)
  );
  const inicio = Math.min(acordaMin + 30, dormeMin);
  const fim = Math.max(inicio, dormeMin - 90);
  return ativas.map((key, i) => {
    const minutos = Math.round(
      inicio +
        (ativas.length > 1 ? ((fim - inicio) * i) / (ativas.length - 1) : 0)
    );
    return {
      key,
      ...CONFIG_REFEICOES[key],
      minutos,
      horario: formatarMinutos(minutos),
    };
  });
}
