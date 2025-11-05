import type { Segment } from './store';
import { getPipeline } from './transformers';

let ttsCache: Record<string, Promise<any>> = {};

function iso639_1_to_3(lang: string): string {
  const map: Record<string, string> = { en: 'eng', hi: 'hin', bn: 'ben' };
  return map[lang] ?? lang;
}

function modelFor(lang: string): string {
  const code3 = iso639_1_to_3(lang);
  return `Xenova/mms-tts-${code3}`;
}

export type SynthChunk = { start: number; text: string; pcm: Float32Array; sampleRate: number };

export async function synthesizeSegments(segments: Segment[], targetLang: string): Promise<SynthChunk[]> {
  const model = modelFor(targetLang);
  if (!ttsCache[model]) {
    ttsCache[model] = getPipeline('text-to-speech', model);
  }
  const tts = await ttsCache[model];

  const out: SynthChunk[] = [];
  for (const seg of segments) {
    const text = (seg.translation ?? '').trim();
    if (!text) continue;
    const res = await tts(text);
    const pcm: Float32Array = res.audio;
    const sampleRate: number = res.sampling_rate ?? res.sample_rate ?? 16000;
    out.push({ start: seg.start, text, pcm, sampleRate });
  }
  return out;
}
