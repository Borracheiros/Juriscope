import { describe, expect, it } from "vitest";
import { drainOutbox } from "./outbox";

describe("outbox drain", () => {
  it("exports a function", () => {
    expect(typeof drainOutbox).toBe("function");
  });
});
