import { describe, expect, it } from "vitest";
import { DomainError } from "./errors";
import { assertAiCannotClearConflict, assertAiCannotPublish, assertFiledDocumentImmutable } from "./invariants";
import { assertTransition } from "./state-machines";

describe("state machines", () => {
  it("allows draft matter to enter conflict review", () => {
    expect(() => assertTransition("matter", "DRAFT", "CONFLICT_REVIEW")).not.toThrow();
  });

  it("rejects archived to active", () => {
    expect(() => assertTransition("matter", "ARCHIVED", "ACTIVE")).toThrow(DomainError);
  });
});

describe("invariants", () => {
  it("blocks AI from clearing conflict", () => {
    expect(() => assertAiCannotClearConflict("ai", "CLEARED")).toThrow(DomainError);
  });

  it("blocks publish without human approval", () => {
    expect(() => assertAiCannotPublish("ai", "PUBLISHED", false)).toThrow(DomainError);
  });

  it("blocks mutation of filed original", () => {
    expect(() => assertFiledDocumentImmutable("FILED", true)).toThrow(DomainError);
  });
});
