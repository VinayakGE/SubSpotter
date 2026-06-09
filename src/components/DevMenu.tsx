import { useState } from 'react';
import { Entitlement } from '../types';

interface Props {
  entitlement: Entitlement;
  scanCount: number;
  onEntitlementChange: (tier: Entitlement) => void;
  onResetScans: () => void;
  onClearData: () => void;
}

const TIERS: { value: Entitlement; label: string; desc: string }[] = [
  { value: 'free', label: 'Free', desc: '1 scan, basic guides' },
  { value: 'unlocked', label: 'Unlocked', desc: 'Unlimited scans, deep links, CSV' },
  { value: 'watchdog', label: 'Watchdog', desc: 'All + alerts panel' },
];

export default function DevMenu({ entitlement, scanCount, onEntitlementChange, onResetScans, onClearData }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {open && (
        <div className="mb-3 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-72 overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dev Menu</p>
            <p className="text-xs text-gray-600 mt-0.5">Scans used: {scanCount}</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Entitlement toggle */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold">Entitlement tier</p>
              {TIERS.map(tier => (
                <button
                  key={tier.value}
                  onClick={() => onEntitlementChange(tier.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    entitlement === tier.value
                      ? 'bg-indigo-900/60 border border-indigo-700 text-indigo-200'
                      : 'bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="font-semibold">{tier.label}</span>
                  <span className="text-xs ml-2 opacity-70">{tier.desc}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-semibold">Actions</p>
              <button
                onClick={() => { onResetScans(); }}
                className="w-full px-3 py-2 rounded-lg text-sm bg-gray-800 border border-gray-700 text-gray-400 hover:border-gray-600 transition-colors text-left"
              >
                Reset scan count
              </button>
              <button
                onClick={() => { if (confirm('Clear all saved subscriptions and scan count?')) onClearData(); }}
                className="w-full px-3 py-2 rounded-lg text-sm bg-red-950/30 border border-red-900/50 text-red-400 hover:bg-red-950/50 transition-colors text-left"
              >
                Clear all data
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors shadow-lg flex items-center justify-center text-lg"
        title="Dev menu"
      >
        {open ? '✕' : '⚙'}
      </button>
    </div>
  );
}
