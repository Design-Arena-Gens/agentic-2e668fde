import type { Segment } from './store';
import { getPipeline } from './transformers';

let cached: Record<string, Promise<any>> = {};

function modelFor(src: string, tgt: string): string {
  const pair = `${src}-${tgt}`;
  switch (pair) {
    case 'en-hi': return 'Helsinki-NLP/opus-mt-en-hi';
    case 'hi-en': return 'Helsinki-NLP/opus-mt-hi-en';
    case 'en-bn': return 'Helsinki-NLP/opus-mt-en-bn';
    case 'bn-en': return 'Helsinki-NLP/opus-mt-bn-en';
    case 'hi-bn': return 'Helsinki-NLP/opus-mt-hi-bn';
    case 'bn-hi': return 'Helsinki-NLP/opus-mt-bn-hi';
    default: return 'Helsinki-NLP/opus-mt-en-hi';
  }
}

export async function translateSegments(segments: Segment[], srcLang: string, tgtLang: string): Promise<string[]> {
  const model = modelFor(srcLang, tgtLang);
  if (!cached[model]) cached[model] = getPipeline('translation', model);
  const translator = await cached[model];

  const outputs: string[] = [];
  for (const seg of segments) {
    const text = seg.text?.trim() ?? '';
    if (!text) { outputs.push(''); continue; }
    const res = await translator(text);
    const outText = Array.isArray(res) ? res[0]?.translation_text ?? '' : (res?.translation_text ?? '');
    outputs.push(outText);
  }
  return outputs;
}
