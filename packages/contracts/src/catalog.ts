export const CAPABILITIES = [
  "client:read",
  "client:write",
  "matter:create",
  "matter:manage",
  "conflict:request",
  "conflict:review",
  "conflict:waive",
  "document:upload",
  "document:review",
  "document:approve",
  "document:file",
  "deadline:create",
  "deadline:confirm",
  "billing:read",
  "billing:adjust",
  "ai:generate",
  "ai:review",
  "ai:approve",
  "admin:manage",
  "audit:read",
] as const;

export type Capability = (typeof CAPABILITIES)[number];

export const ACCESS_PROFILES = [
  "lawyer",
  "paralegal",
  "legal_assistant",
  "intake",
  "conflict_reviewer",
  "billing",
  "knowledge_manager",
  "tenant_admin",
  "readonly",
  "client_portal",
] as const;

export type AccessProfileCode = (typeof ACCESS_PROFILES)[number];

export const PROFILE_CAPABILITIES: Record<AccessProfileCode, readonly Capability[]> = {
  lawyer: [
    "client:read",
    "client:write",
    "matter:create",
    "matter:manage",
    "conflict:request",
    "document:upload",
    "document:review",
    "deadline:create",
    "ai:generate",
    "ai:review",
    "audit:read",
  ],
  paralegal: [
    "client:read",
    "client:write",
    "matter:create",
    "conflict:request",
    "document:upload",
    "document:review",
    "deadline:create",
    "ai:generate",
  ],
  legal_assistant: ["client:read", "document:upload", "deadline:create"],
  intake: ["client:read", "client:write", "conflict:request"],
  conflict_reviewer: ["client:read", "conflict:request", "conflict:review", "conflict:waive"],
  billing: ["client:read", "billing:read", "billing:adjust"],
  knowledge_manager: ["ai:generate", "ai:review"],
  tenant_admin: [
    "client:read",
    "client:write",
    "matter:manage",
    "admin:manage",
    "audit:read",
  ],
  readonly: ["client:read", "billing:read", "audit:read"],
  client_portal: ["client:read", "document:review"],
};

export const COGNITIVE_STATES = [
  "NOT_COLLECTED",
  "LOADING",
  "READY",
  "READY_WITH_WARNINGS",
  "BLOCKED",
  "PARTIAL",
  "STALE",
  "ERROR",
  "FORBIDDEN",
] as const;

export type CognitiveState = (typeof COGNITIVE_STATES)[number];

export const LEGAL_MATTER_STATES = [
  "DRAFT",
  "CONFLICT_REVIEW",
  "ENGAGEMENT_PENDING",
  "ACTIVE",
  "ON_HOLD",
  "CLOSING",
  "CLOSED",
  "ARCHIVED",
] as const;

export const CONFLICT_CHECK_STATES = [
  "NOT_STARTED",
  "RUNNING",
  "POTENTIAL_CONFLICT",
  "HUMAN_REVIEW",
  "CLEARED",
  "WAIVER_REQUIRED",
  "WAIVED",
  "BLOCKED",
] as const;

export const DOCUMENT_STATES = [
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "SIGNED",
  "FILED",
  "SUPERSEDED",
  "REVOKED",
  "ARCHIVED",
  "LEGAL_HOLD",
] as const;

export const AI_ARTIFACT_STATES = [
  "GENERATING",
  "DRAFT",
  "SOURCE_INCOMPLETE",
  "REVIEW_REQUIRED",
  "APPROVED",
  "REJECTED",
  "SUPERSEDED",
  "PUBLISHED",
] as const;

export const DEADLINE_STATES = [
  "PROPOSED",
  "VERIFICATION_REQUIRED",
  "CONFIRMED",
  "DUE_SOON",
  "COMPLETED",
  "MISSED",
  "CANCELLED",
  "SUPERSEDED",
] as const;
