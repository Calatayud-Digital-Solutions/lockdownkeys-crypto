import { describe, it, expect } from "vitest";
import { estimateStrength } from "../src/strength.js";

describe("strength estimator", () => {
  it("rates empty as very-weak", () => {
    expect(estimateStrength("").label).toBe("very-weak");
  });
  it("rates 'password' as very-weak", () => {
    expect(estimateStrength("password").score).toBeLessThanOrEqual(1);
  });
  it("rates a long random password as very-strong", () => {
    expect(estimateStrength("xK9$mLp2#qV4@nR8&zB6!").label).toBe("very-strong");
  });
});
