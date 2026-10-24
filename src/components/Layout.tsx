import { reminderInbox } from "../utils/reminderNavigation";
import {
  configurarNotificacoesNativas,
  watchReminderTap,
} from "../services/notificationService";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { Icon } from "./ui/AppUI";
import { WeightEntry } from "./WeightEntry";
import { useBackLayer } from "../hooks/useBackLayer";
import { useOnline } from "../hooks/useOnline";
import type { IconName } from "./ui/AppUI";
import "../app-ui.css";
import "../app-motion.css";
import "../app-mobile.css";
import "../app-easy.css";
const links: { path: string; label: string; icon: IconName }[] = [
  { path: "/", label: "Início", icon: "home" },
  { path: "/plano", label: "Plano", icon: "plan" },
  { path: "/evolucao", label: "Evolução", icon: "chart" },
  { path: "/perfil", label: "Perfil", icon: "user" },
];
export function Layout({ children }: { children: React.ReactNode }) {
  const online = useOnline();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const weightOpen = useUserStore((state) => state.modalPesoAberto);
  const reminderSignature = JSON.stringify([
    dados.nome,
    dados.notificacoes,
    dados.lembretes,
    dados.horariosRefeicoes,
    dados.refeicoesAtivas,
    dados.horaAcorda,
    dados.horaDorme,
    dados.ultimaData,
    dados.peso,
    dados.aguaConsumida,
    dados.refeicoesConcluidas,
  ]);
  useEffect(() => {
    void configurarNotificacoesNativas().catch(() => {});
  }, [reminderSignature]);
  useEffect(
    () =>
      watchReminderTap((target) => {
        const route = ["/", "/evolucao"].includes(target.route || "")
          ? target.route!
          : "/";
        if (route === "/") reminderInbox.publish(target);
        navigate(route);
      }),
    [navigate],
  );
  const [fabPath, setFabPath] = useState<string | null>(null);
  const fab = fabPath === pathname;
  useBackLayer(fab, () => setFabPath(null));
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  useEffect(() => {
    const refresh = () => useUserStore.getState().verificarViradaDeDia();
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
    },
    [],
  );
  const notify = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };
  const openWeight = () => {
    setFabPath(null);
    useUserStore.getState().setModalPesoAberto(true);
  };
  const showMenu =
    Boolean(dados.nome?.trim()) &&
    !["/onboarding", "/refeicao-livre"].includes(pathname);
  const navLink = (item: (typeof links)[number]) => (
    <Link
      key={item.path}
      to={item.path}
      aria-label={item.label}
      aria-current={pathname === item.path ? "page" : undefined}
      className={`app-nav-link ${pathname === item.path ? "is-active" : ""}`}
      onClick={() => setFabPath(null)}
    >
      <Icon name={item.icon} size={23} />
      <span>{item.label}</span>
    </Link>
  );
  return (
    <div
      className={`louri-app ${(dados.temaEscuro ?? true) ? "" : "app-light"}`}
    >
      {!online && (
        <p className="app-network-note" role="status">
          Sem internet. Seus registros continuam funcionando e ficam salvos
          neste aparelho.
        </p>
      )}
      <main className="app-main">{children}</main>
      {toast && (
        <div className="app-toast" role="status">
          <Icon name="check" size={17} />
          {toast}
        </div>
      )}
      {showMenu && (
        <>
          {fab && (
            <>
              <button
                className="app-fab-scrim"
                aria-label="Fechar ações rápidas"
                onClick={() => setFabPath(null)}
              />
              <div
                className="app-fab-menu"
                role="group"
                aria-label="Ações rápidas"
              >
                <button onClick={openWeight}>
                  <span className="app-icon-tile">
                    <Icon name="scale" />
                  </span>
                  <span>
                    <strong>Registrar peso</strong>
                    <small>Atualize seu acompanhamento</small>
                  </span>
                  <Icon name="chevron" size={17} />
                </button>
                <button
                  onClick={() => {
                    setFabPath(null);
                    navigate("/refeicao-livre");
                  }}
                >
                  <span className="app-icon-tile">
                    <Icon name="plan" />
                  </span>
                  <span>
                    <strong>Refeição livre</strong>
                    <small>Adicione algo fora do plano</small>
                  </span>
                  <Icon name="chevron" size={17} />
                </button>
                <button
                  onClick={() => {
                    setFabPath(null);
                    useUserStore.getState().adicionarAgua(250, 99999);
                    notify("+250 ml de água registrados");
                  }}
                >
                  <span className="app-icon-tile app-tone-blue">
                    <Icon name="water" />
                  </span>
                  <span>
                    <strong>Beber água</strong>
                    <small>Adicionar um copo de 250 ml</small>
                  </span>
                  <Icon name="plus" size={18} />
                </button>
              </div>
            </>
          )}
          <nav className="app-bottom-nav" aria-label="Navegação principal">
            <div>
              {links.slice(0, 2).map(navLink)}
              <div className="app-nav-center">
                <button
                  className={`app-fab-button ${fab ? "is-open" : ""}`}
                  aria-label={
                    fab ? "Fechar ações rápidas" : "Abrir ações rápidas"
                  }
                  aria-expanded={fab}
                  onClick={() => setFabPath(fab ? null : pathname)}
                >
                  <Icon name="plus" size={27} />
                </button>
              </div>
              {links.slice(2).map(navLink)}
            </div>
          </nav>
        </>
      )}
      {weightOpen && (
        <WeightEntry
          initial={dados.peso || ""}
          onClose={() => useUserStore.getState().setModalPesoAberto(false)}
          onSaved={() => {
            useUserStore.getState().setModalPesoAberto(false);
            notify("Peso atualizado");
          }}
        />
      )}
    </div>
  );
}
