type Kind = "support" | "idea";
// Session-only text: contact details and consent are deliberately not retained.
const messages = new Map<Kind, string>();
export const supportDraft = {
  get: (kind: Kind) => messages.get(kind) || "",
  set: (kind: Kind, text: string) => {
    messages.set(kind, text.slice(0, 1000));
  },
  clear: (kind: Kind) => {
    messages.delete(kind);
  },
};
