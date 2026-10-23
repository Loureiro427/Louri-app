import { PlanTools } from "../components/PlanTools";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { getCronograma, getRotina } from "../utils/nutritionMath";
import { getPlanTargets } from "../utils/planTargets";
import {
  Icon,
  PageHeader,
  SectionHeading,
  Sheet,
  litersText,
  numberText,
  toneStyle,
} from "../components/ui/AppUI";
const sources = {
  proteina: [
    ["🍗", "Frango"],
    ["🥚", "Ovos"],
    ["🐟", "Peixe"],
    ["🥛", "Iogurte"],
    ["🥩", "Carne"],
    ["🧀", "Queijo"],
  ],
  carbo: [
    ["🍚", "Arroz"],
    ["🥣", "Aveia"],
    ["🍠", "Batata"],
    ["🍝", "Macarrão"],
    ["🍌", "Frutas"],
    ["🌮", "Tapioca"],
  ],
  gordura: [
    ["🥜", "Castanhas"],
    ["🥑", "Abacate"],
    ["🫒", "Azeite"],
    ["🥚", "Gema de ovo"],
  ],
};
export function Plano() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const targets = getPlanTargets(dados);
  const schedule = getCronograma(dados);
  const [macro, setMacro] = useState<"proteina" | "carbo" | "gordura" | null>(
    null
  );
  return (
    <div className="app-page custom-scrollbar">
      <PageHeader
        eyebrow="Feito para a sua rotina"
        title="Seu plano"
        action={
          <button
            className="app-icon-button"
            aria-label="Editar plano"
            onClick={() => navigate("/onboarding")}
          >
            <Icon name="edit" size={19} />
          </button>
        }
      />
      <section className="app-card app-plan-overview">
        <div className="app-card-topline">
          <span>
            <Icon name="target" size={18} /> Seu objetivo
          </span>
          <span className="app-small-label">Metas diárias</span>
        </div>
        <h2>{targets.objective}</h2>
        <div className="app-target-grid">
          <div>
            <Icon name="flame" size={20} />
            <strong>
              {numberText(targets.calories)}
              <small>kcal</small>
            </strong>
            <span>Alimentação</span>
          </div>
          <div>
            <Icon name="water" size={20} />
            <strong>
              {litersText(targets.water)}
              <small>L</small>
            </strong>
            <span>Hidratação</span>
          </div>
          <div>
            <Icon name="moon" size={20} />
            <strong>
              {numberText(getRotina(dados).horasDescanso, 1)}
              <small>h</small>
            </strong>
            <span>Descanso</span>
          </div>
        </div>
      </section>
      <PlanTools />
      <section>
        <SectionHeading
          title="Macronutrientes"
          action={<span className="app-small-label">Consumo de hoje</span>}
        />
        <div className="app-card app-macro-list">
          {targets.macros.map((item) => {
            const value = dados.macrosConsumidos?.[item.key] || 0;
            return (
              <button
                key={item.key}
                className="app-macro-row"
                style={toneStyle(item.color)}
                onClick={() => setMacro(item.key)}
                aria-label={`Ver fontes de ${item.label.toLowerCase()}`}
              >
                <div className="app-macro-row-top">
                  <span>
                    <i />
                    {item.label}
                  </span>
                  <strong>
                    {value}
                    <small> / {item.grams} g</small>
                    <Icon name="chevron" size={14} />
                  </strong>
                </div>
                <div className="app-macro-progress">
                  <span
                    style={{
                      width: `${Math.min(100, (value / item.grams) * 100)}%`,
                    }}
                  />
                </div>
                <span className="app-macro-share">
                  {item.percentage}% da distribuição diária
                </span>
              </button>
            );
          })}
        </div>
        <p className="app-helper">
          Toque em um nutriente para ver exemplos de alimentos.
        </p>
      </section>
      <section>
        <SectionHeading
          title="Seus horários"
          action={
            <span className="app-small-label">{schedule.length} refeições</span>
          }
        />
        <div className="app-card app-schedule-list">
          {schedule.map((ref) => (
            <div key={ref.key} className="app-schedule-row">
              <span className="app-schedule-emoji" aria-hidden="true">
                {ref.icone}
              </span>
              <span>{ref.titulo}</span>
              <time>{ref.horario}</time>
            </div>
          ))}
        </div>
      </section>
      <button
        className="app-button app-button--secondary app-wide-button"
        onClick={() => navigate("/onboarding")}
      >
        <Icon name="settings" size={18} /> Ajustar meu plano
        <Icon name="chevron" size={16} />
      </button>
      <p className="app-helper app-centered">
        Metas estimadas com base no seu perfil.
      </p>
      {macro && (
        <Sheet
          title={`Fontes de ${targets.macros
            .find((item) => item.key === macro)
            ?.label.toLowerCase()}`}
          description="Alguns exemplos presentes no catálogo do app."
          onClose={() => setMacro(null)}
        >
          <div className="app-source-grid">
            {sources[macro].map(([emoji, name]) => (
              <div key={name}>
                <span aria-hidden="true">{emoji}</span>
                <strong>{name}</strong>
              </div>
            ))}
          </div>
          <button
            className="app-button app-button--secondary app-wide-button"
            onClick={() => setMacro(null)}
          >
            Entendi
          </button>
        </Sheet>
      )}
    </div>
  );
}
