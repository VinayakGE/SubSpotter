import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));

// ANTHROPIC_API_KEY must only ever live here, server-side. Never sent to the client.
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set. Copy server/.env.example to server/.env and add your key.');
  }
  return new Anthropic({ apiKey });
}

const EXTRACT_SYSTEM_PROMPT = `You are a financial data extractor. Your job is to identify recurring subscription charges from bank statement text or images.

Return ONLY a valid JSON array — no prose, no markdown code fences, no explanation. The array must contain objects with exactly these fields:
- merchant: string (clean merchant name, e.g. "Netflix", "Spotify")
- amountCents: number (amount in cents as integer, e.g. 1499 for $14.99)
- currency: string (3-letter ISO code, e.g. "USD")
- cadence: "monthly" | "annual" | "unknown"
- sourceLine: string (the exact line from the statement that this charge came from)
- confidence: number (0.0 to 1.0, how confident you are this is a subscription)

Rules:
- Only include recurring subscriptions (streaming, SaaS, gym memberships, etc.)
- Skip one-time purchases, grocery stores, restaurants, gas stations
- If an amount looks annual (e.g. a single $144 charge for a known monthly service), set cadence to "annual"
- sourceLine must be the verbatim text from the statement
- If you see no subscriptions, return an empty array []

Example output:
[{"merchant":"Netflix","amountCents":1549,"currency":"USD","cadence":"monthly","sourceLine":"05/01/2025  NETFLIX.COM  -$15.49","confidence":0.99}]`;

interface ExtractRequestBody {
  imageBase64?: string;
  text?: string;
}

interface RawExtractedCharge {
  merchant: string;
  amountCents: number;
  currency: string;
  cadence: string;
  sourceLine: string;
  confidence: number;
}

app.post('/api/extract', async (req: Request<object, object, ExtractRequestBody>, res: Response) => {
  const { imageBase64, text } = req.body;

  if (!imageBase64 && !text) {
    res.status(400).json({ error: 'missing_input', message: 'Provide imageBase64 or text' });
    return;
  }

  let client: Anthropic;
  try {
    client = getClient();
  } catch (err) {
    console.error('API key error:', err);
    res.status(500).json({ error: 'no_api_key', message: (err as Error).message });
    return;
  }

  try {
    let messageContent: Anthropic.MessageParam['content'];

    if (imageBase64) {
      // Detect media type from base64 prefix or default to jpeg
      let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg';
      if (imageBase64.startsWith('data:image/png')) mediaType = 'image/png';
      else if (imageBase64.startsWith('data:image/gif')) mediaType = 'image/gif';
      else if (imageBase64.startsWith('data:image/webp')) mediaType = 'image/webp';

      // Strip data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

      messageContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data,
          },
        },
        {
          type: 'text',
          text: 'Extract all subscription charges from this bank statement image. Return only a JSON array as described.',
        },
      ];
    } else {
      messageContent = [
        {
          type: 'text',
          text: `Extract all subscription charges from this bank statement text:\n\n${text}\n\nReturn only a JSON array as described.`,
        },
      ];
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: EXTRACT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: messageContent }],
    });

    const rawText = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse defensively
    let charges: RawExtractedCharge[];
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }
      // Validate and coerce each item
      charges = parsed.map((item: unknown) => {
        const obj = item as Record<string, unknown>;
        return {
          merchant: String(obj.merchant || ''),
          amountCents: Math.round(Number(obj.amountCents) || 0),
          currency: String(obj.currency || 'USD'),
          cadence: ['monthly', 'annual', 'unknown'].includes(String(obj.cadence)) ? String(obj.cadence) : 'unknown',
          sourceLine: String(obj.sourceLine || ''),
          confidence: Math.min(1, Math.max(0, Number(obj.confidence) || 0)),
        } as RawExtractedCharge;
      });
    } catch (parseErr) {
      console.error('Parse failed. Raw response:', rawText);
      console.error('Parse error:', parseErr);
      res.status(200).json({ error: 'parse_failed' });
      return;
    }

    res.json({ charges });
  } catch (err) {
    console.error('Anthropic API error:', err);
    res.status(500).json({ error: 'api_error', message: (err as Error).message });
  }
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SubSpotter server running on http://localhost:${PORT}`);
});
