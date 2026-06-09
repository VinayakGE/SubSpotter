import { Entitlement } from './types';

const ENTITLEMENT_KEY = 'subspotter_entitlement';

/** Get current entitlement tier */
export function getEntitlement(): Entitlement {
  const stored = localStorage.getItem(ENTITLEMENT_KEY);
  if (stored === 'unlocked' || stored === 'watchdog') return stored;
  return 'free';
}

/** Set entitlement tier (dev menu / post-purchase) */
export function setEntitlement(tier: Entitlement): void {
  localStorage.setItem(ENTITLEMENT_KEY, tier);
  // TODO: wire Stripe Checkout here — after successful payment, call setEntitlement('unlocked') or setEntitlement('watchdog')
}

/** Free tier: only 1 scan allowed */
export function canScan(scanCount: number, entitlement: Entitlement): boolean {
  if (entitlement === 'free') return scanCount < 1;
  return true;
}

/** Unlocked and above can see full cancel guides with deep links */
export function canSeeFullCancelGuides(entitlement: Entitlement): boolean {
  return entitlement === 'unlocked' || entitlement === 'watchdog';
}

/** Unlocked and above can export CSV */
export function canExportCSV(entitlement: Entitlement): boolean {
  return entitlement === 'unlocked' || entitlement === 'watchdog';
}

/** Watchdog only: saved subs panel + alert stubs */
export function canUseWatchdog(entitlement: Entitlement): boolean {
  return entitlement === 'watchdog';
}
