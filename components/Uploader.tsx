"use client";
import React, { useState } from 'react';
import useStore from '@/lib/store';
import { extractMono16kWavFromVideo } from '@/lib/ffmpeg';

export default function Uploader() {
  const { setVideoFile, videoUrl, setAudioWav, setCurrentStep } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileSelected(file: File) {
    setError(null);
    setBusy(true);
    try {
      setVideoFile(file);
      const wav = await extractMono16kWavFromVideo(file);
      setAudioWav(wav);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Failed to process video');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ display: 'inline-block', padding: '10px 14px', border: '1px dashed #2b3540', borderRadius: 8, cursor: 'pointer', background: '#0e141b' }}>
          <input type="file" accept="video/*" style={{ display: 'none' }} onChange={e => {
            const f = e.target.files?.[0];
            if (f) onFileSelected(f);
          }} />
          <span>Select video file</span>
        </label>
        <button disabled={!videoUrl || busy} onClick={() => setCurrentStep('transcribe')} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3' }}>
          Continue
        </button>
      </div>
      {busy && <div style={{ marginTop: 12, color: '#b6c2cf' }}>Processing audio with ffmpeg.wasm...</div>}
      {error && <div style={{ marginTop: 12, color: '#ff6b6b' }}>{error}</div>}
      {videoUrl && (
        <div style={{ marginTop: 16 }}>
          <video src={videoUrl} controls style={{ width: '100%', maxHeight: 360, background: '#000' }} />
        </div>
      )}
    </div>
  );
}
