/**
 * Password strength estimator based on Shannon entropy of the effective alphabet.
 * Returns entropy bits + a categorical score (0–4) and time-to-crack estimate.
 *
 * @license AGPL-3.0-or-later
 */

export type StrengthLabel = "very-weak" | "weak" | "fair" | "strong" | "very-strong";

export interface StrengthResult {
  entropyBits: number;
  score: 0 | 1 | 2 | 3 | 4;
  label: StrengthLabel;
  /** Estimated seconds to brute-force at 10^11 hashes/sec (modern GPU farm). */
  crackTimeSeconds: number;
  warnings: string[];
}

const COMMON_PATTERNS = [
  /^123+$/,
  /^password/i,
  /^qwerty/i,
  /^admin/i,
  /^letmein/i,
];

export function estimateStrength(password: string): StrengthResult {
  const warnings: string[] = [];
  if (!password) {
    return {
      entropyBits: 0,
      score: 0,
      label: "very-weak",
      crackTimeSeconds: 0,
      warnings: ["empty password"],
    };
  }

  let alphabet = 0;
  if (/[a-z]/.test(password)) alphabet += 26;
  if (/[A-Z]/.test(password)) alphabet += 26;
  if (/[0-9]/.test(password)) alphabet += 10;
  if (/[^A-Za-z0-9]/.test(password)) alphabet += 32;
  if (alphabet === 0) alphabet = 26;

  let entropyBits = password.length * Math.log2(alphabet);

  // Penalise common patterns and repeats.
  if (COMMON_PATTERNS.some((re) => re.test(password))) {
    warnings.push("matches a very common pattern");
    entropyBits = Math.min(entropyBits, 12);
  }
  if (/^(.)\1+$/.test(password)) {
    warnings.push("only repeated characters");
    entropyBits = Math.min(entropyBits, 8);
  }

  const score: StrengthResult["score"] =
    entropyBits < 28 ? 0 :
    entropyBits < 40 ? 1 :
    entropyBits < 60 ? 2 :
    entropyBits < 80 ? 3 : 4;

  const label: StrengthLabel =
    score === 0 ? "very-weak" :
    score === 1 ? "weak" :
    score === 2 ? "fair" :
    score === 3 ? "strong" : "very-strong";

  const crackTimeSeconds = Math.pow(2, entropyBits) / 1e11;

  return { entropyBits, score, label, crackTimeSeconds, warnings };
}
