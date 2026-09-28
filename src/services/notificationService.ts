import { LocalNotifications } from '@capacitor/local-notifications';
import { useUserStore } from '../store/useUserStore';

export async function configurarNotificacoesNativas() {
  try {
    // 1. Pede a permissão nativa do Android logo ao iniciar o app
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      await LocalNotifications.requestPermissions();
    }

    // 2. Verifica se o utilizador ativou as notificações nas definições do app (Perfil)
    const state = useUserStore.getState();
    const notificacoesAtivas = state.dados?.notificacoes ?? true;

    // Limpa sempre os agendamentos anteriores para evitar duplicados
    await LocalNotifications.cancelAll();

    if (!notificacoesAtivas) {
      return; // Se o utilizador desativou, não agenda nada
    }

    // 3. Agenda os lembretes nativos a cada 1 hora em segundo plano
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "💧 Já bebeu água hoje?",
          body: "Mantenha-se hidratado e atinja a sua meta diária no Louri Fit!",
          id: 1001,
          schedule: { 
            every: 'hour',          // Repete nativamente a cada 1 hora
            allowWhileIdle: true     // Dispara mesmo com o telemóvel em modo de poupança de bateria
          },
        },
        {
          title: "🔥 Mantenha o seu Streak ativo!",
          body: "Entre no app, registre suas refeições e não perca a sequência.",
          id: 1002,
          schedule: { 
            every: 'hour',
            allowWhileIdle: true 
          },
        }
      ]
    });

    console.log('Notificações nativas agendadas com sucesso para rodar em segundo plano!');
  } catch (e) {
    console.error('Erro ao configurar notificações nativas:', e);
  }
}