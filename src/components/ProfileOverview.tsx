import { AppGuide } from "./AppGuide";
import { ReminderSettings } from "./ReminderSettings";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { calculateIMC } from "../utils/nutritionMath";
import { getPlanTargets } from "../utils/planTargets";
import { configurarNotificacoesNativas } from "../services/notificationService";
import { ActionRow, Icon, PageHeader, SectionHeading } from "./ui/AppUI";
import { numberText } from "./ui/format";
export function ProfileOverview({
  openIdea,
  openSupport,
  openFeedback,
  openTerms,
  onSignOut,
}: {
  openIdea: () => void;
  openSupport: () => void;
  openFeedback: () => void;
  openTerms: () => void;
  onSignOut: () => void;
}) {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const dark = dados.temaEscuro ?? true;
  const notifications = dados.notificacoes ?? true;
  const targets = getPlanTargets(dados);
  const imc = calculateIMC(targets.weight, Number(dados.altura) || 170);
  const category =
    imc < 18.5
      ? "Abaixo do peso"
      : imc < 25
        ? "Normal"
        : imc < 30
          ? "Sobrepeso"
          : "Obesidade";
  const edit = () => navigate("/onboarding");
  return (
    <>
      <PageHeader eyebrow="Do seu jeito" title="Perfil" />
      <section className="app-card app-profile-identity">
        <span className="app-profile-avatar">
          {dados.nome?.charAt(0).toUpperCase() || "U"}
        </span>
        <div>
          <h2>{dados.nome || "Seu perfil"}</h2>
          <p>{targets.objective}</p>
        </div>
        <button
          className="app-icon-button"
          aria-label="Editar perfil"
          onClick={edit}
        >
          <Icon name="edit" size={18} />
        </button>
      </section>
      <section>
        <SectionHeading title="Suas medidas" />
        <div className="app-card app-settings-list">
          <ActionRow
            icon="scale"
            title="Peso atual"
            value={`${numberText(targets.weight, 1)} kg`}
            onClick={() => useUserStore.getState().setModalPesoAberto(true)}
          />
          <ActionRow
            icon="user"
            title="Altura"
            value={`${dados.altura || "—"} cm`}
          />
          <ActionRow title="IMC" detail={category} value={numberText(imc, 1)} />
        </div>
      </section>
      <section>
        <SectionHeading
          title="Sua rotina"
          action={
            <button className="app-text-button" onClick={edit}>
              Editar <Icon name="edit" size={13} />
            </button>
          }
        />
        <div className="app-card app-settings-list">
          <ActionRow icon="target" title="Objetivo" value={targets.objective} />
          <div className="app-profile-times">
            <div>
              <Icon name="sun" size={18} />
              <span>Acordar</span>
              <strong>{dados.horaAcorda || "—"}</strong>
            </div>
            <div>
              <Icon name="moon" size={18} />
              <span>Dormir</span>
              <strong>{dados.horaDorme || "—"}</strong>
            </div>
          </div>
        </div>
      </section>
      <section>
        <SectionHeading title="Preferências" />
        <div className="app-card app-settings-list">
          <button
            className="app-action-row"
            role="switch"
            aria-label="Notificações"
            aria-checked={notifications}
            onClick={() => {
              useUserStore
                .getState()
                .setDados({ notificacoes: !notifications });
              void configurarNotificacoesNativas(true).catch(() => {});
            }}
          >
            <span className="app-row-icon">
              <Icon name="bell" size={19} />
            </span>
            <span className="app-row-copy">
              <strong>Notificações</strong>
              <small>Lembretes para a sua rotina</small>
            </span>
            <span
              className={`app-switch ${notifications ? "is-on" : ""}`}
              aria-hidden="true"
            >
              <i />
            </span>
          </button>
          <ReminderSettings />
          <button
            className="app-action-row"
            role="switch"
            aria-label="Tema escuro"
            aria-checked={dark}
            onClick={() =>
              useUserStore.getState().setDados({ temaEscuro: !dark })
            }
          >
            <span className="app-row-icon">
              <Icon name="moon" size={19} />
            </span>
            <span className="app-row-copy">
              <strong>Tema escuro</strong>
              <small>A aparência que você prefere</small>
            </span>
            <span
              className={`app-switch ${dark ? "is-on" : ""}`}
              aria-hidden="true"
            >
              <i />
            </span>
          </button>
        </div>
      </section>
      <section>
        <SectionHeading title="Ajuda e informação" />
        <div className="app-card app-settings-list">
          <AppGuide replay />
          <ActionRow icon="idea" title="Deixe sua ideia" onClick={openIdea} />
          <ActionRow
            icon="star"
            title="Avaliar o Louri"
            onClick={openFeedback}
          />
          <ActionRow
            icon="help"
            title="Falar com o suporte"
            onClick={openSupport}
          />
          <ActionRow
            icon="file"
            title="Termos e privacidade"
            onClick={openTerms}
          />
        </div>
      </section>
      <div className="app-card app-settings-list">
        <ActionRow
          icon="settings"
          title="Refazer configuração"
          onClick={edit}
        />
        <ActionRow
          icon="exit"
          title="Sair do perfil"
          danger
          onClick={onSignOut}
        />
      </div>
      <p className="app-profile-footer">
        Louri <span>Beta</span>
      </p>
    </>
  );
}
