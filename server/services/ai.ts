import Anthropic from "@anthropic-ai/sdk";

// Using Replit's AI Integrations service, which provides Anthropic-compatible API access
// without requiring your own Anthropic API key. Charges are billed to your Replit credits.
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

export interface KnowledgeExtraction {
  isKnowledge: boolean;
  confidence: number;
  knowledgeType: "policy" | "sop" | "decision" | "fact" | "process" | "engineering" | "product" | null;
  title: string;
  content: string;
  reasoning: string;
}

export interface MessageContext {
  channelName?: string;
  userName?: string;
  userTitle?: string;
  threadContext?: string[];
}

export interface KnowledgeValidation {
  isValid: boolean;
  confidence: number;
  reasoning: string;
}

export async function extractKnowledge(text: string, source: string, context?: MessageContext): Promise<KnowledgeExtraction> {
  let contextInfo = "";
  
  if (context) {
    const parts = [];
    if (context.channelName) {
      parts.push(`Channel: #${context.channelName}`);
    }
    if (context.userName) {
      let userInfo = `Author: ${context.userName}`;
      if (context.userTitle) {
        userInfo += ` (${context.userTitle})`;
      }
      parts.push(userInfo);
    }
    if (context.threadContext && context.threadContext.length > 0) {
      parts.push(`Thread context (previous messages):\n${context.threadContext.map((m, i) => `  ${i + 1}. "${m}"`).join("\n")}`);
    }
    if (parts.length > 0) {
      contextInfo = `\nContext:\n${parts.join("\n")}\n`;
    }
  }

  const prompt = `You are a knowledge extraction system for a company's internal knowledge base. Analyze the following text from ${source} and determine if it contains actionable knowledge that should be documented.
${contextInfo}
Text to analyze:
"""
${text}
"""

IMPORTANT GUIDELINES:
- Look for DECISIONS, ANNOUNCEMENTS, POLICY CHANGES, TECHNICAL SPECIFICATIONS, or PROCESS UPDATES
- Consider the author's role/title - engineers announcing tech changes, managers announcing policy changes
- Consider the channel context - #engineering, #announcements, #product are higher signal
- IGNORE: casual conversation, questions, opinions, complaints, jokes, social messages
- If it's a thread reply, consider the full thread context to understand if this is a conclusion/decision

Determine:
1. Does this contain new, actionable knowledge? (not just opinions, questions, or casual conversation)
2. What type of knowledge is it? (policy, sop, decision, fact, process, engineering, product)
3. What would be a clear, professional title for this knowledge?
4. What is the core content that should be documented? (Write it as clean documentation, not as a quote)
5. How confident are you? (0-100) - Be conservative, only high confidence for clear announcements/decisions

Respond in JSON format:
{
  "isKnowledge": boolean,
  "confidence": number (0-100),
  "knowledgeType": string or null,
  "title": string,
  "content": string,
  "reasoning": string
}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to parse AI response:", content.text);
    throw error;
  }
}

export async function validateKnowledge(
  extraction: KnowledgeExtraction,
  originalText: string
): Promise<KnowledgeValidation> {
  const prompt = `You are a knowledge validation system using Claude Opus. A previous AI model (Claude Sonnet) extracted the following knowledge. Your job is to independently verify it is accurate and appropriate for a knowledge base.

Original text:
"""
${originalText}
"""

Extracted knowledge:
- Type: ${extraction.knowledgeType}
- Title: ${extraction.title}
- Content: ${extraction.content}

Critically verify:
1. Is this truly new knowledge (not opinion, speculation, or questions)?
2. Is it actionable and useful for documentation?
3. Does it accurately represent what was said?
4. Should it be added to a knowledge base?
5. Are there any concerns or red flags?
6. How confident are you? (0-100)

IMPORTANT: Be thorough and skeptical. Only approve if you are highly confident this is legitimate, actionable knowledge.

Respond in JSON format:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "reasoning": string
}`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-1",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  try {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to parse AI response:", content.text);
    throw error;
  }
}

export async function processTextForKnowledge(
  text: string,
  source: string,
  context?: MessageContext
): Promise<KnowledgeExtraction | null> {
  const extraction = await extractKnowledge(text, source, context);
  
  if (!extraction.isKnowledge || extraction.confidence < 70) {
    return null;
  }

  const validation = await validateKnowledge(extraction, text);
  
  if (!validation.isValid || validation.confidence < 70) {
    return null;
  }

  const combinedConfidence = Math.round((extraction.confidence + validation.confidence) / 2);
  
  return {
    ...extraction,
    confidence: combinedConfidence,
    reasoning: `Extraction: ${extraction.reasoning}\n\nValidation: ${validation.reasoning}`,
  };
}
