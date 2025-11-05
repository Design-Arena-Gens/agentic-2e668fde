"use client";
import React, { useState } from 'react';
import useStore from '@/lib/store';
import { transcribeWav } from '@/lib/asr';

export default function TranscribeStep() {
  const { audioWav, segments, setSegments, setDetectedLang, setCurrentStep } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTranscribe() {
    if (!audioWav) return;
    setBusy(true);
    setError(null);
    try {
      const { segments: segs, language } = await transcribeWav(audioWav);
      const withSpk = segs.map(s => ({ ...s, speakerId: 'spk-1' }));
      setSegments(withSpk);
      setDetectedLang(language ?? null);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Transcription failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleTranscribe} disabled={!audioWav || busy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3' }}>Transcribe</button>
        <button onClick={() => setCurrentStep('translate')} disabled={segments.length === 0 || busy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Continue</button>
      </div>
      {busy && <div style={{ marginTop: 12, color: '#b6c2cf' }}>Running Whisper on-device (this may take a while)...</div>}
      {error && <div style={{ marginTop: 12, color: '#ff6b6b' }}>{error}</div>}
      {segments.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #2b3540' }}>
                <th style={{ padding: 8 }}>Start</th>
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Text</th>
              </tr>
            </thead>
            <tbody>
              {segments.slice(0, 100).map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1b2430' }}>
                  <td style={{ padding: 8 }}>{s.start.toFixed(2)}s</td>
                  <td style={{ padding: 8 }}>{s.end.toFixed(2)}s</td>
                  <td style={{ padding: 8 }}>{s.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
