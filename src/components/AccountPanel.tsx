import { useState } from "react";
import { useAccountStore } from "../store/useAccountStore";
import {
  deleteLouriAccount,
  enterGoogle,
  leaveAccount,
  resolveAccountConflict,
} from "../services/accountService";
import "./AccountPanel.css";

const labels = {
  local: "Salvo neste aparelho",
  loading: "Sincronizando…",
  saved: "Tudo salvo na sua conta",
  pending: "Salvando seu progresso…",
  offline: "Sem internet · salvo neste aparelho",
  error: "Não foi possível sincronizar",
  conflict: "Escolha como continuar",
};
export function GoogleEntry() {
  const busy = useAccountStore((s) => s.busy);
  return (
    <button
      className="louri-google-button"
      type="button"
      disabled={busy}
      onClick={() => void enterGoogle()}
    >
      <span className="louri-google-symbol" aria-hidden="true">
        G
      </span>
      {busy ? "Conectando…" : "Entrar com Google"}
    </button>
  );
}
export function AccountPanel() {
  const account = useAccountStore();
  const [confirmLocal, setConfirmLocal] = useState(false);
  const [choice, setChoice] = useState<"cloud" | "device" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const google = account.owner !== "local";
  return (
    <section className="app-card louri-account" aria-label="Sua conta">
      <div className="louri-account-heading">
        <span aria-hidden="true">{google ? "☁" : "◇"}</span>
        <div>
          <h2>{google ? "Sua conta Google" : "Seu Louri, com você"}</h2>
          <p>
            {google
              ? account.email
              : "Use sem conta ou guarde seu progresso no Google."}
          </p>
        </div>
      </div>
      <p className="louri-account-status" role="status">
        {labels[account.status]}
      </p>
      {account.lastSync && (
        <small>
          Última sincronização às{" "}
          {new Date(account.lastSync).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </small>
      )}
      {account.message && (
        <p className="louri-account-message" role="alert">
          {account.message}
        </p>
      )}
      {!google ? (
        <>
          <GoogleEntry />
          <p className="louri-account-note">
            Ao entrar, seu perfil, refeições e histórico serão salvos no
            Firebase da sua conta. Fotos ficam neste aparelho. Se já houver um
            histórico na conta, você poderá escolher qual usar.
          </p>
        </>
      ) : (
        <>
          {account.status === "conflict" ? (
            <div className="louri-account-actions">
              <button
                disabled={account.busy}
                onClick={() => setChoice("cloud")}
              >
                Usar dados da conta
              </button>
              <button
                disabled={account.busy}
                onClick={() => setChoice("device")}
              >
                Usar dados deste aparelho
              </button>
              {choice && (
                <div role="alert">
                  <p>
                    {choice === "cloud"
                      ? "O perfil exibido neste aparelho será substituído pelo da conta."
                      : "Os dados na conta serão substituídos pelo perfil deste aparelho."}{" "}
                    Uma cópia da versão anterior ficará preservada localmente.
                  </p>
                  <button
                    disabled={account.busy}
                    onClick={() => {
                      void resolveAccountConflict(choice);
                      setChoice(null);
                    }}
                  >
                    Confirmar escolha
                  </button>
                  <button onClick={() => setChoice(null)}>Voltar</button>
                </div>
              )}
            </div>
          ) : (
            <p className="louri-account-note">
              O Louri salva seu progresso automaticamente. Sem internet, ele
              fica guardado aqui e é enviado quando a conexão voltar.
            </p>
          )}
          <button
            className="louri-account-link"
            disabled={account.busy}
            onClick={() => setConfirmLocal(true)}
          >
            Sair da conta Google
          </button>
          <button
            className="louri-account-link"
            disabled={account.busy}
            onClick={() => setConfirmDelete(true)}
          >
            Excluir minha conta do Louri
          </button>
          {confirmDelete && (
            <div role="alert">
              <p>
                Excluir permanentemente sua conta do Louri e o histórico
                sincronizado? As cópias desta conta neste aparelho também serão
                apagadas. Seu perfil sem conta e sua conta Google continuam
                existindo. Será necessário confirmar sua identidade no Google.
              </p>
              <button
                disabled={account.busy}
                onClick={() => void deleteLouriAccount()}
              >
                Excluir conta e dados
              </button>
              <button
                disabled={account.busy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </button>
            </div>
          )}
          {confirmLocal && (
            <div role="alert">
              <p>
                Você voltará ao perfil sem conta deste aparelho. Alterações
                ainda não enviadas ficam guardadas para a próxima entrada nesta
                conta.
              </p>
              <button
                disabled={account.busy}
                onClick={() => void leaveAccount()}
              >
                Sair e usar sem conta
              </button>
              <button onClick={() => setConfirmLocal(false)}>
                Continuar na conta
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
