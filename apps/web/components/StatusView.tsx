import type { CognitiveState } from "@juridico-ia/contracts";

const COPY: Record<CognitiveState, string> = {
  NOT_COLLECTED: "Ainda não coletado",
  LOADING: "Carregando",
  READY: "Pronto",
  READY_WITH_WARNINGS: "Pronto, com alertas",
  BLOCKED: "Bloqueado",
  PARTIAL: "Parcial",
  STALE: "Desatualizado",
  ERROR: "Erro",
  FORBIDDEN: "Acesso restrito",
};

export function StatusView({ state, detail }: { state: CognitiveState; detail?: string }) {
  if (state === "FORBIDDEN") {
    return (
      <p role="alert" aria-live="polite">
        Acesso restrito
      </p>
    );
  }
  if (state === "ERROR") {
    return (
      <p role="alert" aria-live="assertive">
        {detail ?? "Não foi possível concluir a operação."}
      </p>
    );
  }
  if (state === "LOADING") {
    return <p aria-live="polite">Carregando…</p>;
  }
  if (state === "NOT_COLLECTED") {
    return <p>Nada a exibir ainda. Informe o contexto da matéria.</p>;
  }
  return (
    <p data-state={state}>
      {COPY[state]}
      {detail ? ` — ${detail}` : ""}
    </p>
  );
}
