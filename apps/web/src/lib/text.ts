export function sanitizeText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitSentences(text: string): string[] {
  return sanitizeText(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
}

export function tokenize(text: string): string[] {
  return sanitizeText(text).toLowerCase().match(/[a-z0-9']+/g) ?? [];
}

export function chunkText(text: string, size = 220): string[] {
  const sentences = splitSentences(text);
  const chunks: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const next = `${buffer} ${sentence}`.trim();
    if (next.length > size && buffer) {
      chunks.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks;
}

export function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, "");
  if (cleaned.length <= 3) {
    return 1;
  }

  let syllables = cleaned.match(/[aeiouy]+/g)?.length ?? 1;

  if (cleaned.endsWith("e") && !cleaned.endsWith("le") && syllables > 1) {
    syllables -= 1;
  }

  if (/(?:tion|sion|ious|cial|tial)$/.test(cleaned)) {
    syllables += 1;
  }

  if (/(?:ed|es)$/.test(cleaned) && !/(?:ted|ded|ses|xes|zes)$/.test(cleaned) && syllables > 1) {
    syllables -= 1;
  }

  return Math.max(1, syllables);
}

export function computeReadability(text: string): number {
  const sentences = splitSentences(text);
  const words = tokenize(text);

  if (!sentences.length || !words.length) {
    return 100;
  }

  const sentenceCount = sentences.length;
  const wordCount = words.length;
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const flesch = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
  const averageSentenceLength = wordCount / sentenceCount;
  const complexWordRatio = words.filter((word) => countSyllables(word) >= 3).length / wordCount;
  const score = 50 + flesch * 0.45 - Math.max(0, averageSentenceLength - 18) * 1.2 - complexWordRatio * 18;
  return Math.max(0, Math.min(100, Number(score.toFixed(2))));
}

export function splitParagraphs(text: string): string[] {
  return sanitizeText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function wordNgrams(words: string[], size: number): string[] {
  if (size <= 0 || words.length < size) {
    return [];
  }

  const grams: string[] = [];
  for (let index = 0; index <= words.length - size; index += 1) {
    grams.push(words.slice(index, index + size).join(" "));
  }
  return grams;
}

export function coefficientOfVariation(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean === 0) {
    return 0;
  }

  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

export function uniqueRatio(words: string[]): number {
  if (!words.length) {
    return 0;
  }

  return new Set(words).size / words.length;
}

export function jaccardNgrams(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((token) => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
}

export function jaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  const intersection = [...tokensA].filter((token) => tokensB.has(token)).length;
  const union = new Set([...tokensA, ...tokensB]).size || 1;
  return intersection / union;
}

export interface TokenSpan {
  word: string;
  start: number;
  end: number;
}

/** Like tokenize(), but keeps each word's character offset in the (sanitized) text so matches can be highlighted. */
export function tokenizeWithOffsets(text: string): TokenSpan[] {
  const sanitized = sanitizeText(text);
  const spans: TokenSpan[] = [];
  const regex = /[a-zA-Z0-9']+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(sanitized)) !== null) {
    spans.push({ word: match[0].toLowerCase(), start: match.index, end: match.index + match[0].length });
  }
  return spans;
}

/**
 * Mean Segmental Type-Token Ratio: lexical variety measured over fixed-size
 * windows and averaged, instead of over the whole document. Raw type-token
 * ratio (uniqueRatio) drops mechanically as documents get longer — function
 * words like "the" and "and" must repeat — so it penalizes long human essays
 * for the same reason it "detects" repetitive AI text. Windowing removes
 * most of that length bias.
 */
export function meanSegmentalTypeTokenRatio(words: string[], windowSize = 50): number {
  if (!words.length) {
    return 0;
  }
  if (words.length <= windowSize) {
    return uniqueRatio(words);
  }

  const ratios: number[] = [];
  for (let index = 0; index < words.length; index += windowSize) {
    const window = words.slice(index, index + windowSize);
    if (window.length >= Math.min(20, windowSize)) {
      ratios.push(uniqueRatio(window));
    }
  }
  return ratios.length ? ratios.reduce((sum, value) => sum + value, 0) / ratios.length : uniqueRatio(words);
}

export interface SpanMatch {
  start: number;
  end: number;
  count: number;
}

function mergeSpans(spans: SpanMatch[]): SpanMatch[] {
  if (!spans.length) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: SpanMatch[] = [sorted[0]];
  for (const span of sorted.slice(1)) {
    const last = merged[merged.length - 1];
    if (span.start <= last.end) {
      last.end = Math.max(last.end, span.end);
      last.count = Math.max(last.count, span.count);
    } else {
      merged.push({ ...span });
    }
  }
  return merged;
}

/** Finds word n-gram spans in `text` that repeat at least `minRepeats` times, with real character offsets. */
export function findRepeatedSpans(text: string, size: number, minRepeats = 2): SpanMatch[] {
  const tokens = tokenizeWithOffsets(text);
  if (tokens.length < size) return [];

  const counts = new Map<string, number>();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    const gram = tokens
      .slice(index, index + size)
      .map((token) => token.word)
      .join(" ");
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }

  const spans: SpanMatch[] = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    const slice = tokens.slice(index, index + size);
    const gram = slice.map((token) => token.word).join(" ");
    const count = counts.get(gram) ?? 0;
    if (count >= minRepeats) {
      spans.push({ start: slice[0].start, end: slice[slice.length - 1].end, count });
    }
  }

  return mergeSpans(spans);
}

/** Finds word n-gram spans in `text` that also occur anywhere in `otherText`, with real character offsets into `text`. */
export function findOverlapSpans(text: string, otherText: string, size: number): SpanMatch[] {
  const tokens = tokenizeWithOffsets(text);
  const otherWords = tokenize(otherText);
  if (tokens.length < size || otherWords.length < size) return [];

  const otherGrams = new Set(wordNgrams(otherWords, size));
  const spans: SpanMatch[] = [];
  for (let index = 0; index <= tokens.length - size; index += 1) {
    const slice = tokens.slice(index, index + size);
    const gram = slice.map((token) => token.word).join(" ");
    if (otherGrams.has(gram)) {
      spans.push({ start: slice[0].start, end: slice[slice.length - 1].end, count: 2 });
    }
  }

  return mergeSpans(spans);
}
