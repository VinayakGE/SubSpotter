import { useState, useRef, DragEvent, ClipboardEvent } from 'react';
import { ExtractedCharge, ExtractResponse, RawExtractedCharge } from '../types';

interface Props {
  onExtracted: (charges: ExtractedCharge[]) => void;
  onParseError: (msg: string) => void;
  onScanAttempt: () => boolean;
  onScanComplete: () => void;
  parseError: string | null;
}

export default function PasteHero({ onExtracted, onParseError, onScanAttempt, onScanComplete, parseError }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function callExtract(payload: { imageBase64?: string; text?: string }) {
    if (!onScanAttempt()) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data: ExtractResponse = await res.json();
      onScanComplete();

      if (data.error === 'parse_failed') {
        onParseError("Couldn't read that cleanly — try pasting as plain text instead.");
        return;
      }
      if (data.error) {
        onParseError(`Something went wrong: ${data.error}. Check that your API key is set in server/.env.`);
        return;
      }
      if (!data.charges || data.charges.length === 0) {
        onParseError("No subscriptions found. Try pasting more of your bank statement, or check the format.");
        return;
      }

      // Add IDs to raw charges
      const charges: ExtractedCharge[] = data.charges.map((c: RawExtractedCharge, i: number) => ({
        ...c,
        id: `draft-${Date.now()}-${i}`,
      }));
      onExtracted(charges);
    } catch (err) {
      console.error(err);
      onParseError("Couldn't reach the server. Make sure `npm run dev:server` is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleTextSubmit() {
    if (!text.trim()) return;
    callExtract({ text: text.trim() });
  }

  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          callExtract({ imageBase64: dataUrl });
        };
        reader.readAsDataURL(file);
        return;
      }
    }
    // Otherwise let text paste through normally
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        callExtract({ imageBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Hero headline */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-white">
          Find your subscription leaks
        </h1>
        <p className="text-lg text-gray-400 max-w-xl">
          Paste your bank statement below — screenshot or text. AI spots the subscriptions.
          You verify and confirm. We never connect to your bank.
        </p>
      </div>

      {/* Privacy badges */}
      <div className="flex flex-wrap gap-3 justify-center">
        {['No bank linking', 'API key stays server-side', 'You take all final actions'].map(badge => (
          <span key={badge} className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
            ✓ {badge}
          </span>
        ))}
      </div>

      {/* Paste area */}
      <div
        className={`w-full max-w-2xl rounded-2xl border-2 border-dashed transition-colors ${
          dragOver ? 'border-indigo-400 bg-indigo-950/30' : 'border-gray-700 bg-gray-900'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="p-6 space-y-4">
          <p className="text-center text-gray-500 text-sm">
            {dragOver ? 'Drop screenshot here...' : 'Paste screenshot (Ctrl+V) or type/paste statement text below'}
          </p>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={handlePaste}
            placeholder="05/01/2025  NETFLIX.COM  -$15.49&#10;05/03/2025  SPOTIFY USA  -$10.99&#10;..."
            rows={8}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 placeholder-gray-600 resize-none focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
          />
          <div className="flex gap-3">
            <button
              onClick={handleTextSubmit}
              disabled={loading || !text.trim()}
              className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Scanning...
                </span>
              ) : 'Scan for subscriptions'}
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {parseError && (
        <div className="w-full max-w-2xl p-4 rounded-xl bg-orange-950/40 border border-orange-800/50 text-orange-300 text-sm">
          <span className="font-semibold">Heads up: </span>{parseError}
        </div>
      )}

      {/* Tips */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
        <div className="bg-gray-900 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-gray-300">Screenshot</p>
          <p>Take a screenshot of your bank statement and paste it directly (Ctrl+V)</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-gray-300">Text export</p>
          <p>Copy-paste rows from your bank's transaction view into the text area</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 space-y-1">
          <p className="font-semibold text-gray-300">Test data</p>
          <p>Try pasting from <code className="text-indigo-400">fixtures/sample1.txt</code> to see the full flow</p>
        </div>
      </div>
    </div>
  );
}
