import { useRef, useState } from "react";
import { Sheet } from "./ui/AppUI";
import { sendSupport, supportConfigured } from "../services/supportService";
export function SupportForm({
  kind,
  onClose,
}: {
  kind: "support" | "idea";
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  return (
    <Sheet
      title={
        kind === "support" ? "Falar com o suporte" : "Sua ideia para o Louri"
      }
      description={
        sent
          ? "Mensagem enviada. Obrigado por ajudar a melhorar o Louri."
          : "Conte para a gente. Sua mensagem será enviada ao Discord da equipe."
      }
      onClose={onClose}
    >
      {sent ? (
        <button
          className="app-button app-button--primary app-wide-button"
          onClick={onClose}
        >
          Concluir
        </button>
      ) : (
        <form
          className="app-feature-form"
          onSubmit={async (e) => {
            e.preventDefault();
            if (submitting.current) return;
            submitting.current = true;
            setBusy(true);
            setError("");
            try {
              await sendSupport({ kind, message, contact }, consent);
              setSent(true);
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Não foi possível confirmar o envio. Tente novamente."
              );
            } finally {
              submitting.current = false;
              setBusy(false);
            }
          }}
        >
          {kind === "support" && (
            <label>
              Seu email ou telefone, se quiser receber uma resposta
              <input
                type="text"
                maxLength={90}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                disabled={busy}
                autoComplete="off"
              />
            </label>
          )}
          <label>
            {kind === "support"
              ? "O que aconteceu?"
              : "O que você gostaria de melhorar?"}
            <textarea
              rows={5}
              required
              maxLength={1000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={busy}
              placeholder={
                kind === "support"
                  ? "Em qual tela você estava e o que tentou fazer?"
                  : "Escreva sua sugestão."
              }
            />
          </label>
          <p className="app-helper">
            {message.length}/1000 caracteres. Enviamos apenas sua mensagem
            {kind === "support" ? " e o contato que você informar" : ""}. Peso,
            altura, objetivo, histórico e nome do perfil não são anexados.
          </p>
          <label className="app-shopping-row">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              disabled={busy}
            />
            <span>
              Concordo em enviar estes dados ao Discord da equipe do Louri.
            </span>
          </label>
          {!supportConfigured(kind) && (
            <p className="app-helper">
              O canal está indisponível nesta instalação. Seu texto pode ser
              copiado para guardar.
            </p>
          )}
          {error && (
            <p role="alert" className="app-field-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={
              busy || !message.trim() || !consent || !supportConfigured(kind)
            }
            className="app-button app-button--primary"
          >
            {busy ? "Enviando…" : "Enviar mensagem"}
          </button>
        </form>
      )}
    </Sheet>
  );
}
