import type { SynthChunk } from './tts';

export async function decodeWavToAudioBuffer(wavBytes: Uint8Array): Promise<AudioBuffer> {
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  const arrayBuffer = await blob.arrayBuffer();
  const ctx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(1, 1, 44100);
  // Use a temporary context to access decodeAudioData
  const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await ac.decodeAudioData(arrayBuffer);
  ac.close();
  return audioBuffer;
}

export function encodeWavFromFloat32(float32: Float32Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + float32.length * bytesPerSample);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }
  function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + float32.length * bytesPerSample, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, float32.length * bytesPerSample, true);
  floatTo16BitPCM(view, 44, float32);
  return new Uint8Array(buffer);
}

export async function mixWithDucking(backgroundWav: Uint8Array, synth: SynthChunk[], opts?: { duckGain?: number; sampleRate?: number }): Promise<Uint8Array> {
  const targetSampleRate = opts?.sampleRate ?? 48000;
  const duckGain = opts?.duckGain ?? 0.35;

  // Decode background
  const acDecode = new (window.AudioContext || (window as any).webkitAudioContext)();
  const ab = await new Blob([backgroundWav], { type: 'audio/wav' }).arrayBuffer();
  const bgBuffer = await acDecode.decodeAudioData(ab);
  await acDecode.close();

  // Estimate total length
  const lastChunkEnd = synth.reduce((m, c) => Math.max(m, c.start + c.pcm.length / c.sampleRate), 0);
  const totalSeconds = Math.max(bgBuffer.duration, lastChunkEnd + 0.5);

  const length = Math.ceil(totalSeconds * targetSampleRate);
  const offline = new OfflineAudioContext({ length, sampleRate: targetSampleRate, numberOfChannels: 2 });

  // Background routing
  const bgSource = offline.createBufferSource();
  // Resample background to target using copy to buffer
  const bg = offline.createBuffer(bgBuffer.numberOfChannels, Math.ceil(bgBuffer.duration * targetSampleRate), targetSampleRate);
  for (let ch = 0; ch < bgBuffer.numberOfChannels; ch++) {
    const src = bgBuffer.getChannelData(ch);
    const dst = bg.getChannelData(ch);
    // Simple resample
    for (let i = 0; i < dst.length; i++) {
      const t = i / targetSampleRate;
      const srcIndex = Math.min(src.length - 1, Math.round(t * bgBuffer.sampleRate));
      dst[i] = src[srcIndex];
    }
  }
  bgSource.buffer = bg;
  const bgGain = offline.createGain();
  bgGain.gain.value = 1.0;
  bgSource.connect(bgGain).connect(offline.destination);

  // Schedule ducking
  for (const chunk of synth) {
    const start = chunk.start;
    const dur = chunk.pcm.length / chunk.sampleRate;
    const attack = 0.06;
    const release = 0.12;
    const t0 = Math.max(0, start - attack);
    const t1 = start;
    const t2 = start + dur;
    const t3 = t2 + release;
    bgGain.gain.setValueAtTime(bgGain.gain.value, t0);
    bgGain.gain.linearRampToValueAtTime(duckGain, t1);
    bgGain.gain.setValueAtTime(duckGain, t2);
    bgGain.gain.linearRampToValueAtTime(1.0, t3);
  }

  // Place TTS chunks
  for (const chunk of synth) {
    // Convert PCM to AudioBuffer (mono)
    const mono = offline.createBuffer(1, Math.ceil(chunk.pcm.length * targetSampleRate / chunk.sampleRate), targetSampleRate);
    const dst = mono.getChannelData(0);
    // Resample simple nearest-neighbor
    for (let i = 0; i < dst.length; i++) {
      const srcIndex = Math.min(chunk.pcm.length - 1, Math.round(i * (chunk.sampleRate / targetSampleRate)));
      dst[i] = chunk.pcm[srcIndex];
    }
    const srcNode = offline.createBufferSource();
    srcNode.buffer = mono;
    // Center voice mono in stereo
    const merger = offline.createChannelMerger(2);
    const splitter = offline.createChannelSplitter(2);
    const voiceGainL = offline.createGain();
    const voiceGainR = offline.createGain();
    voiceGainL.gain.value = 0.85;
    voiceGainR.gain.value = 0.85;
    srcNode.connect(splitter);
    // Use same mono to both channels
    srcNode.connect(voiceGainL);
    srcNode.connect(voiceGainR);
    voiceGainL.connect(merger, 0, 0);
    voiceGainR.connect(merger, 0, 1);
    merger.connect(offline.destination);

    srcNode.start(chunk.start);
  }

  bgSource.start(0);
  const rendered = await offline.startRendering();

  // Mix down to mono and encode WAV 16-bit
  const mixedMono = new Float32Array(rendered.length);
  const L = rendered.getChannelData(0);
  const R = rendered.numberOfChannels > 1 ? rendered.getChannelData(1) : L;
  for (let i = 0; i < rendered.length; i++) mixedMono[i] = (L[i] + R[i]) * 0.5;

  return encodeWavFromFloat32(mixedMono, targetSampleRate);
}
