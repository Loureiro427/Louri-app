import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { ActionRow, Icon, Sheet } from "./ui/AppUI";

const steps = [
  {
    icon: "water" as const,
    title: "Bebeu água? Um toque e pronto",
    text: "No Início, toque em +200, +300 ou +500 ml conforme o copo que bebeu. Tocou sem querer? Use Desfazer.",
    example: "Um copo de 200 ml → toque em +200 ml",
  },
  {
    icon: "plan" as const,
    title: "Registre o que você comeu",
    text: "No Início, escolha a refeição e toque em Registrar. Selecione os alimentos, ajuste a quantidade e confira antes de salvar. Repetir última preenche a combinação para você revisar.",
    example: "Comeu 2 ovos? Selecione Ovo → Medida caseira → 2×",
  },
  {
    icon: "plus" as const,
    title: "Comeu algo fora do plano? Tudo bem",
    text: "O botão +, no meio da barra inferior, abre Refeição livre, Registrar peso e Beber água. Seu plano é uma referência para a rotina.",
    example: "Um lanche diferente → + → Refeição livre",
  },
  {
    icon: "chart" as const,
    title: "Você pode corrigir depois",
    text: "Em Evolução, toque em um dia do calendário ou do resumo semanal para ver os registros. Nos dias anteriores, você pode corrigir água e refeições. No Perfil, escolha seus lembretes.",
    example:
      "Esqueceu o almoço de ontem? Evolução → dia de ontem → Adicionar neste dia",
  },
];

export function AppGuide({ replay = false }: { replay?: boolean }) {
  const seen = useUserStore((s) => s.dados.tutorialVisto);
  const [step, setStep] = useState<number | null>(null);
  const finish = () => {
    useUserStore.getState().setDados({ tutorialVisto: true });
    setStep(null);
  };
  if (!replay && seen && step === null) return null;
  const current = step === null ? null : steps[step];
  return (
    <>
      {replay ? (
        <ActionRow
          icon="help"
          title="Como usar o Louri"
          detail="Rever o tutorial rápido"
          onClick={() => setStep(0)}
        />
      ) : (
        <section
          className="app-card app-guide-invite"
          aria-label="Boas-vindas ao Louri"
        >
          <span className="app-eyebrow">Vamos por partes</span>
          <h2>Seu primeiro dia no Louri</h2>
          <p>
            Veja como registrar água e refeições. São só 4 dicas, sem alterar
            seus dados.
          </p>
          <button
            className="app-button app-button--primary"
            onClick={() => setStep(0)}
          >
            Ver tutorial rápido
          </button>
          <button className="app-text-button" onClick={finish}>
            Agora não
          </button>
        </section>
      )}
      {current && step !== null && (
        <Sheet
          title="Como usar o Louri"
          description={`Dica ${step + 1} de ${steps.length}`}
          onClose={finish}
        >
          <div className="app-guide-step" key={step} aria-live="polite">
            <span className="app-guide-icon">
              <Icon name={current.icon} size={30} />
            </span>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
            <div className="app-guide-example">
              <span>Por exemplo</span>
              <strong>{current.example}</strong>
            </div>
          </div>
          <div className="app-guide-actions">
            {step > 0 && (
              <button
                className="app-button app-button--secondary"
                onClick={() => setStep(step - 1)}
              >
                Voltar
              </button>
            )}
            <button
              className="app-button app-button--primary"
              onClick={() =>
                step === steps.length - 1 ? finish() : setStep(step + 1)
              }
            >
              {step === steps.length - 1 ? "Pronto, entendi" : "Próxima dica"}
            </button>
          </div>
          <p className="app-helper">
            Você pode rever em Perfil → Como usar o Louri.
          </p>
        </Sheet>
      )}
    </>
  );
}

export function ContextTip({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const seen = useUserStore((s) => s.dados.dicasVistas);
  if (seen?.includes(id)) return null;
  return (
    <aside className="app-context-tip">
      <Icon name="idea" size={18} />
      <p>{children}</p>
      <button
        type="button"
        className="app-text-button"
        onClick={() =>
          useUserStore
            .getState()
            .setDados({ dicasVistas: [...(seen || []), id] })
        }
      >
        Entendi
      </button>
    </aside>
  );
}
