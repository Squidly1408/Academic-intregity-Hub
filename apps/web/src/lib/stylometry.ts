import { COMMON_WORDS_RANKED } from "./data/commonWords";

/**
 * Additional stylometric signals for AI-likelihood scoring, on top of the
 * repetition/burstiness/cliché signals in analysis.ts. These are lightweight
 * adaptations of real authorship-attribution techniques — approximate, not
 * a trained classifier, but grounded in more than one heuristic threshold.
 */

const COMMON_WORDS = new Set(COMMON_WORDS_RANKED.split(","));
const VERY_COMMON_WORDS = new Set(COMMON_WORDS_RANKED.split(",").slice(0, 2000));

/**
 * Among the *distinct* words used (not token count, so dominant function
 * words like "the" don't swamp the signal), what fraction are drawn from a
 * ~2000-word list of the most common English words? Substantive writing
 * tends to introduce specific, less-common vocabulary for its subject
 * matter; text that never reaches past generic vocabulary scores higher
 * here regardless of document length.
 */
export function vocabularyCommonality(words: string[]): number {
  const uniqueWords = [...new Set(words)];
  if (!uniqueWords.length) return 0;
  const common = uniqueWords.filter((word) => VERY_COMMON_WORDS.has(word)).length;
  return common / uniqueWords.length;
}

export function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word);
}

/**
 * Approximate relative frequencies of common English function words, for a
 * rough authorship-attribution-style distance metric (in the spirit of
 * Burrows' Delta). These are illustrative proportions based on well-known,
 * widely-published corpus frequency rankings — not an exact citation — used
 * only to gauge whether a document's function-word mix looks like a
 * generic/average English sample or an idiosyncratic one. Weighted lightly
 * in the overall score because of that approximation.
 */
const FUNCTION_WORD_REFERENCE: Record<string, number> = {
  the: 1000, of: 520, and: 410, a: 330, to: 370, in: 300, is: 145, was: 140,
  it: 145, for: 135, that: 155, on: 100, with: 100, as: 105, are: 90, be: 95,
  by: 90, this: 90, an: 70, or: 75, from: 65, at: 80, which: 55, but: 70,
  not: 90, have: 95, has: 55, had: 50, were: 50, their: 55, its: 40, his: 45,
  her: 40, they: 55, we: 55, you: 70, i: 60, he: 55, she: 35, been: 40,
  will: 45, would: 45, can: 40, could: 35, if: 45, so: 45, than: 30, then: 30,
  when: 35, what: 35, all: 45, also: 30, more: 35, one: 40, other: 30
};

const FUNCTION_WORD_TOTAL = Object.values(FUNCTION_WORD_REFERENCE).reduce((sum, value) => sum + value, 0);

/** 0 = function-word mix matches the generic reference profile closely; higher = more idiosyncratic. */
export function functionWordProfileDistance(words: string[]): number {
  if (!words.length) return 0;
  const counts = new Map<string, number>();
  for (const word of words) {
    if (FUNCTION_WORD_REFERENCE[word] !== undefined) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  let distance = 0;
  for (const [word, referenceWeight] of Object.entries(FUNCTION_WORD_REFERENCE)) {
    const observed = (counts.get(word) ?? 0) / words.length;
    const expected = referenceWeight / FUNCTION_WORD_TOTAL;
    distance += Math.abs(observed - expected);
  }
  return distance;
}

/** How often consecutive-or-not sentences start with the same two-word opener. Templated writing reuses openers; varied writing doesn't. */
export function sentenceOpenerRepetition(openers: string[]): number {
  const cleaned = openers.filter(Boolean);
  if (cleaned.length < 3) return 0;
  const counts = new Map<string, number>();
  cleaned.forEach((opener) => counts.set(opener, (counts.get(opener) ?? 0) + 1));
  const repeated = [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
  return repeated / cleaned.length;
}
