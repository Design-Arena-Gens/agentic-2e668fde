"use client";
import React, { useState } from 'react';
import useStore from '@/lib/store';
import { muxVideoWithAudio } from '@/lib/ffmpeg';
import { segmentsToSrt } from '@/lib/subtitles';
import { saveAs } from 'file-saver';

export default function ReviewStep() {
  const { videoFile, dubbedWav, segments, setFinalVideo, setSrts } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  async function handleMux() {
    if (!videoFile || !dubbedWav) return;
    setBusy(true);
    setError(null);
    try {
      const mp4 = await muxVideoWithAudio(videoFile, dubbedWav);
      setFinalVideo(mp4);
      const url = URL.createObjectURL(new Blob([mp4], { type: 'video/mp4' }));
      setVideoUrl(url);
      const srtOriginal = segmentsToSrt(segments, false);
      const srtTranslated = segmentsToSrt(segments, true);
      setSrts(srtOriginal, srtTranslated);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? 'Muxing failed');
    } finally {
      setBusy(false);
    }
  }

  function download(type: 'video' | 'srt-original' | 'srt-translated') {
    const st = useStore.getState();
    if (type === 'video' && st.finalVideo) {
      saveAs(new Blob([st.finalVideo], { type: 'video/mp4' }), 'dubbed.mp4');
    } else if (type === 'srt-original' && st.srtOriginal) {
      saveAs(new Blob([st.srtOriginal], { type: 'text/plain' }), 'subtitles.original.srt');
    } else if (type === 'srt-translated' && st.srtTranslated) {
      saveAs(new Blob([st.srtTranslated], { type: 'text/plain' }), 'subtitles.translated.srt');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={handleMux} disabled={!videoFile || !dubbedWav || busy} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3' }}>Generate Final Video</button>
        <button onClick={() => download('video')} disabled={!useStore.getState().finalVideo} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Download MP4</button>
        <button onClick={() => download('srt-original')} disabled={!useStore.getState().srtOriginal} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Download SRT (Original)</button>
        <button onClick={() => download('srt-translated')} disabled={!useStore.getState().srtTranslated} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Download SRT (Translated)</button>
      </div>
      {busy && <div style={{ color: '#b6c2cf' }}>Muxing video and audio (ffmpeg.wasm)...</div>}
      {error && <div style={{ color: '#ff6b6b' }}>{error}</div>}
      {videoUrl && (
        <div>
          <video src={videoUrl} controls style={{ width: '100%', maxHeight: 420 }} />
        </div>
      )}
    </div>
  );
}
