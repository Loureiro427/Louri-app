import { reminderSlots } from "../utils/reminders";
import { useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { defaultReminders } from "../utils/reminders";
import { getCronograma } from "../utils/nutritionMath";
import { configurarNotificacoesNativas } from "../services/notificationService";
import { ActionRow, Sheet } from "./ui/AppUI";
export function ReminderSettings() {
  const dados = useUserStore((s) => s.dados);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(
    dados.lembretes
      ? { ...defaultReminders, ...dados.lembretes }
      : {
          ...defaultReminders,
          refeicoes: dados.refeicoesAtivas || [],
        }
  );
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const preview = reminderSlots({ ...dados, lembretes: draft })[0]?.messages[0];
  return (
    <>
      <ActionRow
        icon="clock"
        title="Personalizar lembretes"
        detail="Refeições, água e horário de silêncio"
        onClick={() => {
          setDraft(
            dados.lembretes
              ? { ...defaultReminders, ...dados.lembretes }
              : {
                  ...defaultReminders,
                  refeicoes: dados.refeicoesAtivas || [],
                }
          );
          setStatus("");
          setOpen(true);
        }}
      />
      {open && (
        <Sheet
          title="Seus lembretes"
          description="Escolha o que faz sentido para sua rotina."
          onClose={() => setOpen(false)}
        >
          <form
            className="app-feature-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const fields = new FormData(e.currentTarget);
              const updated = {
                ...draft,
                silencioInicio: String(
                  fields.get("silencioInicio") || draft.silencioInicio
                ),
                silencioFim: String(
                  fields.get("silencioFim") || draft.silencioFim
                ),
              };
              setDraft(updated);
              setSaving(true);
              useUserStore.getState().setDados({ lembretes: updated });
              try {
                const result = await configurarNotificacoesNativas(true);
                setStatus(
                  result === "web"
                    ? "Preferências salvas. Os lembretes em segundo plano funcionam na versão Android instalada."
                    : result === "denied"
                    ? "Preferências salvas. Permita notificações nas configurações do aparelho para recebê-las."
                    : result === "update"
                    ? "Instale o novo APK Android para ativar o agendador corrigido."
                    : result === "disabled"
                    ? "Preferências salvas. Ative as notificações no Perfil para receber os lembretes."
                    : "Lembretes atualizados."
                );
              } catch {
                setStatus(
                  "Preferências salvas, mas não foi possível agendar. Tente novamente."
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            <h3 className="app-sheet-section-title">
              O jeito do Louri lembrar
            </h3>
            <label className="app-shopping-row">
              <input
                type="checkbox"
                checked={draft.humor}
                onChange={() => setDraft({ ...draft, humor: !draft.humor })}
              />
              <span>Mensagens bem-humoradas</span>
            </label>
            <label className="app-shopping-row">
              <input
                type="checkbox"
                checked={draft.motivacao}
                onChange={() =>
                  setDraft({ ...draft, motivacao: !draft.motivacao })
                }
              />
              <span>Um incentivo no fim do dia</span>
            </label>
            <div className="app-reminder-preview">
              <span>Uma das mensagens que você pode receber</span>
              <strong>{preview?.title || "Nenhum aviso selecionado"}</strong>
              <p>
                {preview?.body || "Escolha pelo menos um tipo de lembrete."}
              </p>
            </div>
            <h3 className="app-sheet-section-title">Refeições</h3>
            {getCronograma(dados).map((r) => (
              <label key={r.key} className="app-shopping-row">
                <input
                  type="checkbox"
                  checked={draft.refeicoes.includes(r.key)}
                  onChange={() =>
                    setDraft({
                      ...draft,
                      refeicoes: draft.refeicoes.includes(r.key)
                        ? draft.refeicoes.filter((k) => k !== r.key)
                        : [...draft.refeicoes, r.key],
                    })
                  }
                />
                <span>{r.titulo}</span>
                <small>{r.horario}</small>
              </label>
            ))}
            <label>
              Lembrar de beber água
              <select
                value={draft.aguaIntervalo}
                onChange={(e) =>
                  setDraft({ ...draft, aguaIntervalo: Number(e.target.value) })
                }
              >
                {[
                  [0, "Desativado"],
                  [30, "A cada 30 minutos"],
                  [60, "A cada hora"],
                  [90, "A cada 1h30"],
                  [120, "A cada 2 horas"],
                  [180, "A cada 3 horas"],
                  [240, "A cada 4 horas"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Silêncio a partir de
              <input
                type="time"
                required
                name="silencioInicio"
                value={draft.silencioInicio}
                onInput={(e) =>
                  setDraft({ ...draft, silencioInicio: e.currentTarget.value })
                }
              />
            </label>
            <label>
              Voltar a lembrar às
              <input
                type="time"
                required
                name="silencioFim"
                value={draft.silencioFim}
                onInput={(e) =>
                  setDraft({ ...draft, silencioFim: e.currentTarget.value })
                }
              />
            </label>
            <p className="app-helper">
              Refeições no período de silêncio não enviam lembretes. Horários
              iguais desativam o silêncio. Avisos muito próximos são agrupados:
              a refeição tem prioridade. O Louri para de lembrar da água ao
              atingir a meta e de refeições já registradas.
            </p>
            <button
              className="app-button app-button--primary"
              disabled={saving}
              type="submit"
            >
              {saving ? "Salvando…" : "Salvar lembretes"}
            </button>
            {status && (
              <p className="app-helper" role="status">
                {status}
              </p>
            )}
          </form>
        </Sheet>
      )}
    </>
  );
}
