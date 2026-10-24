import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { visibleAppHeight } from "../utils/viewport";

let keyboardOpen = false;
export const isKeyboardOpen = () => keyboardOpen;
export function dismissKeyboard() {
  const focused = document.activeElement;
  if (focused instanceof HTMLElement) focused.blur();
  keyboardOpen = false;
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Keyboard"))
    void Keyboard.hide().catch(() => {});
}
export function installMobileViewport() {
  let baseline = window.innerHeight;
  let keyboardHeight = 0;
  let frame = 0;
  let disposed = false;
  let lastHeight = 0;
  const listeners: PluginListenerHandle[] = [];
  const editable = () =>
    document.activeElement?.matches(
      "input:not([type=checkbox]):not([type=radio]),textarea,[contenteditable=true]",
    ) || false;
  const update = () => {
    frame = 0;
    if (disposed) return;
    const visual = window.visualViewport?.height || window.innerHeight;
    if (!editable() && keyboardHeight === 0) baseline = window.innerHeight;
    const height = visibleAppHeight(
      window.innerHeight,
      visual,
      baseline,
      keyboardHeight,
    );
    keyboardOpen =
      keyboardHeight > 0 || (editable() && baseline - height > 120);
    document.documentElement.dataset.keyboardOpen = String(keyboardOpen);
    if (lastHeight !== height) {
      document.documentElement.style.setProperty(
        "--app-viewport-height",
        `${height}px`,
      );
      lastHeight = height;
    }
    if (editable())
      (document.activeElement as HTMLElement).scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const onOrientation = () => {
    baseline = window.innerHeight + keyboardHeight;
    schedule();
  };
  window.addEventListener("resize", schedule);
  window.addEventListener("orientationchange", onOrientation);
  window.visualViewport?.addEventListener("resize", schedule);
  window.visualViewport?.addEventListener("scroll", schedule);
  document.addEventListener("focusin", schedule);
  document.addEventListener("focusout", schedule);
  if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("Keyboard")) {
    for (const result of [
      Keyboard.addListener("keyboardDidShow", (info) => {
        keyboardHeight = info.keyboardHeight;
        schedule();
      }),
      Keyboard.addListener("keyboardDidHide", () => {
        keyboardHeight = 0;
        schedule();
      }),
    ])
      void result
        .then((handle) => {
          if (disposed) void handle.remove();
          else listeners.push(handle);
        })
        .catch(() => {});
  }
  schedule();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", onOrientation);
    window.visualViewport?.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("scroll", schedule);
    document.removeEventListener("focusin", schedule);
    document.removeEventListener("focusout", schedule);
    for (const listener of listeners) void listener.remove();
    keyboardOpen = false;
    delete document.documentElement.dataset.keyboardOpen;
    document.documentElement.style.removeProperty("--app-viewport-height");
  };
}
