/** A stack makes native Back dismiss the innermost layer first. */
export function createBackStack() {
  const handlers: { close: () => void }[] = [];
  return {
    register(close: () => void) {
      const entry = { close };
      handlers.push(entry);
      return () => {
        const index = handlers.indexOf(entry);
        if (index !== -1) handlers.splice(index, 1);
      };
    },
    dismiss() {
      const top = handlers.at(-1);
      if (!top) return false;
      top.close();
      return true;
    },
  };
}
export const backLayers = createBackStack();
