import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useUserStore } from "../store/useUserStore";
import { reminderSlots } from "../utils/reminders";
let queue = Promise.resolve("idle");
export function configurarNotificacoesNativas(
  requestPermission = false
): Promise<string> {
  queue = queue
    .catch(() => "error")
    .then(async () => {
      if (!Capacitor.isNativePlatform()) return "web";
      const dados = useUserStore.getState().dados;
      const pending = await LocalNotifications.getPending();
      const owned = pending.notifications
        .filter((n) => n.id >= 1000 && n.id < 2000)
        .map((n) => ({ id: n.id }));
      if (owned.length)
        await LocalNotifications.cancel({ notifications: owned });
      if (!dados.notificacoes) return "disabled";
      let permission = await LocalNotifications.checkPermissions();
      if (permission.display !== "granted" && requestPermission)
        permission = await LocalNotifications.requestPermissions();
      if (permission.display !== "granted") return "denied";
      const notifications = reminderSlots(dados).map((slot, i) => ({
        id: 1100 + i,
        title: slot.title,
        body: slot.body,
        schedule: {
          on: { hour: Math.floor(slot.minute / 60), minute: slot.minute % 60 },
          repeats: true,
          allowWhileIdle: true,
        },
      }));
      if (notifications.length)
        await LocalNotifications.schedule({ notifications });
      return "scheduled";
    });
  return queue;
}
