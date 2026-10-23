import type { UserData } from "../store/useUserStore";
import { converterParaMinutos, getCronograma } from "./nutritionMath";
import { dailyGoals, localDayKey } from "./dailyStreak";
export const defaultReminders = {
  refeicoes: [] as string[],
  aguaIntervalo: 120,
  silencioInicio: "22:00",
  silencioFim: "07:00",
  humor: true,
  motivacao: true,
};
export type ReminderSlot = {
  id: string;
  minute: number;
  kind: "meal" | "water" | "motivation";
  key: string;
  route: string;
  title: string;
  body: string;
  messages: { title: string; body: string }[];
};
export function reminderSlots(dados: UserData): ReminderSlot[] {
  const settings = {
    ...defaultReminders,
    ...dados.lembretes,
    refeicoes: dados.lembretes?.refeicoes || dados.refeicoesAtivas || [],
  };
  const start = converterParaMinutos(settings.silencioInicio),
    end = converterParaMinutos(settings.silencioFim);
  const silent = (m: number) =>
    start === end
      ? false
      : start < end
      ? m >= start && m < end
      : m >= start || m < end;
  const slots: ReminderSlot[] = [];
  const add = (
    minute: number,
    kind: ReminderSlot["kind"],
    title: string,
    body: string,
    messages: ReminderSlot["messages"],
    key = ""
  ) => {
    if (!Number.isFinite(minute) || silent(minute)) return;
    slots.push({
      id: `${kind}:${key || minute}`,
      minute,
      kind,
      key,
      route: kind === "motivation" ? "/evolucao" : "/",
      title,
      body,
      messages: settings.humor ? messages : [{ title, body }],
    });
  };
  for (const meal of getCronograma(dados))
    if (settings.refeicoes.includes(meal.key))
      add(
        meal.minutos % 1440,
        "meal",
        `${meal.icone} ${meal.titulo}`,
        "Seu horário chegou. Registre sua refeição no Louri.",
        [
          {
            title: `${meal.icone} ${meal.titulo} entrou no chat`,
            body: "O prato é seu. A memória pode ficar comigo: toque para registrar.",
          },
          {
            title: `🥑 Missão: ${meal.titulo.toLowerCase()}`,
            body: "Comeu? Me conta o que teve no prato. Prometo não pedir um pedacinho.",
          },
          {
            title: `${meal.icone} Pausa para ${meal.titulo.toLowerCase()}`,
            body: "Entre uma coisa e outra, tem você. Toque para abrir sua refeição.",
          },
          {
            title: "🍽️ Seu registro está de prato vazio",
            body: `Se já fez ${meal.titulo.toLowerCase()}, toque aqui e registre do seu jeito.`,
          },
        ],
        meal.key
      );
  if (settings.motivacao) {
    let minute = 20 * 60 + 30;
    if (silent(minute)) minute = (start + 1440 - 30) % 1440;
    add(
      minute,
      "motivation",
      "🥑 Um minutinho para você",
      "Confira o que falta no seu dia e continue no seu ritmo.",
      [
        {
          title: "🥑 Vim conferir, sem fiscalizar",
          body: "Um minutinho para olhar sua rotina? Seus registros estão aqui.",
        },
        {
          title: "🔥 O dia ainda tem um espacinho",
          body: "Dá uma olhada no que falta nas metas de hoje. Um passo de cada vez.",
        },
        {
          title: "🥑 Plantão do abacate",
          body: "Passando para lembrar de você. Toque para conferir como foi seu dia.",
        },
        {
          title: "✨ Um check-in antes do boa-noite",
          body: "Registrou o que conseguiu hoje? O importante é acompanhar sua rotina.",
        },
      ]
    );
  }
  if ([30, 60, 90, 120, 180, 240].includes(settings.aguaIntervalo))
    for (let elapsed = 0; elapsed < 1440; elapsed += settings.aguaIntervalo) {
      const minute = (end + elapsed) % 1440;
      add(
        minute,
        "water",
        "💧 Hora de beber água",
        "Faça uma pausa e registre seu copo no Louri.",
        [
          {
            title: "💧 Seu copo pediu uma participação",
            body: "Ele está pronto para sair da decoração. Que tal uma pausa para água?",
          },
          {
            title: "🥑 Pausa na correria, água no copo",
            body: "Um gole, uma respirada e você segue. Toque para registrar sua água.",
          },
          {
            title: "💧 Lembrete líquido e certo",
            body: "Seu copo não tem botão de notificação. Então eu vim por ele.",
          },
          {
            title: "💧 Plot twist: era hora da água",
            body: "Se for uma boa hora, faça uma pausa. Depois me conta quanto bebeu.",
          },
        ]
      );
    }
  const selected: ReminderSlot[] = [];
  for (const slot of slots)
    if (
      !selected.some(
        (s) =>
          Math.min(
            Math.abs(s.minute - slot.minute),
            1440 - Math.abs(s.minute - slot.minute)
          ) < 10
      )
    )
      selected.push(slot);
  return selected.sort((a, b) => a.minute - b.minute);
}
export function nativeReminderPlan(dados: UserData) {
  const goals = dailyGoals(dados),
    settings = { ...defaultReminders, ...dados.lembretes };
  const today = localDayKey(new Date());
  const current = dados.ultimaData === today;
  return {
    enabled: Boolean(dados.nome?.trim()) && dados.notificacoes !== false,
    slots: reminderSlots(dados),
    quietStart: converterParaMinutos(settings.silencioInicio),
    quietEnd: converterParaMinutos(settings.silencioFim),
    day: today,
    doneMeals: current ? dados.refeicoesConcluidas : [],
    waterDone: current && goals.waterDone,
    complete: current && goals.complete,
  };
}
