import { useState } from 'react';
import { ExtractedCharge, Subscription, Cadence, detectIsAITool } from '../types';

interface Props {
  charges: ExtractedCharge[];
  onConfirm: (subscriptions: Subscription[]) => void;
  onCancel: () => void;
}

interface EditableCharge extends ExtractedCharge {
  deleted: boolean;
}

export default function DraftEditor({ charges, onConfirm, onCancel }: Props) {
  const [editables, setEditables] = useState<EditableCharge[]>(
    charges.map(c => ({ ...c, deleted: false }))
  );

  function update(id: string, patch: Partial<ExtractedCharge>) {
    setEditables(prev =>
      prev.map(e => e.id === id ? { ...e, ...patch } : e)
    );
  }

  function toggleDelete(id: string) {
    setEditables(prev =>
      prev.map(e => e.id === id ? { ...e, deleted: !e.deleted } : e)
    );
  }

  function handleConfirm() {
    const now = new Date().toISOString();
    const confirmed: Subscription[] = editables
      .filter(e => !e.deleted)
      .map(e => ({
        id: e.id,
        merchant: e.merchant,
        amountCents: e.amountCents,
        currency: e.currency,
        cadence: e.cadence,
        sourceLine: e.sourceLine,
        source: 'screenshot' as const,
        confirmedAt: now,
        isAITool: detectIsAITool(e.merchant),
      }));
    onConfirm(confirmed);
  }

  const activeCount = editables.filter(e => !e.deleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Review extracted subscriptions</h2>
        <p className="text-gray-400">
          AI found {editables.length} potential subscription{editables.length !== 1 ? 's' : ''}.
          Edit names or amounts, remove false positives, then confirm.
        </p>
      </div>

      {/* Draft notice banner */}
      <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-indigo-300 text-sm">
        <strong>Draft — not saved yet.</strong> These are AI suggestions. Review each one before confirming.
      </div>

      {/* Charges list */}
      <div className="space-y-3">
        {editables.map((charge) => (
          <DraftRow
            key={charge.id}
            charge={charge}
            onUpdate={(patch) => update(charge.id, patch)}
            onToggleDelete={() => toggleDelete(charge.id)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleConfirm}
          disabled={activeCount === 0}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Confirm {activeCount} subscription{activeCount !== 1 ? 's' : ''}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}

interface DraftRowProps {
  charge: EditableCharge;
  onUpdate: (patch: Partial<ExtractedCharge>) => void;
  onToggleDelete: () => void;
}

function DraftRow({ charge, onUpdate, onToggleDelete }: DraftRowProps) {
  const [editingAmount, setEditingAmount] = useState(false);
  const [amountStr, setAmountStr] = useState((charge.amountCents / 100).toFixed(2));

  function commitAmount() {
    const parsed = parseFloat(amountStr);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdate({ amountCents: Math.round(parsed * 100) });
    } else {
      setAmountStr((charge.amountCents / 100).toFixed(2));
    }
    setEditingAmount(false);
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      charge.deleted
        ? 'border-gray-800 bg-gray-900/30 opacity-40'
        : 'border-gray-700 bg-gray-900'
    }`}>
      <div className="flex items-start gap-3">
        {/* Confidence indicator */}
        <div className="mt-1 w-2 h-2 rounded-full flex-shrink-0" style={{
          backgroundColor: charge.confidence > 0.8 ? '#22c55e' : charge.confidence > 0.5 ? '#f59e0b' : '#ef4444'
        }} title={`Confidence: ${Math.round(charge.confidence * 100)}%`} />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Merchant name (editable) */}
          <input
            type="text"
            value={charge.merchant}
            onChange={(e) => onUpdate({ merchant: e.target.value })}
            disabled={charge.deleted}
            className="w-full bg-transparent text-white font-semibold text-base border-b border-transparent hover:border-gray-600 focus:border-indigo-500 focus:outline-none px-0 py-0.5 disabled:cursor-not-allowed"
          />

          {/* Source line — required, always shown */}
          <p className="text-xs text-gray-500 font-mono truncate" title={charge.sourceLine}>
            {charge.sourceLine}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {/* Amount (editable) */}
            <div className="flex items-center gap-1">
              <span className="text-gray-500 text-sm">{charge.currency}</span>
              {editingAmount ? (
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  onBlur={commitAmount}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitAmount(); if (e.key === 'Escape') setEditingAmount(false); }}
                  className="w-20 bg-gray-800 border border-indigo-500 rounded px-2 py-0.5 text-sm text-white focus:outline-none"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => { setAmountStr((charge.amountCents / 100).toFixed(2)); setEditingAmount(true); }}
                  disabled={charge.deleted}
                  className="text-sm font-mono text-green-400 hover:text-green-300 hover:underline disabled:cursor-not-allowed"
                >
                  ${(charge.amountCents / 100).toFixed(2)}
                </button>
              )}
            </div>

            {/* Cadence (editable) */}
            <select
              value={charge.cadence}
              onChange={(e) => onUpdate({ cadence: e.target.value as Cadence })}
              disabled={charge.deleted}
              className="text-xs bg-gray-800 border border-gray-700 rounded px-2 py-1 text-gray-300 focus:outline-none focus:border-indigo-500 disabled:cursor-not-allowed"
            >
              <option value="monthly">monthly</option>
              <option value="annual">annual</option>
              <option value="unknown">unknown</option>
            </select>

            {/* Confidence badge */}
            <span className="text-xs text-gray-600">
              {Math.round(charge.confidence * 100)}% confident
            </span>
          </div>
        </div>

        {/* Delete/restore toggle */}
        <button
          onClick={onToggleDelete}
          className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg transition-colors ${
            charge.deleted
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-red-950/40 text-red-400 hover:bg-red-950/70'
          }`}
        >
          {charge.deleted ? 'Restore' : 'Remove'}
        </button>
      </div>
    </div>
  );
}
