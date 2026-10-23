import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { Icon, Sheet } from "./ui/AppUI";
import type { IconName } from "./ui/AppUI";
import "../app-ui.css";
const links: { path: string; label: string; icon: IconName }[] = [
  { path: "/", label: "Início", icon: "home" },
  { path: "/plano", label: "Plano", icon: "plan" },
  { path: "/evolucao", label: "Evolução", icon: "chart" },
  { path: "/perfil", label: "Perfil", icon: "user" },
];
export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const weightOpen = useUserStore((state) => state.modalPesoAberto);
  const [fab, setFab] = useState(false);
  const [toast, setToast] = useState("");
  const [weight, setWeight] = useState("");
  const [weightError, setWeightError] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
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
  useEffect(() => {
    setFab(false);
  }, [pathname]);
  useEffect(() => {
    if (weightOpen) {
      setWeight(String(dados.peso || ""));
      setWeightError("");
    }
  }, [weightOpen, dados.peso]);
  useEffect(
    () => () => {
      clearTimeout(toastTimer.current);
    },
    []
  );
  const notify = (message: string) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 3000);
  };
  const openWeight = () => {
    setFab(false);
    useUserStore.getState().setModalPesoAberto(true);
  };
  const saveWeight = () => {
    const value = Number(weight.replace(",", "."));
    if (
      !weight.trim() ||
      !Number.isFinite(value) ||
      value < 30 ||
      value > 300
    ) {
      setWeightError("Informe um peso entre 30 e 300 kg.");
      return;
    }
    useUserStore.getState().atualizarPeso(String(value));
    useUserStore.getState().setModalPesoAberto(false);
    notify("Peso atualizado");
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
      onClick={() => setFab(false)}
    >
      <Icon name={item.icon} size={23} />
      <span>{item.label}</span>
    </Link>
  );
  return (
    <div className={`louri-app ${dados.temaEscuro ?? true ? "" : "app-light"}`}>
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
                onClick={() => setFab(false)}
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
                    setFab(false);
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
                    setFab(false);
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
                  onClick={() => setFab(!fab)}
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
        <Sheet
          title="Atualizar peso"
          description="Registre seu peso atual para acompanhar a evolução."
          onClose={() => useUserStore.getState().setModalPesoAberto(false)}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveWeight();
            }}
          >
            <label className="app-weight-input">
              <span>Peso atual</span>
              <div>
                <input
                  type="text"
                  inputMode="decimal"
                  aria-label="Peso em quilos"
                  value={weight}
                  maxLength={6}
                  onChange={(e) => {
                    setWeight(e.target.value);
                    setWeightError("");
                  }}
                />
                <span>kg</span>
              </div>
            </label>
            {weightError && (
              <p className="app-field-error" role="alert">
                {weightError}
              </p>
            )}
            <div className="app-button-row">
              <button
                type="button"
                className="app-button app-button--secondary"
                onClick={() =>
                  useUserStore.getState().setModalPesoAberto(false)
                }
              >
                Cancelar
              </button>
              <button type="submit" className="app-button app-button--primary">
                Salvar peso
              </button>
            </div>
          </form>
        </Sheet>
      )}
    </div>
  );
}
