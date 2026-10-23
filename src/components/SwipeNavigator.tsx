import { useLocation } from "react-router-dom";
import { Home } from "../pages/Home";
import { Plano } from "../pages/Plano";
import { Evolucao } from "../pages/Evolucao";
import { Perfil } from "../pages/Perfil";

const rotasMain = ["/", "/plano", "/evolucao", "/perfil"];
const components = [Home, Plano, Evolucao, Perfil];

export function SwipeNavigator({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const activeIndex = rotasMain.indexOf(pathname);
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
          <Page />
        </div>
      ))}
    </div>
  );
}
