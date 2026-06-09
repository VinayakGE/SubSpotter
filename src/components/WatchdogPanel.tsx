import { useState } from 'react';
import { Subscription, monthlyAmountCents } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const FORWARDING_ADDRESS = 'watchdog+[coming-soon]@subspotter.app';

export default function WatchdogPanel({ subscriptions }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(FORWARDING_ADDRESS).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-white">Watchdog</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/50 text-violet-300 border border-violet-800/50">
          Beta
        </span>
      </div>

      {/* Forwarding address stub */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-300">Email forwarding</p>
          <span className="text-xs text-gray-600">Stub</span>
        </div>
        <p className="text-xs text-gray-500">
          Forward subscription emails to your SubSpotter address to auto-detect renewals and price changes.
        </p>
        <div className="flex gap-2 items-center">
          <code className="flex-1 text-xs bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-400 font-mono">
            {FORWARDING_ADDRESS}
          </code>
          <button
            onClick={handleCopy}
            className="text-xs px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Alert stubs */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-300">Alerts</p>
          <span className="text-xs text-gray-600">Coming soon</span>
        </div>
        <div className="space-y-2">
          {subscriptions.slice(0, 5).map(sub => (
            <AlertRow key={sub.id} sub={sub} />
          ))}
          {subscriptions.length === 0 && (
            <p className="text-xs text-gray-600">No subscriptions to watch yet.</p>
          )}
          {subscriptions.length > 5 && (
            <p className="text-xs text-gray-600">+ {subscriptions.length - 5} more...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AlertRow({ sub }: { sub: Subscription }) {
  const monthly = monthlyAmountCents(sub);
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div>
        <p className="text-sm text-gray-300">{sub.merchant}</p>
        <p className="text-xs text-gray-600">${(monthly / 100).toFixed(2)}/mo</p>
      </div>
      <div className="flex gap-1.5">
        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-600 border border-gray-700">
          Renewal
        </span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-600 border border-gray-700">
          Price hike
        </span>
      </div>
    </div>
  );
}
