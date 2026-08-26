import {
  AI_ARTIFACT_STATES,
  CONFLICT_CHECK_STATES,
  DEADLINE_STATES,
  DOCUMENT_STATES,
  LEGAL_MATTER_STATES,
} from "@juridico-ia/contracts";
import { DomainError } from "./errors";

type State = string;

const MATTER: Record<string, readonly string[]> = {
  DRAFT: ["CONFLICT_REVIEW", "ARCHIVED"],
  CONFLICT_REVIEW: ["ENGAGEMENT_PENDING", "DRAFT", "ARCHIVED"],
  ENGAGEMENT_PENDING: ["ACTIVE", "ARCHIVED"],
  ACTIVE: ["ON_HOLD", "CLOSING"],
  ON_HOLD: ["ACTIVE", "CLOSING"],
  CLOSING: ["CLOSED", "ACTIVE"],
  CLOSED: ["ARCHIVED"],
  ARCHIVED: [],
};

const CONFLICT: Record<string, readonly string[]> = {
  NOT_STARTED: ["RUNNING"],
  RUNNING: ["POTENTIAL_CONFLICT", "CLEARED", "HUMAN_REVIEW"],
  POTENTIAL_CONFLICT: ["HUMAN_REVIEW", "BLOCKED"],
  HUMAN_REVIEW: ["CLEARED", "WAIVER_REQUIRED", "BLOCKED"],
  CLEARED: [],
  WAIVER_REQUIRED: ["WAIVED", "BLOCKED"],
  WAIVED: ["CLEARED"],
  BLOCKED: [],
};

const DOCUMENT: Record<string, readonly string[]> = {
  DRAFT: ["UNDER_REVIEW", "ARCHIVED"],
  UNDER_REVIEW: ["APPROVED", "DRAFT"],
  APPROVED: ["SIGNED", "FILED", "SUPERSEDED"],
  SIGNED: ["FILED", "SUPERSEDED"],
  FILED: ["SUPERSEDED", "LEGAL_HOLD"],
  SUPERSEDED: ["ARCHIVED", "LEGAL_HOLD"],
  REVOKED: ["ARCHIVED"],
  ARCHIVED: ["LEGAL_HOLD"],
  LEGAL_HOLD: [],
};

const AI: Record<string, readonly string[]> = {
  GENERATING: ["DRAFT", "SOURCE_INCOMPLETE", "REJECTED"],
  DRAFT: ["REVIEW_REQUIRED", "SOURCE_INCOMPLETE", "SUPERSEDED"],
  SOURCE_INCOMPLETE: ["DRAFT", "REJECTED"],
  REVIEW_REQUIRED: ["APPROVED", "REJECTED"],
  APPROVED: ["PUBLISHED", "SUPERSEDED"],
  REJECTED: ["SUPERSEDED"],
  SUPERSEDED: [],
  PUBLISHED: ["SUPERSEDED"],
};

const DEADLINE: Record<string, readonly string[]> = {
  PROPOSED: ["VERIFICATION_REQUIRED", "CANCELLED"],
  VERIFICATION_REQUIRED: ["CONFIRMED", "CANCELLED", "SUPERSEDED"],
  CONFIRMED: ["DUE_SOON", "COMPLETED", "CANCELLED", "SUPERSEDED"],
  DUE_SOON: ["COMPLETED", "MISSED", "CANCELLED"],
  COMPLETED: [],
  MISSED: ["SUPERSEDED"],
  CANCELLED: [],
  SUPERSEDED: [],
};

function canGo(map: Record<string, readonly string[]>, from: State, to: State): boolean {
  return (map[from] ?? []).includes(to);
}

export function assertTransition(
  machine: "matter" | "conflict" | "document" | "aiArtifact" | "deadline",
  from: State,
  to: State,
): void {
  const maps = { matter: MATTER, conflict: CONFLICT, document: DOCUMENT, aiArtifact: AI, deadline: DEADLINE };
  if (!canGo(maps[machine], from, to)) {
    throw new DomainError("INVALID_TRANSITION", `${machine}: ${from} → ${to} não é permitido`);
  }
}

export const catalog = {
  matter: LEGAL_MATTER_STATES,
  conflict: CONFLICT_CHECK_STATES,
  document: DOCUMENT_STATES,
  aiArtifact: AI_ARTIFACT_STATES,
  deadline: DEADLINE_STATES,
};

export { MATTER as matterTransitions, CONFLICT as conflictTransitions, DOCUMENT as documentTransitions, AI as aiTransitions, DEADLINE as deadlineTransitions };
