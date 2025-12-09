import crypto from "crypto";
import { storage } from "../storage";
import type { Suggestion } from "@shared/schema";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingSuggestionId?: string;
  similarity?: number;
  fingerprint: string;
}

export interface ContentFingerprint {
  fingerprint: string;
  titleHash: string;
  contentHash: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function extractKeyPhrases(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(" ").filter(w => w.length > 3);
  
  const stopWords = new Set([
    "the", "and", "for", "that", "this", "with", "from", "have", "been",
    "will", "would", "could", "should", "what", "when", "where", "which",
    "their", "there", "about", "into", "more", "some", "than", "them",
    "then", "these", "they", "were", "your"
  ]);
  
  return words.filter(w => !stopWords.has(w));
}

export function generateContentFingerprint(title: string, content: string): ContentFingerprint {
  const normalizedTitle = normalizeText(title);
  const normalizedContent = normalizeText(content);
  
  const titleHash = crypto
    .createHash("sha256")
    .update(normalizedTitle)
    .digest("hex")
    .substring(0, 16);
  
  const contentHash = crypto
    .createHash("sha256")
    .update(normalizedContent)
    .digest("hex")
    .substring(0, 16);
  
  const keyPhrases = extractKeyPhrases(content).slice(0, 20).join(" ");
  const keyPhrasesHash = crypto
    .createHash("sha256")
    .update(keyPhrases)
    .digest("hex")
    .substring(0, 16);
  
  const fingerprint = `${titleHash}:${keyPhrasesHash}:${contentHash.substring(0, 16)}`;
  
  return {
    fingerprint,
    titleHash,
    contentHash,
  };
}

function calculateSimilarity(text1: string, text2: string): number {
  const phrases1 = extractKeyPhrases(text1);
  const phrases2 = extractKeyPhrases(text2);
  const set1 = new Set(phrases1);
  const set2 = new Set(phrases2);
  
  if (set1.size === 0 || set2.size === 0) return 0;
  
  let intersectionSize = 0;
  set1.forEach(phrase => {
    if (set2.has(phrase)) intersectionSize++;
  });
  
  const unionSize = set1.size + set2.size - intersectionSize;
  if (unionSize === 0) return 0;
  
  const jaccardIndex = intersectionSize / unionSize;
  return Math.round(jaccardIndex * 100);
}

export async function checkForDuplicates(
  teamId: string,
  title: string,
  content: string,
  options: {
    includeRejected?: boolean;
    similarityThreshold?: number;
  } = {}
): Promise<DuplicateCheckResult> {
  const {
    includeRejected = false,
    similarityThreshold = 70,
  } = options;

  const fingerprint = generateContentFingerprint(title, content);
  
  const allSuggestions = await storage.getSuggestions(teamId);
  
  const recentSuggestions = allSuggestions.filter(s => {
    if (!includeRejected && s.status === "rejected") return false;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return new Date(s.createdAt) > thirtyDaysAgo;
  });
  
  const exactMatch = recentSuggestions.find(
    (s: Suggestion) => s.contentFingerprint === fingerprint.fingerprint
  );
  
  if (exactMatch) {
    return {
      isDuplicate: true,
      existingSuggestionId: exactMatch.id,
      similarity: 100,
      fingerprint: fingerprint.fingerprint,
    };
  }
  
  for (const suggestion of recentSuggestions) {
    const titleSimilarity = calculateSimilarity(title, suggestion.title);
    const contentSimilarity = calculateSimilarity(content, suggestion.proposedContent);
    
    const combinedSimilarity = Math.max(
      titleSimilarity * 0.4 + contentSimilarity * 0.6,
      titleSimilarity > 90 ? titleSimilarity : 0,
      contentSimilarity > 90 ? contentSimilarity : 0
    );
    
    if (combinedSimilarity >= similarityThreshold) {
      return {
        isDuplicate: true,
        existingSuggestionId: suggestion.id,
        similarity: Math.round(combinedSimilarity),
        fingerprint: fingerprint.fingerprint,
      };
    }
  }
  
  return {
    isDuplicate: false,
    fingerprint: fingerprint.fingerprint,
  };
}

export function getFingerprint(title: string, content: string): string {
  return generateContentFingerprint(title, content).fingerprint;
}
