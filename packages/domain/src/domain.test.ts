import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import { assertAiCannotClearConflict, assertAiCannotPublish, assertFiledDocumentImmutable } from "./invariants";
import { assertTransition } from "./state-machines";

function codeOf(fn: () => void): string {
  try {
    fn();
    throw new Error("expected DomainError");
  } catch (err) {
    expect(err).toBeInstanceOf(DomainError);
    return (err as DomainError).code;
  }
}

describe("state machines", () => {
  it("allows draft matter to enter conflict review", () => {
    expect(() => assertTransition("matter", "DRAFT", "CONFLICT_REVIEW")).not.toThrow();
  });

  it("rejects archived to active", () => {
    expect(codeOf(() => assertTransition("matter", "ARCHIVED", "ACTIVE"))).toBe("INVALID_TRANSITION");
  });
});

describe("invariants", () => {
  it("blocks AI from clearing conflict", () => {
    expect(codeOf(() => assertAiCannotClearConflict("ai", "CLEARED"))).toBe("AI_CANNOT_CLEAR_CONFLICT");
  });

  it("blocks publish without human approval", () => {
    expect(codeOf(() => assertAiCannotPublish("ai", "PUBLISHED", false))).toBe("AI_PUBLISH_REQUIRES_HUMAN");
  });

  it("blocks mutation of filed original", () => {
    expect(codeOf(() => assertFiledDocumentImmutable("FILED", true))).toBe("FILED_IMMUTABLE");
  });
});
