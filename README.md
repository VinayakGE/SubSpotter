# SubSpotter

**Privacy-first subscription auditor** — paste your bank statement, let AI find subscriptions, review the draft, kill the zombies.

## Features

- Paste a bank statement screenshot or raw text — no bank linking, ever
- AI extracts subscription charges into an editable draft (you verify before anything is saved)
- Subscriptions ranked by monthly cost-per-use
- Zombie flags on rarely/never-used subscriptions costing more than $5/month
- Per-subscription cancel guides with numbered steps and deep links
- AI tool grouping (ChatGPT, Claude, Midjourney, etc.)
- CSV export for your records
- Watchdog tier with email-forwarding stub for renewal and price-hike alerts

## Prerequisites

- Node.js 18+
- An Anthropic API key — get one at [console.anthropic.com](https://console.anthropic.com)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create your server environment file
cp server/.env.example server/.env

# 3. Add your API key to server/.env
#    ANTHROPIC_API_KEY=sk-ant-...

# 4. Start the app (client + server together)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Testing without an API key

Paste the contents of `fixtures/sample1.txt` or `fixtures/sample2.txt` into the text area and click "Scan for subscriptions". These are fake bank statements that exercise the full flow without real transaction data.

## Architecture

```
┌─────────────────────────────────────────┐
│  Browser  (Vite + React + TypeScript)   │
│  port 5173                              │
│                                         │
│  PasteHero  ──paste──▶  DraftEditor     │
│                              │ confirm  │
│                              ▼          │
│              RankedList + CancelGuide   │
│              (localStorage store)       │
└──────────┬──────────────────────────────┘
           │ POST /api/extract (proxy)
           ▼
┌─────────────────────────────────────────┐
│  Express server  (tsx, port 3001)       │
│                                         │
│  Reads ANTHROPIC_API_KEY from .env      │
│  Calls Anthropic Messages API           │
│  Returns structured JSON charges        │
└─────────────────────────────────────────┘
```

### Key files

| File | Purpose |
|------|---------|
| `src/types.ts` | All shared TypeScript types |
| `src/store.ts` | localStorage-backed subscription store |
| `src/entitlements.ts` | Free / unlocked / watchdog tier logic |
| `src/cancelGuides.ts` | Hardcoded cancel guides for major services |
| `server/index.ts` | Express proxy for Anthropic API calls |
| `fixtures/` | Fake bank statements for manual testing |
| `SELF_TEST.md` | Manual verification checklist |

## Entitlement tiers

| Tier | Scans | Cancel guides | Export | Alerts |
|------|-------|---------------|--------|--------|
| **free** | 1 | Basic | — | — |
| **unlocked** | Unlimited | Full + deep links | CSV | — |
| **watchdog** | Unlimited | Full + deep links | CSV | Renewal / price-hike stubs |

Toggle tiers via the dev menu (floating button, bottom-right corner). Stripe integration is stubbed with a `// TODO: wire Stripe Checkout here` comment.

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Run client and server concurrently |
| `npm run dev:client` | Vite dev server only (port 5173) |
| `npm run dev:server` | Express server only with hot reload |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run lint` | Alias for typecheck |

## Constraints enforced

1. **No bank linking** — `SubscriptionSource` never includes `'bank_link'`. Only pasted text or screenshots accepted.
2. **Every amount has a sourceLine** — ties each charge back to the original statement line. Rendered on every card.
3. **AI extraction is a draft** — nothing is confirmed until the user explicitly clicks the Confirm button.
4. **Cancel guides = steps + deep link only** — SubSpotter never cancels on your behalf.
5. **API key server-side only** — `ANTHROPIC_API_KEY` lives in `server/.env`; never in the client bundle.
6. **Parse errors show friendly fallback** — if Anthropic returns unparseable JSON, a friendly message is shown. The app never crashes.

### Privacy note

Your statement text or screenshot travels from your browser → the SubSpotter Express server → Anthropic's API for extraction, then the result is returned. **Nothing is persisted on the server.** The server holds your `ANTHROPIC_API_KEY` and acts as a proxy; it does not log or store any statement content. Confirmed subscriptions are saved only in your browser's `localStorage`.

See [SELF_TEST.md](./SELF_TEST.md) for the full manual verification checklist.
