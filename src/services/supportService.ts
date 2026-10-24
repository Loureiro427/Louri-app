export type SupportMessage = {
  kind: "support" | "idea";
  message: string;
  contact?: string;
};
export const SUPPORT_COOLDOWN = 30 * 60 * 1000;
export function supportPayload(input: SupportMessage) {
  const message = input.message.trim();
  const contact = input.kind === "support" ? input.contact?.trim() || "" : "";
  if (!message || message.length > 1000)
    throw new Error("Escreva uma mensagem com até 1000 caracteres.");
  if (
    contact.length > 90 ||
    (contact &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) &&
      !(
        /^\+?[\d\s().-]{8,25}$/.test(contact) &&
        contact.replace(/\D/g, "").length >= 8 &&
        contact.replace(/\D/g, "").length <= 15
      ))
  )
    throw new Error(
      "Confira seu email ou telefone, ou deixe o contato em branco.",
    );
  return {
    username: "Louri",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title:
          input.kind === "support"
            ? "Relato de problema"
            : "Sugestão para o Louri",
        fields: [
          { name: "Mensagem", value: message },
          ...(input.kind === "support" && contact
            ? [{ name: "Contato informado", value: contact }]
            : []),
        ],
      },
    ],
  };
}
export function createSupportClient(
  endpoints: Record<SupportMessage["kind"], string | undefined>,
) {
  const pending = new Set<SupportMessage["kind"]>();
  const configured = (kind: SupportMessage["kind"]) => Boolean(endpoints[kind]);
  async function send(input: SupportMessage, consent: boolean) {
    if (typeof navigator !== "undefined" && navigator.onLine === false)
      throw new Error(
        "Você está sem internet. Sua mensagem continua aqui para tentar novamente quando a conexão voltar.",
      );
    if (pending.has(input.kind))
      throw new Error(
        "Uma mensagem ainda está sendo enviada. Aguarde a confirmação.",
      );
    if (!consent) throw new Error("Confirme os dados que deseja enviar.");
    const payload = supportPayload(input);
    const url = endpoints[input.kind];
    if (!url || !/^https:\/\/discord\.com\/api\/webhooks\//.test(url))
      throw new Error(
        "O canal está indisponível nesta instalação. Tente novamente mais tarde.",
      );
    const key = `louri_support_${input.kind}`;
    let last = 0;
    try {
      last = Number(localStorage.getItem(key)) || 0;
    } catch {
      /* Storage failure must not prevent sending. */
    }
    const wait = SUPPORT_COOLDOWN - (Date.now() - last);
    if (wait > 0)
      throw new Error(
        `Aguarde ${Math.ceil(
          wait / 60000,
        )} minutos antes de enviar outra mensagem.`,
      );
    const controller = new AbortController();
    const endpoint = new URL(url);
    endpoint.searchParams.set("wait", "true");
    const timer = setTimeout(() => controller.abort(), 15000);
    pending.add(input.kind);
    try {
      const response = await fetch(endpoint.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (response.status === 429)
        throw new Error(
          "Muitas mensagens no momento. Aguarde um pouco e tente novamente.",
        );
      if (!response.ok)
        throw new Error(
          "Não foi possível enviar. Seu texto continua aqui para tentar novamente.",
        );
      try {
        localStorage.setItem(key, String(Date.now()));
      } catch {
        /* Delivery succeeded even if the local cooldown cannot persist. */
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError")
        throw new Error(
          "O envio demorou mais que o esperado e não foi confirmado. Confira sua conexão antes de tentar novamente.",
          { cause: error },
        );
      if (error instanceof TypeError)
        throw new Error(
          "Não foi possível confirmar o envio. Confira sua conexão; seu texto continua aqui.",
          { cause: error },
        );
      throw error;
    } finally {
      pending.delete(input.kind);
      clearTimeout(timer);
    }
  }

  return { send, configured };
}
const client = createSupportClient({
  support: import.meta.env.VITE_DISCORD_SUPPORT_URL,
  idea: import.meta.env.VITE_DISCORD_IDEA_URL,
});
export const sendSupport = client.send;
export const supportConfigured = client.configured;
