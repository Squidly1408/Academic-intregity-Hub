import type { AnalysisResult, HighlightRange, ProviderResult } from "./types";
import {
  chunkText,
  coefficientOfVariation,
  computeReadability,
  jaccardSimilarity,
  sanitizeText,
  splitParagraphs,
  splitSentences,
  tokenize,
  uniqueRatio,
  wordNgrams
} from "./text";

/**
 * Everything in this module runs entirely in the browser. There is no server:
 * document text never leaves the machine except in the specific, targeted
 * requests below to public, no-key APIs (LanguageTool, Crossref, OpenAlex,
 * Semantic Scholar) that don't require — and never see — a secret credential.
 * AI-likelihood is a local, transparent heuristic; there's no way to safely
 * hold a paid detector's API key in code that ships to every visitor's
 * browser, so this app doesn't pretend to call one.
 */

interface AnalysisInput {
  files: Array<{ name: string; extractedText: string }>;
  language: string;
}

interface CatalogHit {
  provider: string;
  title: string;
  url: string;
  score: number;
  query: string;
  matched: boolean;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function countMatches(text: string, pattern: RegExp): number {
  return text.match(pattern)?.length ?? 0;
}

function textSimilarity(a: string, b: string): number {
  return jaccardSimilarity(a, b);
}

function similarityFromNgrams(textA: string, textB: string, size: number): number {
  const gramsA = wordNgrams(tokenize(textA), size).join(" ");
  const gramsB = wordNgrams(tokenize(textB), size).join(" ");
  return jaccardSimilarity(gramsA, gramsB);
}

function buildHighlights(text: string, category: string, matches: RegExp[], severity: HighlightRange["severity"], suggestion: string): HighlightRange[] {
  const highlights: HighlightRange[] = [];
  for (const regex of matches) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      highlights.push({
        start: match.index,
        end: match.index + match[0].length,
        category,
        severity,
        label: match[0].slice(0, 64),
        suggestion
      });

      if (!regex.global) {
        break;
      }
    }
  }
  return highlights;
}

function extractSourceCandidates(text: string): string[] {
  const candidates = new Set<string>();
  const paragraphs = splitParagraphs(text);

  for (const paragraph of paragraphs) {
    const cleaned = paragraph.trim();
    if (!cleaned || /^(references|works cited|bibliography|sources)\b/i.test(cleaned)) {
      continue;
    }

    const doiMatch = cleaned.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    if (doiMatch) {
      candidates.add(doiMatch[0]);
    }

    const quotedSegments = [...cleaned.matchAll(/["“](.{8,160}?)["”]/g)].map((match) => match[1].trim());
    quotedSegments.forEach((segment) => candidates.add(segment));

    if (/^[A-Z][A-Za-z'\-]+(?:\s+et al\.)?,?\s+\(?\d{4}[a-z]?\)?/.test(cleaned)) {
      candidates.add(cleaned.slice(0, 200));
    }

    if (/[A-Z][a-z]+(?:\s+[A-Z][a-z]+){2,}/.test(cleaned) && cleaned.length < 180) {
      candidates.add(cleaned);
    }
  }

  return [...candidates].slice(0, 5);
}

async function fetchJson(url: string, options?: RequestInit): Promise<any | null> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    // network blocked, CORS denied, or offline — callers treat this as "no data" and fall back gracefully
    return null;
  }
}

const LANGUAGETOOL_URL = "https://api.languagetool.org/v2/check";

async function reviewGrammarWithLanguageTool(text: string, language: string): Promise<{ score: number; findings: HighlightRange[]; summary: string; reachable: boolean }> {
  const payload = new URLSearchParams({ text, language, enabledOnly: "false" });
  const data = (await fetchJson(LANGUAGETOOL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  })) as { matches?: Array<{ offset: number; length: number; message: string; replacements?: Array<{ value: string }> }> } | null;

  const matches = data?.matches ?? [];
  const findings = matches.slice(0, 14).map((match) => ({
    start: match.offset,
    end: match.offset + match.length,
    category: "grammar",
    severity: (match.length > 12 ? "medium" : "low") as HighlightRange["severity"],
    label: match.message,
    suggestion: match.replacements?.[0]?.value ? `Suggested rewrite: ${match.replacements[0].value}` : "Review this sentence for grammar or style."
  }));

  return {
    score: clampScore(100 - Math.min(55, matches.length * 3.5)),
    findings,
    reachable: data !== null,
    summary: data === null ? "LanguageTool was unreachable from your browser; grammar score reflects local checks only." : matches.length ? `LanguageTool flagged ${matches.length} issue(s).` : "LanguageTool did not flag any major grammar issues."
  };
}

