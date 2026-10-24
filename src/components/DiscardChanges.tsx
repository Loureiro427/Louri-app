import { Sheet } from "./ui/AppUI";
export function DiscardChanges({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <Sheet
      title="Sair sem salvar?"
      description="Você alterou este preenchimento. O que já está registrado continua igual."
      onClose={onKeep}
    >
      <div className="app-feature-form">
        <button className="app-button app-button--primary" onClick={onKeep}>
          Continuar preenchendo
        </button>
        <button
          className="app-button app-button--secondary"
          onClick={onDiscard}
        >
          Descartar alterações e sair
        </button>
      </div>
    </Sheet>
  );
}
