import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import {
  configurarNotificacoesNativas,
  notificationStatus,
  openExactSettings,
  openNotificationSettings,
  openBackgroundSettings,
  testNotification,
} from "../services/notificationService";
import type { ReminderStatus } from "../services/notificationService";
import { Icon } from "./ui/AppUI";
import { notificationTestResult } from "../utils/notificationDiagnostics";
export function NotificationHealth() {
  const [health, setHealth] = useState<ReminderStatus | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isXiaomi = /xiaomi|redmi|poco/i.test(
    `${health?.manufacturer || ""} ${health?.brand || ""}`
  );
  const testResult = notificationTestResult(health || {});
  const openBackground = async () => {
    try {
      await openBackgroundSettings();
    } catch {
      setMessage(
        "Abra Configurações → Apps → Louri e confira a economia de bateria e a inicialização automática."
      );
    }
  };
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
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 15000);
    return () => {
      window.removeEventListener("louri-reminders-updated", onResume);
      window.removeEventListener("focus", onResume);
      document.removeEventListener("visibilitychange", onResume);
      clearInterval(timer);
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
      <p>
        O teste imediato verifica a exibição. O de 1 minuto verifica o
        agendamento, inclusive fora do app.
      </p>
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
            <span>Segundo plano no Android</span>
            <strong>
              {health.backgroundRestricted === undefined
                ? "Não verificado nesta versão"
                : health.backgroundRestricted
                ? "Restrito"
                : "Sem bloqueio detectado"}
            </strong>
          </div>
          {health.model && (
            <div>
              <span>Aparelho</span>
              <strong>
                {health.brand} {health.model}
              </strong>
            </div>
          )}
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
          {!!health.testAt && (
            <>
              <div>
                <span>Horário do teste agendado</span>
                <strong>
                  {new Date(health.testAt).toLocaleTimeString("pt-BR")}
                </strong>
              </div>
              <div>
                <span>Recebido pelo Louri</span>
                <strong>
                  {health.testReceivedAt
                    ? new Date(health.testReceivedAt).toLocaleTimeString(
                        "pt-BR"
                      )
                    : "Aguardando o Android"}
                </strong>
              </div>
            </>
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
        <p className="app-health-message" role="status">
          {testResult.text}
        </p>
      )}
      {health && (
        <details className="app-notification-device-help">
          <summary>Ver detalhes dos disparos</summary>
          <div className="app-health-rows">
            <div>
              <span>Última confirmação de agendamento</span>
              <strong>
                {health.lastArmedAt
                  ? new Date(health.lastArmedAt).toLocaleString("pt-BR")
                  : "Sem registro nesta versão"}
              </strong>
            </div>
            <div>
              <span>Último alarme recebido pelo Louri</span>
              <strong>
                {health.lastReceiverAt
                  ? new Date(health.lastReceiverAt).toLocaleString("pt-BR")
                  : "Ainda sem registro"}
              </strong>
            </div>
            <div>
              <span>Resultado do último lembrete</span>
              <strong>
                {(
                  {
                    posted: "Aviso enviado",
                    completed: "Meta já concluída",
                    quiet: "Horário de silêncio",
                    expired: "Entregue com atraso",
                    duplicate: "Já enviado",
                    replaced: "Agendamento atualizado",
                    permission_blocked: "Exibição bloqueada",
                    disabled: "Lembretes desativados",
                  } as Record<string, string>
                )[health.lastOutcome || ""] || "Ainda sem registro"}
              </strong>
            </div>
          </div>
        </details>
      )}
      {health && (
        <div className="app-notification-links">
          <button type="button" onClick={() => void openNotificationSettings()}>
            Permissões do aparelho
          </button>
          <button type="button" onClick={() => void openBackground()}>
            Configurações de segundo plano
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
      <details
        className="app-notification-device-help"
        open={isXiaomi || undefined}
      >
        <summary>
          {isXiaomi
            ? "Configurar neste Xiaomi/Redmi/POCO"
            : "Ajuda para Xiaomi, Redmi e POCO"}
        </summary>
        <p>
          No seu Redmi, confira também as opções do fabricante. O diagnóstico
          padrão do Android não consegue confirmar todas elas.
        </p>
        <ol>
          <li>
            Em <strong>Apps → Louri → Economia de bateria</strong>, procure{" "}
            <strong>Sem restrições</strong>.
          </li>
          <li>
            Em <strong>Apps → Permissões</strong>, procure{" "}
            <strong>Inicialização automática</strong> ou{" "}
            <strong>Inicialização em segundo plano</strong> e confira o Louri.
            Os nomes variam entre MIUI e HyperOS.
          </li>
          <li>
            Em <strong>Alarmes e lembretes</strong>, confira a permissão de
            horários precisos. Depois agende o teste novamente e aperte Início.
          </li>
        </ol>
        {health && (
          <button
            type="button"
            className="app-text-button"
            onClick={() => void openBackground()}
          >
            Abrir configurações do Louri
          </button>
        )}
      </details>
      {health && !health.batteryUnrestricted && (
        <p className="app-helper">
          Se o teste chegar mas os lembretes atrasarem, confira as restrições de
          bateria do Louri nas configurações do celular.
        </p>
      )}
      <p className="app-helper">
        Ao testar, volte para a tela inicial sem usar “Forçar parada”. Depois
        reabra o diagnóstico para conferir se o Android entregou o alarme.
      </p>
      {message && (
        <p className="app-health-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}
