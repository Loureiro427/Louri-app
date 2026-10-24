import { ScreenErrorBoundary } from "./components/ScreenErrorBoundary";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { SwipeNavigator } from "./components/SwipeNavigator";
const Onboarding = lazy(() =>
  import("./pages/Onboarding").then((module) => ({
    default: module.Onboarding,
  }))
);
const RefeicaoLivre = lazy(() =>
  import("./pages/RefeicaoLivre").then((module) => ({
    default: module.RefeicaoLivre,
  }))
);
export function App() {
  return (
    <HashRouter>
      <AppScreens />
    </HashRouter>
  );
}
function AppScreens() {
  const { pathname } = useLocation();
  return (
    <ScreenErrorBoundary resetKey={pathname}>
      <Layout>
        <SwipeNavigator>
          <Suspense
            fallback={
              <div className="app-page" role="status">
                Abrindo sua tela…
              </div>
            }
          >
            <Routes>
              <Route path="/refeicao-livre" element={<RefeicaoLivre />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </SwipeNavigator>
      </Layout>
    </ScreenErrorBoundary>
  );
}
