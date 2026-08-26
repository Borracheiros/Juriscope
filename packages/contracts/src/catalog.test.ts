import { describe, expect, it } from "vitest";
import { ACCESS_PROFILES, PROFILE_CAPABILITIES } from "./catalog";

describe("profile capabilities", () => {
  it("does not grant conflict:waive to lawyer by default", () => {
    expect(PROFILE_CAPABILITIES.lawyer).not.toContain("conflict:waive");
  });

  it("covers every profile", () => {
    for (const code of ACCESS_PROFILES) {
      expect(PROFILE_CAPABILITIES[code].length).toBeGreaterThan(0);
    }
  });
});
