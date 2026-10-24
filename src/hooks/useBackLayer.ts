import { useEffect, useRef } from "react";
import { backLayers } from "../utils/backNavigation";
export function useBackLayer(enabled: boolean, close: () => void) {
  const latest = useRef(close);
  useEffect(() => {
    latest.current = close;
  }, [close]);
  useEffect(
    () => (enabled ? backLayers.register(() => latest.current()) : undefined),
    [enabled],
  );
}
