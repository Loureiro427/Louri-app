import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { DICIONARIO_ALIMENTOS } from "../data/alimentos";
import {
  CONFIG_REFEICOES,
  getCronograma,
  getHorarioSugerido,
  horarioValido,
} from "../utils/nutritionMath";
import {
  ArrowIcon,
  CheckIcon,
  ChoiceCard,
  MeasurementControl,
  TimeInput,
} from "../components/onboarding/OnboardingControls";
import logo from "../assets/logo.png";
import "./Onboarding.css";
import { normalizeMealPreferences } from "../utils/mealPreferences";

type Draft = {
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  sexo: string;
  objetivo: string;
  horaAcorda: string;
  horaDorme: string;
  refeicoesAtivas: string[];
  horariosRefeicoes: Record<string, string>;
  alimentos: Record<string, string[]>;
};
const objetivos = [
  {
    id: "perder",
    title: "Emagrecimento",
    detail: "Foco em reduzir o peso",
    icon: "🔥",
  },
  {
    id: "manter",
    title: "Saúde e equilíbrio",
    detail: "Manter o peso e cuidar da rotina",
    icon: "🥗",
  },
  {
    id: "ganhar",
    title: "Ganho de massa",
    detail: "Foco em ganhar massa muscular",
    icon: "💪",
  },
];
const perguntas: Record<string, string> = {
  cafeManha: "O que combina com seu café da manhã?",
  almoco: "O que combina com seu almoço?",
  lancheTarde: "O que você gosta de comer à tarde?",
  cafeTarde: "Como é seu café da tarde?",
  janta: "O que combina com seu jantar?",
  lancheNoite: "O que você prefere comer à noite?",
};
const etapas: Record<
  number,
  { eyebrow: string; title: string; description: string }
> = {
  1: {
    eyebrow: "Vamos nos conhecer",
    title: "Como podemos chamar você?",
    description: "Seu plano começa com você. Conte como prefere ser chamado.",
  },
  2: {
    eyebrow: "Sobre você",
    title: "Qual é a sua idade?",
    description:
      "Essa informação ajuda a personalizar suas estimativas diárias.",
  },
  3: {
    eyebrow: "Seu ponto de partida",
    title: "Qual é o seu peso atual?",
    description: "Um ponto de partida para acompanhar a sua evolução.",
  },
  4: {
    eyebrow: "Suas medidas",
    title: "Qual é a sua altura?",
    description: "Mais um detalhe para deixar o plano com a sua medida.",
  },
  5: {
    eyebrow: "Seu perfil",
    title: "Qual é o seu sexo biológico?",
    description: "Usamos essa informação na estimativa do metabolismo.",
  },
  6: {
    eyebrow: "Uma direção para seguir",
    title: "Qual é o seu objetivo?",
    description: "Escolha o foco que faz sentido para o seu momento.",
  },
  7: {
    eyebrow: "No seu ritmo",
    title: "Como é a sua rotina?",
    description: "Conte a que horas seu dia começa e quando costuma descansar.",
  },
  8: {
    eyebrow: "Seu dia à mesa",
    title: "Quais refeições fazem parte do seu dia?",
    description:
      "Escolha só as refeições que costuma fazer. Depois, vamos cuidar de cada uma.",
  },
};
const numero = (value: string) => Number(value.replace(",", "."));

