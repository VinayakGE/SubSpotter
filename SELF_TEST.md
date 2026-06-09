# SubSpotter — Manual Verification Checklist

Run through each item before shipping. Each constraint maps to a non-negotiable rule from CLAUDE.md.

---

## 1. No dollar figure renders without a sourceLine

**What to check:**
- In `DraftEditor.tsx`, every `DraftRow` displays `charge.sourceLine` (the `font-mono truncate` line below the merchant name).
- In `RankedList.tsx`, every `SubCard` displays `sub.sourceLine` (the `font-mono truncate` line below the merchant name).
- The `sourceLine` field is non-optional in both `ExtractedCharge` and `Subscription` types (`src/types.ts`).

**Manual test:**
1. Paste `fixtures/sample1.txt` into the app.
2. On the draft screen, verify every charge shows its source line in monospace text.
3. Confirm and check the ranked list — every card should show the source line.
4. There is no path where an amount can be displayed without the corresponding sourceLine rendering.

**Pass if:** Every amount in the app is visually paired with its source line. No amount appears in isolation.

---

## 2. Draft is always editable before confirm

**What to check:**
- `DraftEditor.tsx` renders editable `<input>` fields for merchant name.
- Amount is an editable button (click to enter number input).
- Cadence is an editable `<select>`.
- Each row has a Remove/Restore toggle.
- The Confirm button only saves data after the user clicks it.

**Manual test:**
1. Paste statement text and click "Scan for subscriptions".
2. On the draft screen: edit a merchant name, change an amount, change a cadence, remove a row.
3. Click Confirm — verify only the modified, non-removed data is saved.
4. Go back and scan again — verify the original extraction is re-editable.

**Pass if:** All fields are editable; Confirm is required to save; nothing persists until Confirm is clicked.

---

## 3. Cancel guides never auto-cancel

**What to check:**
- `CancelGuideModal.tsx` shows numbered steps and a link button.
- The disclaimer text reads: "SubSpotter shows you the steps — you click the final cancel button. We never cancel on your behalf."
- There is no API call or automated action in the cancel guide flow.

**Manual test:**
1. On the ranked list, click "How to cancel" on any subscription.
2. Verify the modal shows numbered steps.
3. (Unlocked tier) Verify the "Go to cancellation page →" link opens the merchant's website in a new tab.
4. Verify no subscription is modified or deleted when you open/close the modal.

**Pass if:** Modal is informational only. Clicking the deep link opens a browser tab. Nothing is cancelled automatically.

---

## 4. Entitlement gates work

**What to check:**
- Free: only 1 scan allowed (`canScan` in `entitlements.ts`); upgrade CTA appears on second scan attempt.
- Unlocked: unlimited scans; deep links visible in cancel modals; Export CSV button visible.
- Watchdog: all of Unlocked + Watchdog panel shows at bottom of ranked list.

**Manual test:**
1. Set Dev Menu → Free. Scan once — should work.
2. Try to scan again — UpgradeCTA modal should appear.
3. Set Dev Menu → Unlocked. New scan should work. Cancel guide should show deep link. Export CSV should appear.
4. Set Dev Menu → Watchdog. Watchdog panel should appear below ranked list.

**Pass if:** Each tier has exactly the features listed above, no more.

---

## 5. Parse failure shows friendly error, not crash

**What to check:**
- `server/index.ts`: if JSON parsing fails, returns `{ error: 'parse_failed' }` with HTTP 200.
- `PasteHero.tsx`: checks for `data.error === 'parse_failed'` and shows the friendly message.
- No uncaught exceptions reach the user.

**Manual test:**
1. Stop the server (`Ctrl+C` on dev:server).
2. Try to scan — should show "Couldn't reach the server..." message.
3. Restart server. Paste clearly non-statement text (e.g. a poem).
4. Should either return empty results ("No subscriptions found...") or a friendly parse error.
5. Verify the app does not crash or show a blank/error screen.

**Pass if:** All error paths show friendly messages in the orange banner. No white screens or unhandled promise rejections.

---

## 6. API key is server-side only

**What to check:**
- `server/index.ts`: reads `process.env.ANTHROPIC_API_KEY` — never passed to responses.
- `server/.env` is in `.gitignore` (verify with `git check-ignore server/.env`).
- No `VITE_ANTHROPIC` variable anywhere in `src/`.
- Client code in `src/` only calls `http://localhost:3001/api/extract` — it never calls the Anthropic API directly.

**Manual test:**
1. Run `grep -r "ANTHROPIC" src/` — should return zero results.
2. Run `grep -r "anthropic-ai/sdk" src/` — should return zero results.
3. Open browser DevTools > Network. Scan a statement. Verify requests only go to `localhost:3001`, not to `api.anthropic.com`.
4. Check the response from `/api/extract` — it contains `charges` or `error`, never the API key.

**Pass if:** The Anthropic API key is never in the client bundle or visible in browser network traffic.

---

## 7. Stripe seam is marked TODO

**What to check:**
- `src/entitlements.ts`: contains `// TODO: wire Stripe Checkout here` comment.
- `src/components/UpgradeCTA.tsx`: both upgrade buttons contain `// TODO: wire Stripe Checkout here` comments.
- No actual Stripe SDK is imported or called.

**Manual test:**
1. Run `grep -r "TODO: wire Stripe" src/` — should show 3 results.
2. Run `grep -r "stripe" src/` (case insensitive) — should return zero SDK import results.
3. Click upgrade in the UpgradeCTA modal — it should simulate tier change locally (dev behavior), not redirect to Stripe.

**Pass if:** 3 clearly-marked TODO comments exist; no Stripe SDK present; upgrade flow is clearly a stub.
