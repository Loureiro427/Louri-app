import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  configurarNotificacoesNativas,
  notificationStatus,
  openExactSettings,
  openNotificationSettings,
  testNotification,
} from "../services/notificationService";
import type { ReminderStatus } from "../services/notificationService";
import { Icon } from "./ui/AppUI";
export function NotificationHealth() {
  const [health, setHealth] = useState<ReminderStatus | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    notificationStatus()
      .then(setHealth)
      .catch(() =>
        setMessage(
          "Não foi possível consultar o aparelho. Tente atualizar o diagnóstico."
        )
      );
  useEffect(() => {
    void refresh();
    const onResume = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("louri-reminders-updated", onResume);
    window.addEventListener("focus", onResume);
    document.addEventListener("visibilitychange", onResume);
    return () => {
      window.removeEventListener("louri-reminders-updated", onResume);
      window.removeEventListener("focus", onResume);
      document.removeEventListener("visibilitychange", onResume);
    };
  }, []);
  const test = async (delayed: boolean) => {
    setBusy(true);
    setMessage("");
    try {
      const result = await configurarNotificacoesNativas(true);
      if (result === "web") {
        setMessage(
          "O teste precisa do APK Android instalado. No navegador, você pode ver as mensagens e configurar os horários."
        );
        return;
      }
      if (result === "update") {
        setMessage(
          "Instale a versão nova do APK para usar o agendador corrigido."
        );
        return;
      }
      if (result === "denied" || result === "disabled") {
        setMessage(
          "Ative as notificações do Louri e permita os avisos nas configurações do aparelho."
        );
        await refresh();
        return;
      }
      await testNotification(delayed);
      await refresh();
      setMessage(
        delayed
          ? "Teste agendado para daqui a 1 minuto. Vá para a tela inicial do celular e aguarde. Sem acesso a alarmes precisos, o Android pode atrasar o aviso."
          : "Teste enviado. Confira a área de notificações do celular."
      );
    } catch {
      setMessage(
        "Não foi possível enviar o teste. Confira a permissão e tente novamente."
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="app-notification-health">
      <div className="app-section-heading">
        <h2>Está chegando aí?</h2>
        <Icon name="bell" size={19} />
      </div>
      <p>Teste primeiro. Assim você sabe se o aparelho permite os avisos.</p>
      {health ? (
        <div className="app-health-rows">
          <div>
            <span>Notificações no aparelho</span>
            <strong>{health.permission ? "Permitidas" : "Bloqueadas"}</strong>
          </div>
          <div>
            <span>Pontualidade</span>
            <strong>
              {health.exact ? "Alarmes precisos" : "Horário aproximado"}
            </strong>
          </div>
          <div>
            <span>Próximo lembrete</span>
            <strong>
              {health.nextAt
                ? new Date(health.nextAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Nenhum agendado"}
            </strong>
          </div>
          {health.lastShown > 0 && (
            <div>
              <span>Último aviso enviado</span>
              <strong>
                {new Date(health.lastShown).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          )}
        </div>
      ) : (
        <p className="app-helper">
          {Capacitor.isNativePlatform()
            ? "Este diagnóstico precisa do novo APK Android."
            : "O diagnóstico e o envio de avisos funcionam no APK Android, inclusive com o app em segundo plano."}
        </p>
      )}
      <div className="app-tools-grid">
        <button
          type="button"
          className="app-button app-button--secondary"
          disabled={busy}
          onClick={() => void test(false)}
        >
          Enviar teste agora
        </button>
        <button
          type="button"
          className="app-button app-button--secondary"
          disabled={busy}
          onClick={() => void test(true)}
        >
          Testar em 1 minuto
        </button>
      </div>
      {health && (
        <div className="app-notification-links">
          <button type="button" onClick={() => void openNotificationSettings()}>
            Permissões do aparelho
          </button>
          {!health.exact && (
            <button type="button" onClick={() => void openExactSettings()}>
              Melhorar pontualidade
            </button>
          )}
          <button type="button" onClick={() => void refresh()}>
            Atualizar diagnóstico
          </button>
        </div>
      )}
      {health && !health.batteryUnrestricted && (
        <p className="app-helper">
          Se o teste chegar mas os lembretes atrasarem, confira as restrições de
          bateria do Louri nas configurações do celular.
        </p>
      )}
      <p className="app-helper">
        Fechar o app normalmente mantém o agendamento. Se usar “Forçar parada”,
        abra o Louri novamente para reativar os avisos.
      </p>
      {message && (
        <p className="app-health-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
