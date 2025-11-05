"use client";
import React, { useState } from 'react';
import useStore from '@/lib/store';
import { synthesizeSegments } from '@/lib/tts';
import { mixWithDucking } from '@/lib/audio';

export default function MixStep() {
  const { audioWav, segments, targetLang, setDubbedWav, setCurrentStep } = useStore();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSynthesizeAndMix() {
    if (!audioWav || !targetLang) return;
    setBusy(true);
    setError(null);
    try {
      setStatus('Synthesizing speech with TTS...');
      const synth = await synthesizeSegments(segments, targetLang);
      setStatus('Mixing with background (ducking)...');
      const mixed = await mixWithDucking(audioWav, synth);
      setDubbedWav(mixed);
      setStatus('Done');
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Synthesis or mixing failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleSynthesizeAndMix} disabled={!audioWav || !targetLang || segments.length === 0 || busy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3' }}>Synthesize & Mix</button>
        <button onClick={() => setCurrentStep('review')} disabled={useStore.getState().dubbedWav == null || busy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Continue</button>
      </div>
      {busy && <div style={{ marginTop: 12, color: '#b6c2cf' }}>{status}</div>}
      {error && <div style={{ marginTop: 12, color: '#ff6b6b' }}>{error}</div>}
      {useStore.getState().dubbedWav && (
        <div style={{ marginTop: 12, color: '#b6c2cf' }}>Dubbed audio ready.</div>
      )}
    </div>
  );
}
