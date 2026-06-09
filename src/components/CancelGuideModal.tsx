import { Subscription, Entitlement } from '../types';
import { getCancelGuide } from '../cancelGuides';

interface Props {
  subscription: Subscription;
  entitlement: Entitlement;
  onClose: () => void;
}

export default function CancelGuideModal({ subscription, entitlement, onClose }: Props) {
  const guide = getCancelGuide(subscription.merchant);
  const showDeepLink = entitlement === 'unlocked' || entitlement === 'watchdog';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-white">How to cancel {guide.displayName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              ${(subscription.amountCents / 100).toFixed(2)}/{subscription.cadence}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-4">
          <ol className="space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-xs flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 pt-0.5">{step}</span>
              </li>
            ))}
          </ol>

          {guide.note && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs">
              {guide.note}
            </div>
          )}

          {/* Deep link */}
          <div className="pt-2">
            {showDeepLink ? (
              <a
                href={guide.deepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 rounded-xl text-center bg-red-900/30 border border-red-800/50 text-red-300 hover:bg-red-900/50 transition-colors font-semibold text-sm"
              >
                Go to cancellation page →
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-sm text-gray-500 text-center">
                <p>Deep link available with <strong className="text-indigo-400">Unlocked</strong> plan</p>
                <p className="text-xs mt-1">Search manually: "{guide.displayName} cancel subscription"</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 text-center pt-1">
            SubSpotter shows you the steps — <strong className="text-gray-500">you click the final cancel button.</strong>
            {' '}We never cancel on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
