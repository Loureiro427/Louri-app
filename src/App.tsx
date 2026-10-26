import { ScreenErrorBoundary } from "./components/ScreenErrorBoundary";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import {
  initializeAccount,
  watchAccountConnection,
} from "./services/accountService";
import { useAccountStore } from "./store/useAccountStore";
import "./components/AccountPanel.css";
import { AccountPanel } from "./components/AccountPanel";
import { Layout } from "./components/Layout";
import { SwipeNavigator } from "./components/SwipeNavigator";
import { DeviceNavigation } from "./components/DeviceNavigation";
const Onboarding = lazy(() =>
  import("./pages/Onboarding").then((module) => ({
    default: module.Onboarding,
  })),
);
const RefeicaoLivre = lazy(() =>
  import("./pages/RefeicaoLivre").then((module) => ({
    default: module.RefeicaoLivre,
  })),
);
export function App() {
  const { ready, owner, message, status } = useAccountStore();
  useEffect(() => {
    void initializeAccount();
    return watchAccountConnection();
  }, []);
  if (!ready)
    return (
      <div className="louri-account-gate" role="status">
        <p>{message || "Abrindo seu Louri…"}</p>
        {message && (
          <button onClick={() => void initializeAccount()}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  if (status === "conflict")
    return (
      <div className="louri-account-gate">
        <AccountPanel />
      </div>
    );
  return (
    <HashRouter>
      <AppScreens key={owner} />
    </HashRouter>
  );
}
function AppScreens() {
  const { pathname } = useLocation();
  return (
    <ScreenErrorBoundary resetKey={pathname}>
      <DeviceNavigation />
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
