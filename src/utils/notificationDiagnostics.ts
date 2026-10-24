export type TestTrace = {
  testAt?: number;
  testReceivedAt?: number;
  testShown?: boolean;
  exact?: boolean;
};
export function notificationTestResult(trace: TestTrace, now = Date.now()) {
  if (!trace.testAt)
    return {
      state: "none",
      text: "O teste imediato só verifica a exibição. Use o teste agendado para conferir o segundo plano.",
    };
  if ((trace.testReceivedAt || 0) >= trace.testAt - 1000)
    return trace.testShown
      ? {
          state: "received",
          text: (trace.testReceivedAt || 0) - trace.testAt >= 60000
            ? `O Android entregou o teste com ${Math.floor(((trace.testReceivedAt || 0) - trace.testAt) / 60000)} min de atraso e o Louri enviou o aviso.`
            : "O Android entregou o teste agendado e o Louri enviou o aviso.",
        }
      : {
          state: "blocked",
          text: "O Android entregou o teste, mas a exibição foi bloqueada. Confira as permissões de notificações.",
        };
  if (now < trace.testAt)
    return {
      state: "waiting",
      text: "Teste agendado. Volte para a tela inicial do celular e aguarde.",
    };
  return trace.exact
    ? {
        state: "overdue",
        text: "O horário solicitado passou e ainda aguardamos o Android. Isso pode ser um atraso, não uma falha definitiva. Confira as configurações de segundo plano se persistir.",
      }
    : {
        state: "approximate",
        text: "Ainda aguardamos o Android. Com horário aproximado, o teste pode chegar vários minutos depois. Confira Alarmes e lembretes e as restrições de bateria.",
      };
}
