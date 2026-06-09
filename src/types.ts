// NOTE: 'bank_link' is intentionally excluded — SubSpotter never connects to banks directly.
export type SubscriptionSource = 'manual' | 'screenshot' | 'email_forward';

export type Cadence = 'monthly' | 'annual' | 'unknown';

export type UsageTag = 'daily' | 'weekly' | 'rarely' | 'never' | undefined;

export type Entitlement = 'free' | 'unlocked' | 'watchdog';

/**
 * A charge extracted from a bank statement by AI.
 * sourceLine is REQUIRED — it ties the amount back to the raw statement text.
 */
export interface ExtractedCharge {
  id: string;
  merchant: string;
  amountCents: number;
  currency: string;
  cadence: Cadence;
  sourceLine: string; // REQUIRED - ties amount to source
  confidence: number; // 0-1
}

/**
 * A confirmed subscription in the user's store.
 * sourceLine is REQUIRED — never display an amount without it.
 */
export interface Subscription {
  id: string;
  merchant: string;
  amountCents: number;
  currency: string;
  cadence: Cadence;
  sourceLine: string; // REQUIRED — never render amount without this
  source: SubscriptionSource;
  usageTag?: UsageTag;
  confirmedAt: string; // ISO timestamp
  isAITool: boolean;
}

/** Raw response shape from the server /api/extract endpoint */
export interface ExtractResponse {
  charges?: RawExtractedCharge[];
  error?: string;
}

/** Shape returned by Anthropic (before we add id) */
export interface RawExtractedCharge {
  merchant: string;
  amountCents: number;
  currency: string;
  cadence: Cadence;
  sourceLine: string;
  confidence: number;
}

/** Monthly cost in cents, normalized from cadence */
export function monthlyAmountCents(sub: Subscription): number {
  if (sub.cadence === 'annual') {
    return Math.round(sub.amountCents / 12);
  }
  return sub.amountCents;
}

/** Uses per month for a given usage tag */
export function usesPerMonth(tag: UsageTag): number {
  switch (tag) {
    case 'daily': return 30;
    case 'weekly': return 4;
    case 'rarely': return 1;
    case 'never': return 0.01;
    default: return 1;
  }
}

/** Cost-per-use in cents */
export function costPerUseCents(sub: Subscription): number {
  const monthly = monthlyAmountCents(sub);
  const uses = usesPerMonth(sub.usageTag);
  return monthly / uses;
}

/** True if this subscription should be flagged as a zombie */
export function isZombie(sub: Subscription): boolean {
  const isRarely = sub.usageTag === 'rarely' || sub.usageTag === 'never';
  return isRarely && monthlyAmountCents(sub) > 500; // > $5/month
}

const AI_TOOL_KEYWORDS = [
  'chatgpt', 'openai', 'claude', 'anthropic', 'gemini', 'midjourney',
  'perplexity', 'copilot', 'cursor', 'jasper', 'copy.ai', 'copyai',
  'runway', 'elevenlabs', 'notion ai', 'otter.ai', 'character.ai',
  'inflection', 'cohere', 'together.ai', 'replicate'
];

/** Detect if a merchant name belongs to an AI tool */
export function detectIsAITool(merchant: string): boolean {
  const lower = merchant.toLowerCase();
  return AI_TOOL_KEYWORDS.some(kw => lower.includes(kw));
}
