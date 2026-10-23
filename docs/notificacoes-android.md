# Notificações no Android

O Louri usa um agendador nativo próprio (`ReminderEngine`), com um alarme por vez. O plano e os registros do dia são espelhados no aparelho; o JavaScript não precisa continuar executando em segundo plano.

Cada entrega agenda a próxima com `RTC_WAKEUP` e suporte a Doze. O agendamento é restaurado após reiniciar, atualizar o APK ou mudar o relógio/fuso do aparelho. Se a permissão de alarmes precisos estiver disponível, ela é usada; caso contrário há um alarme aproximado, sem abrir configurações automaticamente.

Na biblioteca local-notifications 8.3.1 instalada, o primeiro agendamento `on` usa o caminho com `allowWhileIdle`, mas `TimedNotificationPublisher.rescheduleNotificationIfNeeded` rearma com `RTC` e `set`/`setExact`, sem preservar esse comportamento. Essa diferença foi encontrada no código; o diagnóstico no aparelho ainda é necessário para identificar outras restrições do fabricante.

As mensagens variam entre horários e dias. Refeições registradas e a meta de água completa cancelam os lembretes correspondentes do dia. Um incentivo opcional aparece no fim do dia, respeitando o silêncio. Alarmes próximos são consolidados, com prioridade para refeições. Avisos atrasados que chegaram ao período de silêncio não são exibidos.

## Testar no aparelho

1. Compile com `npm run build`, `npx cap sync android` e `gradlew.bat :app:assembleDebug` dentro de `android/`, usando Java 21 ou superior compatível com o Gradle do projeto.
2. Instale o APK atualizado, mantendo a assinatura da instalação anterior para preservar os dados.
3. Abra **Perfil → Personalizar lembretes** e salve as preferências. Permita notificações quando solicitado.
4. Confira no diagnóstico a permissão e o horário do próximo lembrete.
5. Use **Enviar teste agora**. O aviso deve aparecer na área de notificações; isso testa a permissão e o canal.
6. Use **Testar em 1 minuto**, volte para a tela inicial do celular e aguarde. No modo aproximado, o Android pode atrasar a entrega. Não use “Forçar parada” durante esse teste.
7. Toque em uma notificação de refeição/água: ela abre o registro correspondente. O incentivo abre a Evolução.
8. Complete a água ou registre a refeição antes do próximo aviso e confira que o lembrete correspondente é retirado do dia.
9. Confira um lembrete após reiniciar o celular e no dia seguinte. Isso valida o reagendamento fora do processo do app.

Se o teste imediato funcionar e o agendado não, confira **Melhorar pontualidade** e as restrições de bateria do aplicativo nas configurações do aparelho. A opção “Forçar parada” do Android interrompe alarmes até o app ser aberto novamente. O app não desativa proteções do aparelho por conta própria.

O diagnóstico e o envio nativo são exclusivos do APK Android. O navegador permite configurar horários e pré-visualizar as mensagens, mas não executa esse agendador.

## Validação automatizada

- `npm test`: cálculos, silêncio, prioridades dos lembretes, espelho das metas e persistência da lista de compras.
- `android/gradlew.bat :app:testDebugUnitTest`: repetição entre dias, virada de ano, horário de verão, silêncio e variação das mensagens.
- `android/gradlew.bat :app:assembleDebug`: compilação do plugin, receiver, recursos e APK.

Referências: [Capacitor Local Notifications](https://capacitorjs.com/docs/apis/local-notifications), [Android AlarmManager](https://developer.android.com/develop/background-work/services/alarms).
