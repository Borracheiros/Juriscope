import { DomainError, assertInvariant } from "./errors";

export type ActorKind = "human" | "ai" | "system";

export function assertAiCannotClearConflict(actor: ActorKind, targetState: string): void {
  if (actor === "ai" && (targetState === "CLEARED" || targetState === "WAIVED")) {
    throw new DomainError("AI_CANNOT_CLEAR_CONFLICT", "IA não marca conflito como CLEARED/WAIVED");
  }
}

export function assertAiCannotConfirmDeadline(actor: ActorKind, targetState: string): void {
  if (actor === "ai" && (targetState === "CONFIRMED" || targetState === "DUE_SOON" || targetState === "COMPLETED")) {
    throw new DomainError("AI_CANNOT_CONFIRM_DEADLINE", "IA não confirma nem conclui prazo");
  }
}

export function assertAiCannotPublish(actor: ActorKind, targetState: string, approvedByHuman: boolean): void {
  if (targetState === "PUBLISHED") {
    assertInvariant(actor === "human" && approvedByHuman, "AI_PUBLISH_REQUIRES_HUMAN", "AIArtifact não publica sem aprovação humana");
  }
}

export function assertFiledDocumentImmutable(status: string, mutatingOriginal: boolean): void {
  if (status === "FILED" && mutatingOriginal) {
    throw new DomainError("FILED_IMMUTABLE", "Documento protocolado é imutável; crie nova versão");
  }
}

export function assertLegalHoldBlocksDelete(legalHold: boolean, isDelete: boolean): void {
  if (legalHold && isDelete) {
    throw new DomainError("LEGAL_HOLD_BLOCKS_DELETE", "Legal hold impede exclusão");
  }
}

export function assertClosedMatterBlocksMutation(status: string, governedReopen: boolean): void {
  if ((status === "CLOSED" || status === "ARCHIVED") && !governedReopen) {
    throw new DomainError("MATTER_CLOSED", "Matéria encerrada não aceita mutação sem reabertura governada");
  }
}

export function assertExtractedDeadlineNeedsHuman(verificationStatus: string): void {
  if (verificationStatus === "CONFIRMED") {
    return;
  }
  if (verificationStatus !== "VERIFICATION_REQUIRED" && verificationStatus !== "PROPOSED") {
    throw new DomainError("DEADLINE_VERIFICATION", "Prazo extraído exige validação humana");
  }
}
