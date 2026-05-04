import { describe, it, expect } from "vitest";
import { generatePassword } from "../src/generator.js";

describe("password generator", () => {
  it("respects length", () => {
    expect(generatePassword({ length: 32 })).toHaveLength(32);
  });

  it("includes at least one of each enabled set", () => {
    const pw = generatePassword({ length: 16, lowercase: true, uppercase: true, numbers: true, symbols: true });
    expect(pw).toMatch(/[a-z]/);
    expect(pw).toMatch(/[A-Z]/);
    expect(pw).toMatch(/[0-9]/);
    expect(pw).toMatch(/[^A-Za-z0-9]/);
  });

  it("throws when no charset is enabled", () => {
    expect(() =>
      generatePassword({ lowercase: false, uppercase: false, numbers: false, symbols: false })
    ).toThrow();
  });

  it("excludes ambiguous characters when requested", () => {
    for (let i = 0; i < 20; i++) {
      const pw = generatePassword({ length: 64, excludeAmbiguous: true });
      expect(pw).not.toMatch(/[O0Il1|`'"]/);
    }
  });
});
