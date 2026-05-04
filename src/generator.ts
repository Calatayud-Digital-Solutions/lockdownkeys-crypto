/**
 * Cryptographically-secure password generator.
 * Uses crypto.getRandomValues with rejection sampling to avoid modulo bias.
 *
 * @license AGPL-3.0-or-later
 */

export interface GeneratorOptions {
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
  excludeAmbiguous?: boolean;
}

const SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~",
};
const AMBIGUOUS = /[O0Il1|`'"]/g;

function unbiasedIndex(max: number): number {
  // Reject values that would introduce modulo bias.
  const limit = Math.floor(0xff_ff_ff_ff / max) * max;
  const buf = new Uint32Array(1);
  let v: number;
  do {
    crypto.getRandomValues(buf);
    v = buf[0];
  } while (v >= limit);
  return v % max;
}

export function generatePassword(opts: GeneratorOptions = {}): string {
  const {
    length = 20,
    lowercase = true,
    uppercase = true,
    numbers = true,
    symbols = true,
    excludeAmbiguous = false,
  } = opts;

  if (length < 4 || length > 256) {
    throw new RangeError("length must be between 4 and 256");
  }

  const enabled: string[] = [];
  if (lowercase) enabled.push(SETS.lowercase);
  if (uppercase) enabled.push(SETS.uppercase);
  if (numbers) enabled.push(SETS.numbers);
  if (symbols) enabled.push(SETS.symbols);

  if (enabled.length === 0) {
    // Constraint inherited from Lock Down Keys: never allow disabling the last charset.
    throw new Error("At least one character set must be enabled");
  }

  let pool = enabled.join("");
  if (excludeAmbiguous) pool = pool.replace(AMBIGUOUS, "");

  // Guarantee at least one char from each enabled set.
  const out: string[] = enabled.map((s) => {
    const cleaned = excludeAmbiguous ? s.replace(AMBIGUOUS, "") : s;
    return cleaned[unbiasedIndex(cleaned.length)];
  });

  while (out.length < length) {
    out.push(pool[unbiasedIndex(pool.length)]);
  }

  // Fisher–Yates shuffle with unbiased RNG.
  for (let i = out.length - 1; i > 0; i--) {
    const j = unbiasedIndex(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out.join("");
}
