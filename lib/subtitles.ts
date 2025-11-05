import type { Segment } from './store';

function toSrtTimestamp(seconds: number): string {
  const ms = Math.max(0, Math.floor(seconds * 1000));
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const milli = ms % 1000;
  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(milli, 3)}`;
}

export function segmentsToSrt(segments: Segment[], useTranslation: boolean): string {
  let idx = 1;
  const lines: string[] = [];
  for (const seg of segments) {
    const text = (useTranslation ? seg.translation : seg.text) ?? '';
    if (!text.trim()) continue;
    lines.push(String(idx++));
    lines.push(`${toSrtTimestamp(seg.start)} --> ${toSrtTimestamp(seg.end)}`);
    lines.push(text.trim());
    lines.push('');
  }
  return lines.join('\n');
}
