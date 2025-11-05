"use client";
import React, { useState } from 'react';
import useStore from '@/lib/store';
import { translateSegments } from '@/lib/translate';

const LANG_OPTIONS = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
];

export default function TranslateStep() {
  const { detectedLang, segments, setSegments, targetLang, setTargetLang, setCurrentStep } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranslate() {
    if (!targetLang) return;
    if (segments.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const src = detectedLang ?? 'en';
      const outs = await translateSegments(segments, src, targetLang);
      const merged = segments.map((s, i) => ({ ...s, translation: outs[i] ?? '' }));
      setSegments(merged);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Translation failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <label style={{ color: '#b6c2cf' }}>Target language</label>
        <select value={targetLang ?? ''} onChange={(e) => setTargetLang(e.target.value)} style={{ background: '#0e141b', color: '#e6edf3', border: '1px solid #2b3540', borderRadius: 6, padding: '8px 10px' }}>
          <option value="" disabled>Select...</option>
          {LANG_OPTIONS.map(opt => (
            <option key={opt.code} value={opt.code}>{opt.name}</option>
          ))}
        </select>
        <button onClick={handleTranslate} disabled={!targetLang || segments.length === 0 || busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3' }}>Translate</button>
        <button onClick={() => setCurrentStep('voice')} disabled={(segments.findIndex(s => !!s.translation) === -1) || busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Continue</button>
      </div>
      {busy && <div style={{ marginTop: 8, color: '#b6c2cf' }}>Translating segments on-device...</div>}
      {error && <div style={{ marginTop: 8, color: '#ff6b6b' }}>{error}</div>}
      {segments.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 400, overflow: 'auto', border: '1px solid #1b2430', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #2b3540' }}>
                <th style={{ padding: 8 }}>Original</th>
                <th style={{ padding: 8 }}>Translated</th>
              </tr>
            </thead>
            <tbody>
              {segments.slice(0, 100).map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1b2430' }}>
                  <td style={{ padding: 8, width: '50%' }}>{s.text}</td>
                  <td style={{ padding: 8 }}>
                    <input value={s.translation ?? ''} onChange={e => {
                      const v = e.target.value;
                      // local update via store
                      useStore.getState().updateSegment(i, { translation: v });
                    }} style={{ width: '100%', background: '#0e141b', color: '#e6edf3', border: '1px solid #2b3540', borderRadius: 6, padding: '6px 8px' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
