import type { UserData } from "../store/useUserStore";
import { converterParaMinutos, getCronograma } from "./nutritionMath";
export const defaultReminders = {
  refeicoes: [] as string[],
  aguaIntervalo: 120,
  silencioInicio: "22:00",
  silencioFim: "07:00",
};
export function reminderSlots(dados: UserData) {
  const settings = dados.lembretes || {
    ...defaultReminders,
    refeicoes: dados.refeicoesAtivas || [],
  };
  const start = converterParaMinutos(settings.silencioInicio),
    end = converterParaMinutos(settings.silencioFim);
  const silent = (m: number) =>
    start === end
      ? false
      : start < end
      ? m >= start && m < end
      : m >= start || m < end;
  const slots: { minute: number; title: string; body: string }[] = [];
  for (const meal of getCronograma(dados)) {
    const minute = meal.minutos % 1440;
    if (settings.refeicoes.includes(meal.key) && !silent(minute))
      slots.push({
        minute,
        title: `${meal.icone} ${meal.titulo}`,
        body: "Seu horário chegou. Registre sua refeição no Louri.",
      });
  }
  if ([30, 60, 90, 120, 180, 240].includes(settings.aguaIntervalo)) {
    for (let elapsed = 0; elapsed < 1440; elapsed += settings.aguaIntervalo) {
      const minute = (end + elapsed) % 1440;
      if (!silent(minute))
        slots.push({
          minute,
          title: "💧 Hora de beber água",
          body: "Faça uma pausa e registre seu copo no Louri.",
        });
    }
  }
  return slots;
}
