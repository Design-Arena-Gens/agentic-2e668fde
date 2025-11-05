import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}ffmpeg-core.wasm`, 'application/wasm')
  });
  return ffmpeg;
}

export async function extractMono16kWavFromVideo(file: File): Promise<Uint8Array> {
  const ff = await getFFmpeg();
  await ff.writeFile('input.mp4', await fetchFile(file));
  await ff.exec(['-i', 'input.mp4', '-vn', '-ac', '1', '-ar', '16000', '-sample_fmt', 's16', 'audio.wav']);
  const data = await ff.readFile('audio.wav');
  return new Uint8Array(data as Uint8Array);
}

export async function muxVideoWithAudio(file: File, audioWav: Uint8Array): Promise<Uint8Array> {
  const ff = await getFFmpeg();
  await ff.writeFile('input_video.mp4', await fetchFile(file));
  await ff.writeFile('input_audio.wav', audioWav);
  // re-encode audio to AAC and copy video stream
  await ff.exec(['-i', 'input_video.mp4', '-i', 'input_audio.wav', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', 'output.mp4']);
  const out = await ff.readFile('output.mp4');
  return new Uint8Array(out as Uint8Array);
}