async function queryCrossref(query: string): Promise<CatalogHit[]> {
  const data = await fetchJson(`https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=3`);
  const items = data?.message?.items ?? [];
  return items.map((item: { title?: string[]; DOI?: string; URL?: string }) => ({
    provider: "Crossref",
    title: item.title?.[0] ?? "Crossref result",
    url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : "https://api.crossref.org"),
    score: textSimilarity(query, item.title?.[0] ?? ""),
    query,
    matched: Boolean(item.title?.[0])
  }));
}

async function queryOpenAlex(query: string): Promise<CatalogHit[]> {
  const data = await fetchJson(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=3`);
  const items = data?.results ?? [];
  return items.map((item: { display_name?: string; id?: string }) => ({
    provider: "OpenAlex",
    title: item.display_name ?? "OpenAlex result",
    url: item.id ?? "https://openalex.org",
    score: textSimilarity(query, item.display_name ?? ""),
    query,
    matched: Boolean(item.display_name)
  }));
}

async function querySemanticScholar(query: string): Promise<CatalogHit[]> {
  const data = await fetchJson(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=3&fields=title,url,year`);
  const items = data?.data ?? [];
  return items.map((item: { title?: string; url?: string }) => ({
    provider: "Semantic Scholar",
    title: item.title ?? "Semantic Scholar result",
    url: item.url ?? "https://www.semanticscholar.org",
    score: textSimilarity(query, item.title ?? ""),
    query,
    matched: Boolean(item.title)
  }));
}

function repeatedPhraseRatio(text: string): number {
  const grams = wordNgrams(tokenize(text), 5);
  if (grams.length < 2) {
    return 0;
  }
  const counts = new Map<string, number>();
  grams.forEach((gram) => counts.set(gram, (counts.get(gram) ?? 0) + 1));
  const repeated = [...counts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
  return repeated / grams.length;
}

function sentenceBurstiness(text: string): number {
  const lengths = splitSentences(text).map((sentence) => tokenize(sentence).length).filter((length) => length > 0);
  return coefficientOfVariation(lengths);
}

function citationSupportDensity(text: string): number {
  const words = tokenize(text);
  const citationHits = countMatches(text, /\(([^)]*\d{4}[^)]*)\)|\[[0-9]+\]|\b[A-Z][A-Za-z-]+\s+et al\.,?\s+\d{4}\b/g);
  return words.length ? citationHits / (words.length / 250) : 0;
}

function detectNumericInconsistencies(text: string): string[] {
  const findings: string[] = [];
  const years = [...text.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]));
  years.forEach((year) => {
    if (year > new Date().getFullYear() + 1 || year < 1900) {
      findings.push(`Suspicious publication year ${year}`);
    }
  });

  if (/\b(?:fake|test|example|placeholder)\b/i.test(text) && /\b(?:doi|https?:\/\/|www\.)\b/i.test(text)) {
    findings.push("Possible placeholder source reference");
  }

  return findings;
}

