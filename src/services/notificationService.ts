import { Capacitor, registerPlugin } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { useUserStore } from "../store/useUserStore";
import { nativeReminderPlan } from "../utils/reminders";
export type ReminderStatus = {
  permission: boolean;
  exact: boolean;
  batteryUnrestricted: boolean;
  nextAt: number;
  lastShown: number;
  manufacturer?: string;
  brand?: string;
  model?: string;
  backgroundRestricted?: boolean;
  lastArmedAt?: number;
  lastReceiverAt?: number;
  lastOutcome?: string;
  testAt?: number;
  testReceivedAt?: number;
  testShown?: boolean;
};
type Tap = { route?: string; meal?: string; kind?: string; day?: string };
const Native = registerPlugin<{
  sync(options: {
    plan: ReturnType<typeof nativeReminderPlan>;
  }): Promise<ReminderStatus>;
  status(): Promise<ReminderStatus>;
  test(options: { delayed: boolean }): Promise<void>;
  openSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  consumeTap(): Promise<Tap>;
  addListener(
    name: "openReminder",
    listener: () => void
  ): Promise<PluginListenerHandle>;
}>("LouriReminders");
export const hasNativeReminders = () =>
  Capacitor.getPlatform() === "android" &&
  Capacitor.isPluginAvailable("LouriReminders");
let queue = Promise.resolve("idle");
export function configurarNotificacoesNativas(
  requestPermission = false
): Promise<string> {
  queue = queue
    .catch(() => "error")
    .then(async () => {
      if (!Capacitor.isNativePlatform()) return "web";
      if (!hasNativeReminders()) return "update";
      const dados = useUserStore.getState().dados;
      if (dados.notificacoes && requestPermission) {
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== "granted")
          await LocalNotifications.requestPermissions();
      }
      // Persist the plan in the first native call, before the webview can be paused.
      const status = await Native.sync({
        plan: nativeReminderPlan(useUserStore.getState().dados),
      });
      const pending = await LocalNotifications.getPending();
      const legacy = pending.notifications
        .filter((n) => n.id >= 1000 && n.id < 2000)
        .map((n) => ({ id: n.id }));
      if (legacy.length)
        await LocalNotifications.cancel({ notifications: legacy });
      window.dispatchEvent(new Event("louri-reminders-updated"));
      if (!dados.notificacoes) return "disabled";
      return status.permission ? "scheduled" : "denied";
    });
  return queue;
}
export async function notificationStatus() {
  return hasNativeReminders() ? Native.status() : null;
}
export async function testNotification(delayed = false) {
  if (!hasNativeReminders())
    throw new Error("Instale o novo APK Android para testar.");
  await Native.test({ delayed });
}
export async function openNotificationSettings() {
  if (hasNativeReminders()) await Native.openSettings();
}
export async function openBackgroundSettings() {
  if (hasNativeReminders()) await Native.openAppSettings();
}
export async function openExactSettings() {
  if (hasNativeReminders())
    await LocalNotifications.changeExactNotificationSetting();
}
export function watchReminderTap(onTap: (target: Tap) => void) {
  let disposed = false,
    listener: PluginListenerHandle | undefined;
  const consume = async () => {
    if (!hasNativeReminders()) return;
    const target = await Native.consumeTap();
    if (!disposed && target.route) onTap(target);
  };
  if (hasNativeReminders())
    void Native.addListener("openReminder", () => {
      void consume().catch(() => {});
    })
      .then((handle) => {
        if (disposed) void handle.remove();
        else listener = handle;
      })
      .catch(() => {});
  const resume = () => {
    void configurarNotificacoesNativas().catch(() => {});
    if (document.visibilityState === "visible") {
      void consume().catch(() => {});
    }
  };
  window.addEventListener("focus", resume);
  document.addEventListener("visibilitychange", resume);
  void consume().catch(() => {});
  return () => {
    disposed = true;
    void listener?.remove();
    window.removeEventListener("focus", resume);
    document.removeEventListener("visibilitychange", resume);
  };
}
