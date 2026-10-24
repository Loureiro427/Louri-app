import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { backLayers } from "../utils/backNavigation";
import {
  dismissKeyboard,
  installMobileViewport,
  isKeyboardOpen,
} from "../services/mobileViewport";

export function DeviceNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(installMobileViewport, []);
  useEffect(() => {
    if (
      Capacitor.getPlatform() !== "android" ||
      !Capacitor.isPluginAvailable("App")
    )
      return;
    let disposed = false;
    let listener: PluginListenerHandle | undefined;
    void App.addListener("backButton", () => {
      if (isKeyboardOpen()) {
        dismissKeyboard();
        return;
      }
      if (backLayers.dismiss()) return;
      if (pathname !== "/") navigate("/", { replace: true });
      else void App.minimizeApp().catch(() => {});
    })
      .then((handle) => {
        if (disposed) void handle.remove();
        else listener = handle;
      })
      .catch(() => {});
    return () => {
      disposed = true;
      void listener?.remove();
    };
  }, [navigate, pathname]);
  return null;
}