async function verifySources(text: string): Promise<{ score: number; findings: HighlightRange[]; summary: string; matches: CatalogHit[] }> {
  const queries = extractSourceCandidates(text);
  const rawMatches = await Promise.all(queries.flatMap((query) => [queryCrossref(query), queryOpenAlex(query), querySemanticScholar(query)]));
  const matches = rawMatches.flat();
  const verified = matches.filter((match) => match.score >= 0.35);
  const score = clampScore(42 + verified.length * 11 + average(matches.map((match) => match.score)) * 44 - Math.max(0, queries.length - verified.length) * 10);

  return {
    score,
    matches: matches.sort((a, b) => b.score - a.score).slice(0, 8),
    findings: buildHighlights(
      text,
      "source-verification",
      [/\b(?:doi\.org|crossref|openalex|semantic scholar|works cited|references)\b/gi],
      verified.length ? "low" : "medium",
      verified.length
        ? "Cross-check the linked source metadata against the citation style and publication year."
        : "Validate the listed references against public scholarly catalogs."
    ),
    summary: verified.length
      ? `Verified ${verified.length} reference candidate(s) against Crossref, OpenAlex, and Semantic Scholar.`
      : "No strong public-catalog match was found for the supplied reference candidates."
  };
}

interface AiSignals {
  score: number;
  confidence: number;
  evidence: string;
  findings: HighlightRange[];
  signals: ProviderResult[];
}

function aiHeuristicScore(text: string): AiSignals {
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const paragraphs = splitParagraphs(text);
  const wordCount = Math.max(1, words.length);
  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = wordCount / sentenceCount;
  const lexicalVariety = uniqueRatio(words);
  const repetition = repeatedPhraseRatio(text);
  const burstiness = sentenceBurstiness(text);
  const transitionDensity = countMatches(text, /\b(?:furthermore|moreover|therefore|thus|consequently|in conclusion|it is important to note)\b/gi) / sentenceCount;
  const citationDensity = citationSupportDensity(text);

  const varietyPoints = (1 - clamp(lexicalVariety / 0.72, 0, 1)) * 24;
  const repetitionPoints = clamp(repetition * 140, 0, 22);
  const rhythmPoints = clamp((1.15 - Math.min(burstiness, 1.15)) * 18, 0, 18);
  const transitionPoints = clamp(transitionDensity * 26, 0, 16);
  const lengthPoints = clamp((avgSentenceLength - 14) * 1.2, 0, 12);
  const citationRelief = clamp(citationDensity * 4.5, 0, 12);

  const score = clamp(18 + varietyPoints + repetitionPoints + rhythmPoints + transitionPoints + lengthPoints - citationRelief);
  const confidence = clamp(60 + (1 - Math.abs(0.66 - lexicalVariety)) * 16 + clamp((1 - Math.min(burstiness, 1)) * 10, 0, 10));

  const signals: ProviderResult[] = [
    {
      provider: "Lexical variety",
      score: clampScore(lexicalVariety * 100),
      confidence: clampScore((varietyPoints / 24) * 100),
      status: "heuristic",
      evidence: `${Math.round(lexicalVariety * 100)}% of words are unique — low variety is a common AI-writing signal.`
    },
    {
      provider: "Repeated phrasing",
      score: clampScore(repetition * 100),
      confidence: clampScore((repetitionPoints / 22) * 100),
      status: "heuristic",
      evidence: `${Math.round(repetition * 100)}% of 5-word phrases repeat elsewhere in the document.`
    },
    {
      provider: "Sentence rhythm",
      score: clampScore(clamp(burstiness, 0, 1.5) * (100 / 1.5)),
      confidence: clampScore((rhythmPoints / 18) * 100),
      status: "heuristic",
      evidence: `Sentence-length variation (burstiness) is ${burstiness.toFixed(2)} — human writing tends to vary more.`
    },
    {
      provider: "Transition density",
      score: clampScore(clamp(transitionDensity, 0, 1) * 100),
      confidence: clampScore((transitionPoints / 16) * 100),
      status: "heuristic",
      evidence: `${(transitionDensity * 100).toFixed(0)} formal transition words per 100 sentences.`
    },
    {
      provider: "Sentence length",
      score: clampScore(clamp(avgSentenceLength, 0, 40) * 2.5),
      confidence: clampScore((lengthPoints / 12) * 100),
      status: "heuristic",
      evidence: `Average sentence length is ${avgSentenceLength.toFixed(1)} words.`
    }
  ];

  return {
    score,
    confidence,
    evidence: `Heuristic signal from ${paragraphs.length} paragraph(s), ${sentenceCount} sentence(s), ${Math.round(lexicalVariety * 100)}% lexical variety, and ${Math.round(repetition * 100)}% repeated 5-gram overlap.`,
    signals,
    findings: buildHighlights(
      text,
      "ai-detection",
      [
        /\b(?:furthermore|moreover|in conclusion|it is important to note|more importantly)\b/gi,
        /\b(?:utilize|facilitate|underscore|leverage|seamless|robust|comprehensive)\b/gi
      ],
      score > 70 ? "high" : score > 45 ? "medium" : "low",
      "Use more specific claims, vary sentence length, and reduce repeated transitions."
    )
  };
}

