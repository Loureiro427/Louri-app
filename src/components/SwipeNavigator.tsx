import { useLocation } from "react-router-dom";
import { Home } from "../pages/Home";
const Plano = lazy(() =>
  import("../pages/Plano").then((module) => ({ default: module.Plano }))
);
const Evolucao = lazy(() =>
  import("../pages/Evolucao").then((module) => ({ default: module.Evolucao }))
);
const Perfil = lazy(() =>
  import("../pages/Perfil").then((module) => ({ default: module.Perfil }))
);
import { ScreenErrorBoundary } from "./ScreenErrorBoundary";
import { useState, lazy, Suspense } from "react";

const rotasMain = ["/", "/plano", "/evolucao", "/perfil"];
const components = [Home, Plano, Evolucao, Perfil];

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const activeIndex = rotasMain.indexOf(pathname);
  const [visited, setVisited] = useState([activeIndex]);
  if (activeIndex >= 0 && !visited.includes(activeIndex))
    setVisited([...visited, activeIndex]);
  if (activeIndex === -1) return <>{children}</>;

  // Keep each tab's state without a 400%-wide horizontal scrolling track.
  return (
    <div className="app-page-viewport">
      {components.map((Page, index) => (
        <div
          key={rotasMain[index]}
          className="app-page-panel"
          hidden={index !== activeIndex}
          inert={index !== activeIndex}
        >
          {visited.includes(index) && (
            <ScreenErrorBoundary resetKey={pathname}>
              <Suspense
                fallback={
                  <div className="app-page" role="status">
                    Abrindo sua tela…
                  </div>
                }
              >
                <Page />
              </Suspense>
            </ScreenErrorBoundary>
          )}
        </div>
      ))}
    </div>
  );
}
