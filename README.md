# SubSpotter

**Privacy-first subscription auditor** — paste your bank statement, spot your subscriptions, kill the zombies.

## What it does

1. Paste a bank statement screenshot or raw text
2. AI extracts subscription charges (editable draft — you verify everything)
3. Confirm → see subscriptions ranked by cost-per-use
4. Zombie flags on rarely/never-used subs
5. Per-subscription cancel guides with deep links

## Privacy model

- **No bank linking, no Plaid, no OAuth** — you paste; we never connect to your bank
- **API key stays server-side** — the Anthropic key never touches the browser
- **You take all final actions** — cancel guides link you to the service; SubSpotter never cancels on your behalf

## Setup

### Prerequisites
- Node.js 18+
- An Anthropic API key (get one at console.anthropic.com)

### Install & run
```bash
npm install

# Set up your API key
cp server/.env.example server/.env
# Edit server/.env and add: ANTHROPIC_API_KEY=sk-ant-...

# Run client + server together
npm run dev
```

Client runs at http://localhost:5173
Server runs at http://localhost:3001

### Testing without an API key
Use the sample fixtures in `fixtures/sample1.txt` and `fixtures/sample2.txt` — paste their content into the app.

## Architecture

```
Browser (Vite/React)
  |  paste image or text
  v
POST /api/extract (Express, port 3001)
  |  calls Anthropic Messages API
  v
Structured JSON -> editable draft in browser
  |  user edits + confirms
  v
localStorage store -> ranked view + cancel guides
```

### Key files
| File | Purpose |
|------|---------|
| `src/types.ts` | All shared TypeScript types |
| `src/store.ts` | localStorage-backed subscription store |
| `src/entitlements.ts` | Free/unlocked/watchdog tier logic |
| `src/cancelGuides.ts` | Hardcoded cancel guides for major services |
| `server/index.ts` | Express proxy for Anthropic API |
| `fixtures/` | Fake bank statements for testing |

## Entitlement tiers

| Tier | Scans | Cancel guides | Export | Alerts |
|------|-------|---------------|--------|--------|
| Free | 1 | Basic | - | - |
| Unlocked | Unlimited | Full + deep links | CSV | - |
| Watchdog | Unlimited | Full + deep links | CSV | Renewal/price-hike stubs |

Toggle tiers via the dev menu (bottom-right floating button).

## Scripts

```bash
npm run dev          # Run client + server concurrently
npm run dev:client   # Vite dev server only
npm run dev:server   # Express server only (with hot reload)
npm run build        # Production build
npm run typecheck    # TypeScript type check only
```
