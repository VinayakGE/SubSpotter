/**
 * Subscription store — backed by localStorage.
 * The interface is designed so a real DB (e.g. Supabase, SQLite) can replace
 * the localStorage implementation without changing any call sites.
 */
import { Subscription, UsageTag } from './types';

const STORAGE_KEY = 'subspotter_subscriptions';
const SCAN_COUNT_KEY = 'subspotter_scan_count';

/** Read all subscriptions from storage */
function readAll(): Subscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Subscription[];
  } catch {
    return [];
  }
}

/** Persist all subscriptions to storage */
function writeAll(subs: Subscription[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export const store = {
  /** Get all confirmed subscriptions */
  getAll(): Subscription[] {
    return readAll();
  },

  /** Add a batch of subscriptions (from a confirm action) */
  addBatch(subs: Subscription[]): void {
    const existing = readAll();
    const existingIds = new Set(existing.map(s => s.id));
    const newSubs = subs.filter(s => !existingIds.has(s.id));
    writeAll([...existing, ...newSubs]);
  },

  /** Update a single subscription (e.g. usageTag change) */
  update(id: string, patch: Partial<Subscription>): Subscription | null {
    const all = readAll();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return null;
    const updated = { ...all[idx], ...patch };
    all[idx] = updated;
    writeAll(all);
    return updated;
  },

  /** Delete a subscription */
  delete(id: string): void {
    const all = readAll().filter(s => s.id !== id);
    writeAll(all);
  },

  /** Clear all subscriptions */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Export all subscriptions as CSV string */
  exportCSV(): string {
    const all = readAll();
    const header = 'id,merchant,amountCents,currency,cadence,usageTag,isAITool,source,confirmedAt,sourceLine';
    // RFC 4180: wrap any field containing commas, double-quotes, or newlines in double-quotes;
    // escape internal double-quotes by doubling them.
    function csvField(value: string | number | boolean | undefined): string {
      const str = String(value ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }
    const rows = all.map(s =>
      [
        csvField(s.id),
        csvField(s.merchant),
        csvField(s.amountCents),
        csvField(s.currency),
        csvField(s.cadence),
        csvField(s.usageTag ?? ''),
        csvField(s.isAITool),
        csvField(s.source),
        csvField(s.confirmedAt),
        csvField(s.sourceLine)
      ].join(',')
    );
    return [header, ...rows].join('\n');
  },

  /** Increment and return the scan count (for free tier gating) */
  incrementScanCount(): number {
    const count = this.getScanCount() + 1;
    localStorage.setItem(SCAN_COUNT_KEY, String(count));
    return count;
  },

  /** Get the current scan count */
  getScanCount(): number {
    const raw = localStorage.getItem(SCAN_COUNT_KEY);
    return raw ? parseInt(raw, 10) : 0;
  },

  /** Reset scan count (dev/testing only) */
  resetScanCount(): void {
    localStorage.removeItem(SCAN_COUNT_KEY);
  },

  /** Set usage tag for a subscription */
  setUsageTag(id: string, tag: UsageTag): Subscription | null {
    return this.update(id, { usageTag: tag });
  }
};