export function Onboarding() {
  const navigate = useNavigate();
  const dados = useUserStore((state) => state.dados);
  const [draft, setDraft] = useState<Draft>(() => ({
    nome: dados.nome || "",
    idade: String(dados.idade || 25),
    peso: String(dados.peso || 70),
    altura: String(dados.altura || 170),
    sexo: dados.sexo || "",
    objetivo: dados.objetivo || "",
    horaAcorda: dados.horaAcorda || "07:00",
    horaDorme: dados.horaDorme || "22:00",
    refeicoesAtivas: dados.refeicoesAtivas?.length
      ? [...dados.refeicoesAtivas]
      : ["cafeManha", "almoco", "lancheTarde", "janta"],
    horariosRefeicoes: { ...dados.horariosRefeicoes },
    alimentos: normalizeMealPreferences(dados.alimentos),
  }));
  const [step, setStep] = useState(dados.nome ? 1 : 0);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [error, setError] = useState("");
  const [salvando, setSalvando] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const savedRef = useRef(false);
  const selecionadas = Object.keys(CONFIG_REFEICOES).filter((key) =>
    draft.refeicoesAtivas.includes(key)
  );
  const reviewStep = 9 + selecionadas.length;
  const isReview = step === reviewStep;
  const mealIndex = step - 9;
  const mealKey = step >= 9 && !isReview ? selecionadas[mealIndex] : undefined;
  const meal = mealKey ? CONFIG_REFEICOES[mealKey] : undefined;
  const mealFoods = mealKey ? draft.alimentos[mealKey] || [] : [];
  const horario = mealKey
    ? draft.horariosRefeicoes[mealKey] ??
      getHorarioSugerido(mealKey, draft.horaAcorda)
    : "";
  const schedule = getCronograma(draft);
  const group = step <= 6 ? 0 : step <= 8 ? 1 : 2;
  const meta = etapas[step];
  const title =
    step === 0
      ? "Sua rotina,\nmais leve."
      : isReview
      ? "Tudo pronto para começar."
      : mealKey
      ? perguntas[mealKey]
      : meta?.title || "";
  const description = isReview
    ? "Confira suas escolhas. Você pode voltar e ajustar qualquer detalhe."
    : mealKey
    ? "Marque o que você come ou comeria nesta refeição. Vale escolher mais de um."
    : meta?.description;
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((previous) => ({ ...previous, [key]: value }));
    setError("");
  }
  function back() {
    setError("");
    if (step === 0) navigate("/");
    else if (step === 1 && dados.nome) navigate("/perfil");
    else setStep(step - 1);
  }
  function toggleMeal(key: string) {
    if (
      draft.refeicoesAtivas.includes(key) &&
      draft.refeicoesAtivas.length === 1
    ) {
      setError("Mantenha pelo menos uma refeição no seu dia.");
      return;
    }
    update(
      "refeicoesAtivas",
      draft.refeicoesAtivas.includes(key)
        ? draft.refeicoesAtivas.filter((item) => item !== key)
        : [...draft.refeicoesAtivas, key]
    );
  }
  function toggleFood(id: string) {
    if (!mealKey) return;
    update("alimentos", {
      ...draft.alimentos,
      [mealKey]: mealFoods.includes(id)
        ? mealFoods.filter((item) => item !== id)
        : [...mealFoods, id],
    });
  }
  function validate() {
    if (step === 0 && !aceitouTermos)
      return "Leia e aceite os Termos e Diretrizes para continuar.";
    if (step === 1 && !draft.nome.trim())
      return "Digite como você prefere ser chamado.";
    for (const [s, value, min, max, label, integer] of [
      [2, draft.idade, 14, 100, "uma idade entre 14 e 100 anos", true],
      [3, draft.peso, 30, 300, "um peso entre 30 e 300 kg", false],
      [4, draft.altura, 100, 250, "uma altura entre 100 e 250 cm", false],
    ] as const) {
      if (
        step === s &&
        (!value.trim() ||
          !Number.isFinite(numero(value)) ||
          numero(value) < min ||
          numero(value) > max ||
          (integer && !Number.isInteger(numero(value))))
      )
        return `Informe ${label}.`;
    }
    if (step === 5 && !draft.sexo) return "Selecione uma opção para continuar.";
    if (step === 6 && !draft.objetivo)
      return "Escolha seu objetivo para continuar.";
    if (
      step === 7 &&
      (!horarioValido(draft.horaAcorda) || !horarioValido(draft.horaDorme))
    )
      return "Preencha os dois horários para continuar.";
    if (step === 7 && draft.horaAcorda === draft.horaDorme)
      return "Use horários diferentes para acordar e dormir.";
    if (mealKey && !horarioValido(horario))
      return "Escolha um horário válido para esta refeição.";
    if (mealKey && !mealFoods.length)
      return "Escolha pelo menos um alimento para continuar.";
    return "";
  }
  function advance() {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (!isReview) {
      setError("");
      setStep(step + 1);
      return;
    }
    if (savedRef.current) return;
    savedRef.current = true;
    setSalvando(true);
    useUserStore.getState().setDados({
      ...draft,
      nome: draft.nome.trim(),
      idade: String(numero(draft.idade)),
      peso: String(numero(draft.peso)),
      altura: String(numero(draft.altura)),
    });
    useUserStore.getState().atualizarPeso(String(numero(draft.peso)));
    navigate("/");
  }
  const buttonText =
    step === 0
      ? "Começar meu plano"
      : isReview
      ? dados.nome
        ? "Salvar meu plano"
        : "Criar meu plano"
      : mealKey
      ? mealIndex === selecionadas.length - 1
        ? "Revisar meu plano"
        : "Próxima refeição"
      : "Continuar";
  const footerText =
    step === 0
      ? "No seu ritmo. Do seu jeito."
      : isReview
      ? "Seu próximo passo começa aqui."
      : mealKey
      ? `${mealFoods.length} ${
          mealFoods.length === 1
            ? "alimento selecionado"
            : "alimentos selecionados"
        }`
      : step === 8
      ? `${selecionadas.length} ${
          selecionadas.length === 1
            ? "refeição no seu dia"
            : "refeições no seu dia"
        }`
      : "Um passo de cada vez.";

  return (
    <div className={`ob-screen ${dados.temaEscuro ?? true ? "" : "ob-light"}`}>
      <form
        className="ob-shell"
        onSubmit={(e) => {
          e.preventDefault();
          advance();
        }}
      >
        <header className="ob-header">
          <div className="ob-topbar">
            <button
              type="button"
              onClick={back}
              aria-label="Voltar"
              className="ob-back"
            >
              <ArrowIcon back />
            </button>
            <span className="ob-brand">
              <img src={logo} alt="" />
              <span>
                Louri<span className="ob-brand-dot">.</span>
              </span>
            </span>
            <span className="ob-step-number">
              {step === 0
                ? "BEM-VINDO"
                : `${String(step).padStart(2, "0")} / ${reviewStep}`}
            </span>
          </div>
          {step > 0 && (
            <div
              className="ob-progress"
              role="progressbar"
              aria-label="Progresso do cadastro"
              aria-valuemin={1}
              aria-valuemax={reviewStep}
              aria-valuenow={step}
            >
              {["Seu perfil", "Sua rotina", "Alimentação"].map((label, i) => (
                <div
                  key={label}
                  className={`ob-progress-group ${
                    i === group ? "is-current" : ""
                  } ${i < group ? "is-complete" : ""}`}
                >
                  <div>
                    <span
                      style={{
                        width: `${
                          i < group
                            ? 100
                            : i > group
                            ? 0
                            : group === 0
                            ? (step / 6) * 100
                            : group === 1
                            ? ((step - 6) / 2) * 100
                            : ((step - 8) / (selecionadas.length + 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {i < group ? "✓ " : ""}
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </header>
        <div className="ob-content" ref={contentRef}>
          <div
            className={`ob-stage ${step === 0 ? "ob-stage--welcome" : ""}`}
            key={step}
          >
            {step === 0 ? (
              <>
                <div className="ob-welcome-art" aria-hidden="true">
                  <span className="ob-orbit ob-orbit--one" />
                  <span className="ob-orbit ob-orbit--two" />
                  <span className="ob-floating ob-floating--apple">🍎</span>
                  <span className="ob-floating ob-floating--leaf">🥗</span>
                  <span className="ob-floating ob-floating--water">💧</span>
                  <div className="ob-welcome-logo">
                    <img src={logo} alt="" />
                  </div>
                </div>
                <span className="ob-eyebrow">BEM-VINDO AO SEU NOVO RITMO</span>
                <h1 ref={headingRef} tabIndex={-1} className="ob-welcome-title">
                  Sua rotina,
                  <br />
                  <span>mais leve.</span>
                </h1>
                <p className="ob-description">
                  Alimentação, hidratação e evolução.
                  <br />
                  Um plano que acompanha a sua vida.
                </p>
                <div className="ob-local-note">
                  <span className="ob-note-symbol" aria-hidden="true">
                    ↳
                  </span>
                  <div>
                    <strong>Comece sem criar uma conta</strong>
                    <p>Seus registros ficam salvos neste dispositivo.</p>
                  </div>
                </div>
                <label className="ob-terms">
                  <input
                    type="checkbox"
                    checked={aceitouTermos}
                    onChange={(e) => {
                      setAceitouTermos(e.target.checked);
                      setError("");
                    }}
                  />
                  <span>
                    Li e concordo com os{" "}
                    <a
                      href="https://sites.google.com/view/termosediretrizeslourifit/in%C3%ADcio"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Termos e Diretrizes
                    </a>{" "}
                    e compreendo o aviso de isenção médica.
                  </span>
                </label>
              </>
            ) : (
              <>
                <div className="ob-heading">
                  <span className="ob-eyebrow">
                    {isReview
                      ? "SEU PLANO, DO SEU JEITO"
                      : mealKey
                      ? `REFEIÇÃO ${mealIndex + 1} DE ${selecionadas.length}`
                      : meta?.eyebrow}
                  </span>
                  <h1 ref={headingRef} tabIndex={-1}>
                    {title}
                  </h1>
                  <p className="ob-description">{description}</p>
                </div>
                {step === 1 && (
                  <div className="ob-name-section">
                    <div className="ob-avatar" aria-hidden="true">
                      {draft.nome.trim().charAt(0).toUpperCase() || (
                        <svg
                          width="42"
                          height="42"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.3"
                        >
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
                        </svg>
                      )}
                      <span>
                        <CheckIcon />
                      </span>
                    </div>
                    <label className="ob-text-field">
                      <span>Seu nome</span>
                      <input
                        aria-label="Seu nome"
                        value={draft.nome}
                        maxLength={25}
                        autoComplete="given-name"
                        placeholder="Como você prefere ser chamado?"
                        onChange={(e) => update("nome", e.target.value)}
                      />
                    </label>
                    <div className="ob-inline-note">
                      <span aria-hidden="true">✦</span> Um plano com o seu nome
                      e a sua rotina.
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <MeasurementControl
                    label="Sua idade"
                    value={draft.idade}
                    onChange={(v) => update("idade", v)}
                    min={14}
                    max={100}
                    unit="anos"
                    detail="Cada fase tem seu ritmo"
                  />
                )}
                {step === 3 && (
                  <MeasurementControl
                    label="Seu peso"
                    value={draft.peso}
                    onChange={(v) => update("peso", v)}
                    min={30}
                    max={300}
                    step={0.1}
                    unit="kg"
                    detail="Cada avanço conta"
                  />
                )}
                {step === 4 && (
                  <MeasurementControl
                    label="Sua altura"
                    value={draft.altura}
                    onChange={(v) => update("altura", v)}
                    min={100}
                    max={250}
                    unit="cm"
                    detail="Na sua medida"
                  />
                )}
                {step === 5 && (
                  <div className="ob-options ob-sex-options">
                    <ChoiceCard
                      title="Masculino"
                      detail="Sexo biológico masculino"
                      icon="👨"
                      selected={draft.sexo === "M"}
                      onClick={() => update("sexo", "M")}
                    />
                    <ChoiceCard
                      title="Feminino"
                      detail="Sexo biológico feminino"
                      icon="👩"
                      selected={draft.sexo === "F"}
                      onClick={() => update("sexo", "F")}
                    />
                    <p className="ob-inline-note">
                      Essa informação é usada somente na personalização das
                      estimativas do plano.
                    </p>
                  </div>
                )}
                {step === 6 && (
                  <div className="ob-options">
                    {objetivos.map((o) => (
                      <ChoiceCard
                        key={o.id}
                        title={o.title}
                        detail={o.detail}
                        icon={o.icon}
                        selected={draft.objetivo === o.id}
                        onClick={() => update("objetivo", o.id)}
                      />
                    ))}
                    <p className="ob-inline-note">
                      Você pode mudar seu objetivo quando precisar.
                    </p>
                  </div>
                )}
                {step === 7 && (
                  <div className="ob-routine">
                    <div className="ob-routine-visual" aria-hidden="true">
                      <span>☀️</span>
                      <div>
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>
                      <span>🌙</span>
                    </div>
                    <label className="ob-time-card">
                      <span className="ob-time-symbol" aria-hidden="true">
                        ☀️
                      </span>
                      <span className="ob-time-label">
                        <strong>Meu dia começa</strong>
                        <small>Horário de acordar</small>
                      </span>
                      <TimeInput
                        label="Horário de acordar"
                        value={draft.horaAcorda}
                        onChange={(value) => update("horaAcorda", value)}
                      />
                    </label>
                    <label className="ob-time-card">
                      <span className="ob-time-symbol" aria-hidden="true">
                        🌙
                      </span>
                      <span className="ob-time-label">
                        <strong>Hora de descansar</strong>
                        <small>Horário de dormir</small>
                      </span>
                      <TimeInput
                        label="Horário de dormir"
                        value={draft.horaDorme}
                        onChange={(value) => update("horaDorme", value)}
                      />
                    </label>
                    <div className="ob-tip">
                      <span aria-hidden="true">✦</span>
                      <p>
                        Seu plano se adapta ao seu dia. Na próxima etapa,
                        escolha as refeições que fazem parte dele.
                      </p>
                    </div>
                  </div>
                )}
                {step === 8 && (
                  <div className="ob-meals-section">
                    <div className="ob-meal-choices">
                      {Object.entries(CONFIG_REFEICOES).map(([key, ref]) => (
                        <ChoiceCard
                          key={key}
                          title={ref.titulo}
                          detail={
                            draft.horariosRefeicoes[key] ||
                            getHorarioSugerido(key, draft.horaAcorda)
                          }
                          icon={ref.icone}
                          selected={draft.refeicoesAtivas.includes(key)}
                          onClick={() => toggleMeal(key)}
                          compact
                        />
                      ))}
                    </div>
                    <div className="ob-tip">
                      <span aria-hidden="true">✦</span>
                      <p>
                        Os horários são sugestões. Você poderá ajustar cada um
                        ao escolher os alimentos.
                      </p>
                    </div>
                  </div>
                )}
                {mealKey && meal && (
                  <div className="ob-food-section">
                    <div className="ob-meal-banner">
                      <span className="ob-meal-banner-icon" aria-hidden="true">
                        {meal.icone}
                      </span>
                      <div>
                        <strong>{meal.titulo}</strong>
                        <span>Um horário que funciona para você</span>
                      </div>
                      <TimeInput
                        label={`Horário de ${meal.titulo}`}
                        value={horario}
                        onChange={(value) =>
                          update("horariosRefeicoes", {
                            ...draft.horariosRefeicoes,
                            [mealKey]: value,
                          })
                        }
                      />
                    </div>
                    <div className="ob-food-grid">
                      {(DICIONARIO_ALIMENTOS[mealKey] || []).map((food) => (
                        <button
                          type="button"
                          key={food.id}
                          className={`ob-food ${
                            mealFoods.includes(food.id) ? "is-selected" : ""
                          }`}
                          aria-pressed={mealFoods.includes(food.id)}
                          onClick={() => toggleFood(food.id)}
                        >
                          <span className="ob-food-check" aria-hidden="true">
                            {mealFoods.includes(food.id) ? <CheckIcon /> : "+"}
                          </span>
                          <span className="ob-food-emoji" aria-hidden="true">
                            {food.emoji}
                          </span>
                          <span className="ob-food-name">{food.nome}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isReview && (
                  <div className="ob-review">
                    <div className="ob-review-profile">
                      <div className="ob-review-avatar">
                        {draft.nome.trim().charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <strong>{draft.nome.trim()}</strong>
                        <span>
                          {
                            objetivos.find((o) => o.id === draft.objetivo)
                              ?.title
                          }
                        </span>
                      </div>
                      <button type="button" onClick={() => setStep(1)}>
                        Editar perfil
                      </button>
                    </div>
                    <div className="ob-review-stats">
                      <div>
                        <strong>{draft.idade}</strong>
                        <span>anos</span>
                      </div>
                      <div>
                        <strong>{draft.peso}</strong>
                        <span>kg</span>
                      </div>
                      <div>
                        <strong>{draft.altura}</strong>
                        <span>cm</span>
                      </div>
                    </div>
                    <div className="ob-section-label">
                      <h2>Seu dia, organizado</h2>
                      <button type="button" onClick={() => setStep(8)}>
                        Editar refeições
                      </button>
                    </div>
                    <div className="ob-review-meals">
                      {schedule.map((ref) => (
                        <button
                          type="button"
                          key={ref.key}
                          className="ob-review-meal"
                          onClick={() =>
                            setStep(9 + selecionadas.indexOf(ref.key))
                          }
                        >
                          <span
                            className="ob-review-meal-icon"
                            aria-hidden="true"
                          >
                            {ref.icone}
                          </span>
                          <span className="ob-review-meal-copy">
                            <strong>{ref.titulo}</strong>
                            <span>
                              {(draft.alimentos[ref.key] || [])
                                .map(
                                  (id) =>
                                    DICIONARIO_ALIMENTOS[ref.key]?.find(
                                      (a) => a.id === id
                                    )?.nome
                                )
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <time>{ref.horario}</time>
                          <span aria-hidden="true">›</span>
                        </button>
                      ))}
                    </div>
                    <p className="ob-inline-note">
                      Você pode ajustar seu plano depois, no Perfil.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <footer className="ob-footer">
          <div
            className={`ob-footer-message ${error ? "has-error" : ""}`}
            role={error ? "alert" : "status"}
            aria-live="polite"
          >
            {error || (
              <>
                <span className="ob-footer-dot" />
                {footerText}
              </>
            )}
          </div>
          <button type="submit" className="ob-primary" disabled={salvando}>
            <span>{salvando ? "Salvando seu plano…" : buttonText}</span>
            {isReview ? <CheckIcon /> : <ArrowIcon />}
          </button>
        </footer>
      </form>
    </div>
  );
}
