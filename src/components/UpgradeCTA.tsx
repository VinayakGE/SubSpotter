import { Entitlement } from '../types';

interface Props {
  currentTier: Entitlement;
  onClose: () => void;
  onUpgrade: (tier: Entitlement) => void;
}

export default function UpgradeCTA({ currentTier: _currentTier, onClose, onUpgrade }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-3xl">🚀</p>
            <h2 className="text-xl font-bold text-white">You've used your free scan</h2>
            <p className="text-sm text-gray-400">
              Free tier includes 1 scan. Upgrade to scan unlimited statements and unlock deeper features.
            </p>
          </div>

          <div className="space-y-3">
            {/* Unlocked tier */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-indigo-200">Unlocked</p>
                <span className="text-sm text-indigo-400 font-mono">$X/mo</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Unlimited scans</li>
                <li>✓ Full cancel guides with deep links</li>
                <li>✓ CSV export</li>
              </ul>
              <button
                onClick={() => {
                  // TODO: wire Stripe Checkout here
                  onUpgrade('unlocked');
                }}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors"
              >
                Upgrade to Unlocked
              </button>
            </div>

            {/* Watchdog tier — not yet available for purchase */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-700/50 space-y-2 opacity-70">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-400">Watchdog</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                  Coming soon
                </span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>✓ Everything in Unlocked</li>
                <li>○ Renewal & price-hike alerts</li>
                <li>○ Email forwarding for auto-detection</li>
              </ul>
              <p className="text-xs text-gray-600 italic">
                Server-side alerting is in development — we'll notify you when it's ready.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            (Stripe integration coming soon — click upgrade to simulate for now)
          </p>

          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
