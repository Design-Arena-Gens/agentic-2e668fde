import type { Segment } from './store';
import { getPipeline } from './transformers';

let asrPromise: Promise<any> | null = null;

export async function transcribeWav(wavBytes: Uint8Array, opts?: { language?: string }) {
  if (!asrPromise) {
    asrPromise = getPipeline('automatic-speech-recognition', 'Xenova/whisper-base');
  }
  const asr = await asrPromise;
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  const out = await asr(blob, {
    return_timestamps: 'word',
    chunk_length_s: 30,
    stride_length_s: 5,
    language: opts?.language ?? 'auto'
  });
  const segments: Segment[] = [];
  const chunks = (out?.chunks ?? []) as Array<{ text: string; timestamp: [number, number] }>;
  if (chunks.length) {
    for (const ch of chunks) {
      let [start, end] = ch.timestamp;
      if (start == null || end == null) continue;
      segments.push({ start, end, text: ch.text.trim() });
    }
  } else if (Array.isArray(out?.segments)) {
    for (const s of out.segments) {
      if (s.start == null || s.end == null) continue;
      segments.push({ start: s.start, end: s.end, text: (s.text ?? '').trim() });
    }
  } else if (typeof out?.text === 'string') {
    segments.push({ start: 0, end: 0, text: out.text.trim() });
  }
  const language = (out?.language ?? null) as string | null;
  return { segments, language };
}
