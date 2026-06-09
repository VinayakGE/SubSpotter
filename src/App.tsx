import { useState, useEffect } from 'react';
import { Subscription, ExtractedCharge, Entitlement } from './types';
import { store } from './store';
import { getEntitlement, setEntitlement, canScan, canExportCSV, canUseWatchdog } from './entitlements';
import PasteHero from './components/PasteHero';
import DraftEditor from './components/DraftEditor';
import RankedList from './components/RankedList';
import DevMenu from './components/DevMenu';
import UpgradeCTA from './components/UpgradeCTA';
import WatchdogPanel from './components/WatchdogPanel';

type AppView = 'hero' | 'draft' | 'ranked';

export default function App() {
  const [view, setView] = useState<AppView>('hero');
  const [draftCharges, setDraftCharges] = useState<ExtractedCharge[]>([]);
  const [draftInputType, setDraftInputType] = useState<'text' | 'screenshot'>('text');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [entitlement, setEntitlementState] = useState<Entitlement>(getEntitlement());
  const [scanCount, setScanCount] = useState(store.getScanCount());
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const saved = store.getAll();
    if (saved.length > 0) {
      setSubscriptions(saved);
      setView('ranked');
    }
  }, []);

  function handleExtracted(charges: ExtractedCharge[], inputType: 'text' | 'screenshot') {
    setParseError(null);
    setDraftCharges(charges);
    setDraftInputType(inputType);
    setView('draft');
  }

  function handleParseError(msg: string) {
    setParseError(msg);
  }

  function handleScanAttempt(): boolean {
    if (!canScan(scanCount, entitlement)) {
      setShowUpgrade(true);
      return false;
    }
    return true;
  }

  function handleScanComplete() {
    const newCount = store.incrementScanCount();
    setScanCount(newCount);
  }

  function handleConfirm(confirmed: Subscription[]) {
    store.addBatch(confirmed);
    setSubscriptions(store.getAll());
    setView('ranked');
    setDraftCharges([]);
  }

  function handleDraftCancel() {
    setView('hero');
    setDraftCharges([]);
    setDraftInputType('text');
    setParseError(null);
  }

  function handleNewScan() {
    if (!canScan(scanCount, entitlement)) {
      setShowUpgrade(true);
      return;
    }
    setView('hero');
    setParseError(null);
  }

  function handleEntitlementChange(tier: Entitlement) {
    setEntitlement(tier);
    setEntitlementState(tier);
  }

  function handleUpdateSub(updated: Subscription) {
    store.update(updated.id, updated);
    setSubscriptions(store.getAll());
  }

  function handleDeleteSub(id: string) {
    store.delete(id);
    const remaining = store.getAll();
    setSubscriptions(remaining);
    if (remaining.length === 0) {
      setView('hero');
    }
  }

  function handleExportCSV() {
    const csv = store.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subspotter-subscriptions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setView(subscriptions.length > 0 ? 'ranked' : 'hero')}
            className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <span>SubSpotter</span>
          </button>
          <div className="flex items-center gap-3">
            {view === 'ranked' && subscriptions.length > 0 && (
              <>
                {canExportCSV(entitlement) && (
                  <button
                    onClick={handleExportCSV}
                    className="text-sm px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Export CSV
                  </button>
                )}
                <button
                  onClick={handleNewScan}
                  className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                  + New Scan
                </button>
              </>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-400 capitalize">
              {entitlement}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {view === 'hero' && (
          <PasteHero
            onExtracted={handleExtracted}
            onParseError={handleParseError}
            onScanAttempt={handleScanAttempt}
            onScanComplete={handleScanComplete}
            parseError={parseError}
          />
        )}

        {view === 'draft' && (
          <DraftEditor
            charges={draftCharges}
            inputType={draftInputType}
            onConfirm={handleConfirm}
            onCancel={handleDraftCancel}
          />
        )}

        {view === 'ranked' && (
          <>
            <RankedList
              subscriptions={subscriptions}
              entitlement={entitlement}
              onUpdateSub={handleUpdateSub}
              onDeleteSub={handleDeleteSub}
              onNewScan={handleNewScan}
            />
            {canUseWatchdog(entitlement) && (
              <WatchdogPanel subscriptions={subscriptions} />
            )}
          </>
        )}
      </main>

      {/* Upgrade CTA overlay */}
      {showUpgrade && (
        <UpgradeCTA
          currentTier={entitlement}
          onClose={() => setShowUpgrade(false)}
          onUpgrade={(tier) => {
            handleEntitlementChange(tier);
            setShowUpgrade(false);
          }}
        />
      )}

      {/* Dev menu — floating bottom-right */}
      <DevMenu
        entitlement={entitlement}
        scanCount={scanCount}
        onEntitlementChange={handleEntitlementChange}
        onResetScans={() => {
          store.resetScanCount();
          setScanCount(0);
        }}
        onClearData={() => {
          store.clearAll();
          store.resetScanCount();
          setSubscriptions([]);
          setScanCount(0);
          setView('hero');
        }}
      />
    </div>
  );
}