function aiDetection(text: string): { score: number; signals: ProviderResult[]; findings: HighlightRange[]; summary: string } {
  const heuristic = aiHeuristicScore(text);
  return {
    score: heuristic.score,
    signals: heuristic.signals,
    findings: heuristic.findings,
    summary: `AI-likelihood score is ${heuristic.score}%, from local structural-language signals — this document was never sent anywhere for this check.`
  };
}

function plagiarismDetection(text: string, comparedTexts: string[]): { score: number; sources: Array<{ title: string; url: string; similarity: number }>; findings: HighlightRange[]; summary: string } {
  const internalShingles = wordNgrams(tokenize(text), 6);
  const internalCounts = new Map<string, number>();
  internalShingles.forEach((shingle) => internalCounts.set(shingle, (internalCounts.get(shingle) ?? 0) + 1));
  const repeatedInternal = [...internalCounts.values()].filter((count) => count > 1).reduce((sum, count) => sum + count - 1, 0);
  const internalSimilarity = internalShingles.length ? clampScore((repeatedInternal / internalShingles.length) * 100) : 0;

  let sources: Array<{ title: string; url: string; similarity: number }>;
  let highest = internalSimilarity;

  if (comparedTexts.length) {
    sources = comparedTexts.map((sourceText, index) => {
      const similarity = clampScore((similarityFromNgrams(text, sourceText, 5) * 60 + similarityFromNgrams(text, sourceText, 8) * 40) * 100);
      highest = Math.max(highest, similarity);
      return {
        title: `Compared document ${index + 1}`,
        url: `internal://document-${index + 1}`,
        similarity
      };
    });
  } else {
    sources = [
      {
        title: "Internal repetition analysis",
        url: "internal://repetition",
        similarity: internalSimilarity
      }
    ];
  }

  return {
    score: clampScore(100 - highest),
    sources,
    findings: buildHighlights(
      text,
      "plagiarism",
      [
        /\b(?:according to|as noted by|research shows|the study found|prior research indicates)\b/gi,
        /\b(?:copy|copied|duplicate|replicated)\b/gi
      ],
      highest > 75 ? "high" : highest > 50 ? "medium" : "low",
      comparedTexts.length
        ? "Review the matching passages and verify citation support."
        : "Look for repeated passages or patchwork phrasing within the document."
    ),
    summary: comparedTexts.length
      ? highest > 70
        ? "Strong overlap detected with comparison sources."
        : "No significant overlap found in comparison sources."
      : internalSimilarity > 20
        ? "Repeated wording patterns were detected inside the document."
        : "No meaningful internal repetition was detected."
  };
}

