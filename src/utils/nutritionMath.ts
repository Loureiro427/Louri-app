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
export type RotinaRefeicoes = {
  horaAcorda: string;
  horaDorme: string;
  refeicoesAtivas: string[];
  horariosRefeicoes?: Record<string, string>;
};

export function horarioValido(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

// Cada refeição tem seu próprio horário. Remover o almoço nunca antecipa o jantar.
export function getHorarioSugerido(key: string, horaAcorda: string): string {
  const acorda = horarioValido(horaAcorda)
    ? converterParaMinutos(horaAcorda)
    : 7 * 60;
  const horarios: Record<string, string> = {
    cafeManha: formatarMinutos(acorda + 30),
    almoco: "12:30",
    lancheTarde: "15:30",
    cafeTarde: "17:00",
    janta: "19:30",
    lancheNoite: "21:30",
  };
  return horarios[key] || "12:30";
}

export function getCronograma(dados: RotinaRefeicoes) {
  const { acordaMin, dormeMin } = getRotina(dados);
  const ativas = Object.keys(CONFIG_REFEICOES).filter((key) =>
    (dados.refeicoesAtivas?.length
      ? dados.refeicoesAtivas
      : refeicoesPadrao
    ).includes(key)
  );
  return ativas
    .map((key) => {
      const personalizado = dados.horariosRefeicoes?.[key] || "";
      const horario = horarioValido(personalizado)
        ? personalizado
        : getHorarioSugerido(key, dados.horaAcorda);
      let minutos = converterParaMinutos(horario);
      // Horários após meia-noite pertencem ao fim da rotina que atravessa o dia.
      if (dormeMin >= 1440 && minutos < acordaMin && minutos <= dormeMin - 1440)
        minutos += 1440;
      return { key, ...CONFIG_REFEICOES[key], minutos, horario };
    })
    .sort((a, b) => a.minutos - b.minutos);
}
