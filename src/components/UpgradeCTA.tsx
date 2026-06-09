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

            {/* Watchdog tier */}
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-violet-200">Watchdog</p>
                <span className="text-sm text-violet-400 font-mono">$X/mo</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Everything in Unlocked</li>
                <li>✓ Saved subscriptions panel</li>
                <li>✓ Renewal & price-hike alerts (coming soon)</li>
                <li>✓ Email forwarding (coming soon)</li>
              </ul>
              <button
                onClick={() => {
                  // TODO: wire Stripe Checkout here
                  onUpgrade('watchdog');
                }}
                className="w-full py-2 rounded-lg bg-violet-700 text-white text-sm font-semibold hover:bg-violet-600 transition-colors"
              >
                Upgrade to Watchdog
              </button>
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