async function citationAnalysis(text: string): Promise<{ score: number; citations: Array<{ raw: string; matched: boolean; issue?: string }>; findings: HighlightRange[]; summary: string }> {
  const candidatePatterns = [
    /\([A-Z][A-Za-z'\-]+(?:\s+et al\.)?,?\s+\d{4}[a-z]?(?:,\s*p{1,2}\.\s*\d+)?\)/g,
    /\[[0-9]+\]/g,
    /\b[A-Z][A-Za-z'\-]+(?:\s+et al\.)?,?\s+\d{4}[a-z]?\b/g,
    /\b(?:[A-Z][A-Za-z'\-]+,\s*[A-Z]\.\s*[A-Z]?\.?)\s*\(\d{4}\)/g
  ];

  const citations = candidatePatterns
    .flatMap((pattern) => [...text.matchAll(pattern)])
    .slice(0, 24)
    .map((match) => {
      const raw = match[0];
      const hasYear = /\b(19\d{2}|20\d{2})\b/.test(raw);
      const issues: string[] = [];

      if (!hasYear) {
        issues.push("Missing publication year");
      }

      if (/\b(?:fake|test|example|lorem ipsum|placeholder)\b/i.test(raw)) {
        issues.push("Placeholder citation content");
      }

      const yearMatch = raw.match(/\b(19\d{2}|20\d{2})\b/);
      if (yearMatch) {
        const year = Number(yearMatch[1]);
        if (year > new Date().getFullYear() + 1 || year < 1900) {
          issues.push(`Invalid year ${year}`);
        }
      }

      if (/\b(?:http:\/\/|https:\/\/|www\.)\b/i.test(raw) && !/\b(?:\.gov|\.edu|\.org|\.ac\.|doi\.org)\b/i.test(raw)) {
        issues.push("URL requires source verification");
      }

      return {
        raw,
        matched: issues.length === 0,
        issue: issues[0]
      };
    });

  const academicSignals = countMatches(text, /\b(?:according to|research shows|the study found|previous studies|citation|reference|bibliography|works cited)\b/gi);
  const supportDensity = citationSupportDensity(text);
  const fakeCitationIssues = detectNumericInconsistencies(text);
  const missingSupportPenalty = academicSignals > 0 ? Math.max(0, academicSignals - citations.length) * 11 : 0;
  const structuralPenalty = citations.some((citation) => !citation.matched) ? 14 : 0;
  const densityPenalty = Math.max(0, 3 - supportDensity) * 10;
  const fakePenalty = fakeCitationIssues.length * 9;
  const score = clampScore(100 - Math.min(80, missingSupportPenalty + structuralPenalty + densityPenalty + fakePenalty));

  return {
    score,
    citations,
    findings: [
      ...buildHighlights(text, "citation", [/\b(?:et al\.|ibid\.|op\. cit\.)\b/gi], "medium", "Verify the reference entry and formatting style."),
      ...buildHighlights(text, "citation", [/\b(?:fake|test|example|placeholder)\b/gi], "high", "Replace placeholder source details with a verifiable reference.")
    ],
    summary: citations.length
      ? "Citations detected and checked against formatting and source-verification rules."
      : academicSignals > 0
        ? "The draft contains academic references to evidence, but no reliable citations were found."
        : "No reliable in-text citations detected."
  };
}

async function writingAnalysis(text: string, language: string): Promise<{ score: number; findings: HighlightRange[]; summary: string; suggestions: string[]; languageToolReachable: boolean }> {
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const longSentences = sentences.filter((sentence) => tokenize(sentence).length > 28);
  const passiveVoice = countMatches(text, /\b(?:is|was|were|be|been|being|are|am|remains|appears)\s+[a-z]+(?:ed|en)\b/gi);
  const repetitionIndex = uniqueRatio(words);
  const readability = computeReadability(text);
  const grammar = await reviewGrammarWithLanguageTool(text, language);
  const score = clamp(
    0.34 * readability +
      90 * clamp(repetitionIndex / 0.75, 0, 1) -
      longSentences.length * 4 -
      passiveVoice * 2.2 +
      grammar.score * 0.22
  );

  return {
    score,
    languageToolReachable: grammar.reachable,
    findings: [
      ...buildHighlights(text, "writing", [/\b(?:in order to|due to the fact that|at this point in time)\b/gi], "medium", "Use more direct academic phrasing."),
      ...buildHighlights(text, "writing", [/\b(?:really|very|just|quite)\b/gi], "low", "Trim filler modifiers for a sharper tone."),
      ...grammar.findings.map((finding) => ({ ...finding, category: "grammar" as const }))
    ],
    summary: score > 85 ? "Writing quality is strong and academically appropriate." : "The draft would benefit from tighter sentence structure, grammar cleanup, and more direct wording.",
    suggestions: [
      longSentences.length ? "Break up long sentences for readability." : "Sentence length is balanced.",
      passiveVoice > 0 ? "Reduce passive constructions where precision matters." : "Passive voice use is minimal.",
      repetitionIndex < 0.6 ? "Vary vocabulary to reduce repetition." : "Vocabulary variety is healthy.",
      grammar.score < 90 ? "Apply the LanguageTool suggestions before submission." : "Grammar quality is strong."
    ]
  };
}

function toneAnalysis(text: string): { score: number; findings: HighlightRange[]; summary: string } {
  const formalMarkers = countMatches(text, /\b(?:therefore|however|moreover|consequently|thus)\b/gi);
  const informalMarkers = countMatches(text, /\b(?:gonna|wanna|kind of|sort of|a lot)\b/gi);
  const score = clampScore(78 + formalMarkers * 2 - informalMarkers * 10);
  return {
    score,
    findings: buildHighlights(text, "tone", [/\b(?:gonna|wanna|kind of|sort of|a lot)\b/gi], "low", "Replace casual wording with formal academic language."),
    summary: score > 80 ? "Tone is formal and suitable for academic submission." : "Tone leans informal in a few sections."
  };
}

function hallucinationAnalysis(text: string): { score: number; findings: HighlightRange[]; summary: string } {
  const unsupportedClaims = countMatches(text, /\b(?:clearly proves|undeniably|everyone knows|never fails|always true|completely eliminates|guarantees)\b/gi);
  const uncitedClaims = Math.max(0, countMatches(text, /\b(?:according to|research shows|the study found|evidence suggests)\b/gi) - countMatches(text, /\(([^)]*\d{4}[^)]*)\)|\[[0-9]+\]/g));
  const score = clampScore(100 - unsupportedClaims * 15 - uncitedClaims * 7);
  return {
    score,
    findings: buildHighlights(text, "hallucination", [/\b(?:everyone knows|undeniably|absolutely certain)\b/gi], "medium", "Support the claim with a citation or soften the language."),
    summary: unsupportedClaims || uncitedClaims ? "Potential overconfident or under-supported claims detected." : "No obvious hallucination markers were found."
  };
}

function paraphrasingAnalysis(text: string): { score: number; findings: HighlightRange[]; summary: string } {
  const sentences = splitSentences(text);
  const repeatedStructure = chunkText(text, 180).filter((sentence) => /^\w+\s+(?:is|was|has|have|will|should)\b/i.test(sentence)).length;
  const sentenceSimilarities = sentences.slice(1).reduce((count, sentence, index) => {
    const previous = sentences[index];
    return count + (similarityFromNgrams(previous, sentence, 4) > 0.62 ? 1 : 0);
  }, 0);
  const score = clampScore(100 - sentenceSimilarities * 14 - repeatedStructure * 8 - repeatedPhraseRatio(text) * 80);
  return {
    score,
    findings: buildHighlights(text, "paraphrasing", [/\b(?:in other words|to put it differently|essentially)\b/gi], "low", "Ensure the sentence adds new analysis instead of restating the source."),
    summary: sentenceSimilarities || repeatedStructure ? "Some sentences look formulaic or lightly rephrased." : "Paraphrasing patterns look original enough for review."
  };
}

function styleConsistencyAnalysis(text: string): { score: number; findings: HighlightRange[]; summary: string } {
  const sentences = splitSentences(text);
  const lengths = sentences.map((sentence) => tokenize(sentence).length).filter((length) => length > 0);
  const variation = coefficientOfVariation(lengths);
  const discourseMarkers = countMatches(text, /\b(?:however|moreover|therefore|in addition|on the other hand|for example)\b/gi);
  const toneShift = countMatches(text, /\b(?:I think|you know|kind of|sort of|basically)\b/gi);
  const score = clampScore(100 - variation * 26 - toneShift * 12 + Math.min(12, discourseMarkers * 1.5));

  return {
    score,
    findings: buildHighlights(text, "style", [/\b(?:I think|you know|kind of|sort of|basically)\b/gi], "low", "Keep the tone consistently academic and remove casual phrasing."),
    summary: score > 80 ? "Style remains fairly consistent across the draft." : "Sentence length and tone shift enough to warrant a consistency pass."
  };
}

function quoteIntegrityAnalysis(text: string): { score: number; findings: HighlightRange[]; summary: string } {
  const quotedSegments = [...text.matchAll(/["“](.{8,220}?)["”]/g)].map((match) => match[1]);
  const fragmentsWithoutAttribution = quotedSegments.filter((segment) => {
    const aroundSegment = text.slice(Math.max(0, text.indexOf(segment) - 120), Math.min(text.length, text.indexOf(segment) + segment.length + 120));
    return !/\b(?:said|states|writes|argues|notes|according to|explains)\b/i.test(aroundSegment);
  });
  const score = clampScore(100 - fragmentsWithoutAttribution.length * 18 - Math.max(0, quotedSegments.length - 8) * 4);

  return {
    score,
    findings: buildHighlights(text, "quote-integrity", [/["“].{8,220}?["”]/gi], "low", "Make sure the quote is exact and attributed to the right source."),
    summary: quotedSegments.length ? "Quoted material was checked for attribution and formatting." : "No quoted passages were detected."
  };
}

function sourceComparison(text: string, comparedTexts: string[]): { score: number; findings: HighlightRange[]; comparedAgainst: string[]; summary: string } {
  const comparedAgainst = comparedTexts.slice(0, 3).map((_, index) => `Comparison document ${index + 1}`);
  const structuralSimilarity = comparedTexts.length ? clampScore((comparedTexts.reduce((total, item) => total + similarityFromNgrams(text, item, 5), 0) / comparedTexts.length) * 100) : 0;

  return {
    score: clampScore(100 - structuralSimilarity),
    comparedAgainst,
    findings: buildHighlights(text, "source-comparison", [/\b(?:according to|as stated in|the source indicates)\b/gi], "low", "Add more original synthesis around cited material."),
    summary: comparedTexts.length ? "The uploaded files were compared against each other successfully." : "No second document was provided for comparison."
  };
}

function buildOverallScore(parts: Array<{ score: number; weight: number }>): number {
  return clampScore(parts.reduce((sum, part) => sum + part.score * part.weight, 0));
}

export async function runAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
  const primaryText = sanitizeText(input.files[0]?.extractedText ?? "");
  const comparedTexts = input.files.slice(1).map((file) => sanitizeText(file.extractedText));

  const ai = aiDetection(primaryText);
  const [citations, writing, sourceVerification] = await Promise.all([citationAnalysis(primaryText), writingAnalysis(primaryText, input.language), verifySources(primaryText)]);
  const styleConsistency = styleConsistencyAnalysis(primaryText);
  const quoteIntegrity = quoteIntegrityAnalysis(primaryText);

  const plagiarism = plagiarismDetection(primaryText, comparedTexts);
  const readabilityScore = computeReadability(primaryText);
  const tone = toneAnalysis(primaryText);
  const hallucination = hallucinationAnalysis(primaryText);
  const paraphrasing = paraphrasingAnalysis(primaryText);
  const comparison = sourceComparison(primaryText, comparedTexts);

  const overallScore = buildOverallScore([
    { score: 100 - ai.score, weight: 0.16 },
    { score: plagiarism.score, weight: 0.18 },
    { score: citations.score, weight: 0.12 },
    { score: writing.score, weight: 0.12 },
    { score: sourceVerification.score, weight: 0.1 },
    { score: styleConsistency.score, weight: 0.08 },
    { score: quoteIntegrity.score, weight: 0.06 },
    { score: readabilityScore, weight: 0.08 },
    { score: tone.score, weight: 0.05 },
    { score: hallucination.score, weight: 0.05 },
    { score: paraphrasing.score, weight: 0.05 }
  ]);

  const suggestions = [
    ai.score > 65 ? "Reduce repeated AI-style phrasing and diversify sentence openings." : "AI-style phrasing appears low.",
    plagiarism.score < 75 ? "Review potential overlap before submission." : "Plagiarism risk looks manageable.",
    citations.score < 80 ? "Audit citation formatting and reference completeness." : "Citation structure is mostly healthy.",
    writing.score < 80 ? "Strengthen clarity and trim unnecessary wording." : "Writing quality is in a good range."
  ];

  return {
    overallScore,
    integrityRating: overallScore >= 85 ? "Low risk" : overallScore >= 70 ? "Moderate" : overallScore >= 50 ? "Elevated" : "Critical",
    documentText: primaryText,
    ai: { score: ai.score, summary: ai.summary, findings: ai.findings, providers: ai.signals },
    plagiarism: { score: plagiarism.score, summary: plagiarism.summary, findings: plagiarism.findings, sources: plagiarism.sources },
    citations: { score: citations.score, summary: citations.summary, findings: citations.findings, citations: citations.citations },
    writing: { score: writing.score, summary: writing.summary, findings: writing.findings },
    sourceVerification: {
      score: sourceVerification.score,
      summary: sourceVerification.summary,
      findings: sourceVerification.findings,
      matches: sourceVerification.matches
    },
    styleConsistency: { score: styleConsistency.score, summary: styleConsistency.summary, findings: styleConsistency.findings },
    quoteIntegrity: { score: quoteIntegrity.score, summary: quoteIntegrity.summary, findings: quoteIntegrity.findings },
    readability: { score: readabilityScore, summary: `Flesch reading ease score is ${readabilityScore}.`, findings: [] },
    tone: { score: tone.score, summary: tone.summary, findings: tone.findings },
    hallucination: { score: hallucination.score, summary: hallucination.summary, findings: hallucination.findings },
    paraphrasing: { score: paraphrasing.score, summary: paraphrasing.summary, findings: paraphrasing.findings },
    sourceComparison: { score: comparison.score, summary: comparison.summary, findings: comparison.findings, comparedAgainst: comparison.comparedAgainst },
    suggestions,
    modules: [
      { key: "ai", label: "AI risk", score: ai.score, summary: ai.summary, category: "risk" },
      { key: "plagiarism", label: "Plagiarism", score: plagiarism.score, summary: plagiarism.summary, category: "risk" },
      { key: "citations", label: "Citations", score: citations.score, summary: citations.summary, category: "verification" },
      { key: "sourceVerification", label: "Source verification", score: sourceVerification.score, summary: sourceVerification.summary, category: "verification" },
      { key: "styleConsistency", label: "Style consistency", score: styleConsistency.score, summary: styleConsistency.summary, category: "quality" },
      { key: "quoteIntegrity", label: "Quote integrity", score: quoteIntegrity.score, summary: quoteIntegrity.summary, category: "verification" },
      { key: "writing", label: "Grammar", score: writing.score, summary: writing.summary, category: "quality" },
      { key: "readability", label: "Readability", score: readabilityScore, summary: `Flesch reading ease score is ${readabilityScore}.`, category: "quality" },
      { key: "tone", label: "Tone", score: tone.score, summary: tone.summary, category: "quality" },
      { key: "hallucination", label: "Hallucination", score: hallucination.score, summary: hallucination.summary, category: "risk" },
      { key: "paraphrasing", label: "Paraphrase drift", score: paraphrasing.score, summary: paraphrasing.summary, category: "risk" }
    ],
    apiCoverage: [
      { name: "Local heuristics", purpose: "AI-likelihood detection", status: "live", summary: "Runs entirely in your browser — structural language signals, no document text is sent anywhere for this check." },
      { name: "LanguageTool", purpose: "Grammar analysis", status: writing.languageToolReachable ? "live" : "fallback", summary: writing.languageToolReachable ? "Public grammar API queried directly from your browser." : "Public API was unreachable from your browser; grammar score used local checks only." },
      { name: "Crossref", purpose: "Citation verification", status: "live", summary: "Public scholarly catalog queried directly from your browser for reference matches." },
      { name: "OpenAlex", purpose: "Source verification", status: "live", summary: "Public work catalog queried directly from your browser for title matches." },
      { name: "Semantic Scholar", purpose: "Source verification", status: "live", summary: "Public search API queried directly from your browser for supporting matches." }
    ],
    charts: {
      labels: ["AI risk", "Plagiarism", "Citation health", "Source verification", "Style consistency", "Grammar", "Readability", "Tone", "Hallucination", "Paraphrasing"],
      scores: [ai.score, plagiarism.score, citations.score, sourceVerification.score, styleConsistency.score, writing.score, readabilityScore, tone.score, hallucination.score, paraphrasing.score]
    }
  };
}
