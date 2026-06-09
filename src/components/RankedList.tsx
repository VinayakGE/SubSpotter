import { useState } from 'react';
import { Subscription, UsageTag, Entitlement, monthlyAmountCents, costPerUseCents, isZombie } from '../types';
import CancelGuideModal from './CancelGuideModal';

interface Props {
  subscriptions: Subscription[];
  entitlement: Entitlement;
  onUpdateSub: (sub: Subscription) => void;
  onDeleteSub: (id: string) => void;
  onNewScan: () => void;
}

function sortSubs(subs: Subscription[]): Subscription[] {
  const tagged = subs.filter(s => s.usageTag !== undefined);
  const untagged = subs.filter(s => s.usageTag === undefined);

  // Tagged: sort by cost-per-use descending (most expensive to use = wasteful first)
  tagged.sort((a, b) => costPerUseCents(b) - costPerUseCents(a));
  // Untagged: sort by raw monthly cost descending
  untagged.sort((a, b) => monthlyAmountCents(b) - monthlyAmountCents(a));

  return [...tagged, ...untagged];
}

export default function RankedList({ subscriptions, entitlement, onUpdateSub, onDeleteSub, onNewScan }: Props) {
  const [selectedCancelId, setSelectedCancelId] = useState<string | null>(null);

  const sorted = sortSubs(subscriptions);
  const aiSubs = sorted.filter(s => s.isAITool);
  const regularSubs = sorted.filter(s => !s.isAITool);
  const zombieSubs = subscriptions.filter(s => isZombie(s));
  const untaggedSubs = subscriptions.filter(s => s.usageTag === undefined);

  const totalMonthlyCents = subscriptions.reduce((sum, s) => sum + monthlyAmountCents(s), 0);
  const zombieWasteCents = zombieSubs.reduce((sum, s) => sum + monthlyAmountCents(s), 0);
  const aiTotalCents = aiSubs.reduce((sum, s) => sum + monthlyAmountCents(s), 0);

  const selectedSub = selectedCancelId ? subscriptions.find(s => s.id === selectedCancelId) : null;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Monthly total"
          value={`$${(totalMonthlyCents / 100).toFixed(2)}`}
          sub={`$${(totalMonthlyCents * 12 / 100).toFixed(0)}/year`}
          color="text-white"
        />
        {zombieWasteCents > 0 && (
          <SummaryCard
            label="Zombie waste/mo"
            value={`$${(zombieWasteCents / 100).toFixed(2)}`}
            sub={`${zombieSubs.length} dead sub${zombieSubs.length !== 1 ? 's' : ''}`}
            color="text-orange-400"
          />
        )}
        {aiTotalCents > 0 && (
          <SummaryCard
            label="AI stack/mo"
            value={`$${(aiTotalCents / 100).toFixed(2)}`}
            sub={`${aiSubs.length} AI tool${aiSubs.length !== 1 ? 's' : ''}`}
            color="text-violet-400"
          />
        )}
      </div>

      {/* Tag prompt */}
      {untaggedSubs.length > 0 && (
        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-300 text-sm">
          <strong>Tag your usage</strong> — click Daily/Weekly/Rarely/Never on each subscription to see cost-per-use rankings and spot zombies.
        </div>
      )}

      {/* AI Stack group */}
      {aiSubs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-violet-400">AI Stack</span>
            <span className="text-xs text-gray-600">
              ${(aiTotalCents / 100).toFixed(2)}/mo
            </span>
          </div>
          {aiSubs.map(sub => (
            <SubCard
              key={sub.id}
              sub={sub}
              entitlement={entitlement}
              onUpdate={onUpdateSub}
              onDelete={() => onDeleteSub(sub.id)}
              onCancelGuide={() => setSelectedCancelId(sub.id)}
              variant="ai"
            />
          ))}
        </section>
      )}

      {/* Regular subs */}
      {regularSubs.length > 0 && (
        <section className="space-y-3">
          {aiSubs.length > 0 && (
            <p className="text-sm font-semibold text-gray-400">Other subscriptions</p>
          )}
          {regularSubs.map(sub => (
            <SubCard
              key={sub.id}
              sub={sub}
              entitlement={entitlement}
              onUpdate={onUpdateSub}
              onDelete={() => onDeleteSub(sub.id)}
              onCancelGuide={() => setSelectedCancelId(sub.id)}
              variant="regular"
            />
          ))}
        </section>
      )}

      {subscriptions.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <p className="text-gray-500">No subscriptions yet.</p>
          <button
            onClick={onNewScan}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Scan a statement
          </button>
        </div>
      )}

      {/* Cancel guide modal */}
      {selectedSub && (
        <CancelGuideModal
          subscription={selectedSub}
          entitlement={entitlement}
          onClose={() => setSelectedCancelId(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 space-y-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600">{sub}</p>
    </div>
  );
}

interface SubCardProps {
  sub: Subscription;
  entitlement: Entitlement;
  onUpdate: (sub: Subscription) => void;
  onDelete: () => void;
  onCancelGuide: () => void;
  variant: 'ai' | 'regular';
}

const USAGE_TAGS: { tag: UsageTag; label: string }[] = [
  { tag: 'daily', label: 'Daily' },
  { tag: 'weekly', label: 'Weekly' },
  { tag: 'rarely', label: 'Rarely' },
  { tag: 'never', label: 'Never' },
];

function SubCard({ sub, onUpdate, onDelete, onCancelGuide, variant }: SubCardProps) {
  const zombie = isZombie(sub);
  const monthly = monthlyAmountCents(sub);

  const cpu = sub.usageTag !== undefined ? costPerUseCents(sub) : null;

  function setUsageTag(tag: UsageTag) {
    onUpdate({ ...sub, usageTag: tag === sub.usageTag ? undefined : tag });
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${
      zombie
        ? 'border-orange-800/60 bg-orange-950/20'
        : variant === 'ai'
        ? 'border-violet-900/60 bg-violet-950/10'
        : 'border-gray-800 bg-gray-900'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white">{sub.merchant}</h3>
            {zombie && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-300 border border-orange-800/50">
                Zombie
              </span>
            )}
            {sub.isAITool && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/40 text-violet-300 border border-violet-800/40">
                AI
              </span>
            )}
          </div>

          {/* Source line — required by constraint #2 */}
          <p className="text-xs text-gray-600 font-mono truncate" title={sub.sourceLine}>
            {sub.sourceLine}
          </p>
        </div>

        <div className="text-right flex-shrink-0 space-y-0.5">
          <p className="font-mono font-semibold text-green-400">
            ${(monthly / 100).toFixed(2)}<span className="text-gray-500 font-normal text-xs">/mo</span>
          </p>
          {sub.cadence === 'annual' && (
            <p className="text-xs text-gray-600">${(sub.amountCents / 100).toFixed(2)}/yr</p>
          )}
          {cpu !== null && (
            <p className="text-xs text-gray-500">
              ${(cpu / 100).toFixed(2)}/use
            </p>
          )}
        </div>
      </div>

      {/* Usage tag buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-500">Usage:</span>
        {USAGE_TAGS.map(({ tag, label }) => (
          <button
            key={tag}
            onClick={() => setUsageTag(tag)}
            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              sub.usageTag === tag
                ? tag === 'never' || tag === 'rarely'
                  ? 'bg-orange-900/60 border-orange-700 text-orange-300'
                  : 'bg-indigo-900/60 border-indigo-700 text-indigo-300'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            {label}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancelGuide}
            className="text-xs px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            How to cancel
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded-lg text-gray-600 hover:text-red-400 transition-colors"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
