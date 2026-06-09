# SubSpotter — CLAUDE.md

## Project overview
SubSpotter is a privacy-first subscription auditor. Users paste bank statement screenshots or raw text; the app uses the Anthropic API to extract subscriptions, lets users edit the draft, then shows ranked costs, zombie flags, and cancel guides.

## Architecture
- **Frontend**: Vite + React + TypeScript + Tailwind CSS (port 5173)
- **Backend**: Express + TypeScript via tsx (port 3001)
- **State**: React state + localStorage via Store interface
- **API**: Anthropic Messages API (`@anthropic-ai/sdk`)

## Non-negotiable constraints (enforce in code)

1. **NO bank/Plaid linking** — `SubscriptionSource` never includes `'bank_link'`. The app only accepts pasted text or screenshots.
2. **Every displayed amount MUST have a sourceLine** — the `sourceLine` field ties each extracted charge back to the original statement line. Never render an amount without it.
3. **AI extraction is a DRAFT** — extracted data is shown in an editable draft state. Nothing is "confirmed" until the user explicitly clicks the Confirm button.
4. **Cancel guides = steps + deep link only** — the UI shows numbered steps and a link. The app never auto-cancels. The user takes the final action.
5. **ANTHROPIC_API_KEY only in server/.env** — the key must never appear in the client bundle. The server proxies all Anthropic API calls.
6. **Parse errors show friendly fallback** — if Anthropic returns unparseable JSON, show a user-friendly message ("couldn't read that cleanly — paste as text?"). Never crash.

## File structure
```
/
├── src/                  # React frontend
│   ├── types.ts          # All shared types
│   ├── store.ts          # localStorage-backed store
│   ├── entitlements.ts   # Entitlement state (free/unlocked/watchdog)
│   ├── cancelGuides.ts   # Hardcoded cancel guides for major services
│   ├── components/       # React components
│   └── main.tsx          # Entry point
├── server/
│   ├── index.ts          # Express server
│   └── .env              # ANTHROPIC_API_KEY (never commit)
├── fixtures/
│   ├── sample1.txt       # Fake bank statement for testing
│   └── sample2.txt       # Another fake bank statement
├── CLAUDE.md             # This file
├── SELF_TEST.md          # Manual verification checklist
└── package.json
```

## Development
```bash
# Install dependencies
npm install

# Run dev (client + server concurrently)
npm run dev

# Type-check only
npm run typecheck

# Build for production
npm run build
```

## Environment variables
Copy `server/.env.example` to `server/.env` and fill in:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Entitlement tiers
- **free**: One scan only; sees ranked list + total "wasted" estimate
- **unlocked**: Unlimited scans; full cancel guides; CSV export
- **watchdog**: All of unlocked + saved subs panel with renewal/price-hike/trial alert stubs

## Stripe seam
There is a clearly-marked `// TODO: wire Stripe Checkout here` comment in `src/entitlements.ts`. Do not implement actual Stripe without explicit instruction.

## AI tool grouping
AI tools to group under "AI Stack": ChatGPT, Claude, Gemini, Midjourney, Perplexity, GitHub Copilot, Cursor, Jasper, Copy.ai, Runway, ElevenLabs, Notion AI.

## Cost-per-use formula
```
monthly_cost / uses_per_month
```
where `uses_per_month` = daily→30, weekly→4, rarely→1, never→0.01

## Zombie flag rule
`usageTag` is `'rarely'` or `'never'` AND monthly cost > $5 (500 cents)
