import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type StepId = 'upload' | 'transcribe' | 'translate' | 'voice' | 'mix' | 'review';

export type Segment = {
  start: number;
  end: number;
  text: string;
  speakerId?: string;
  translation?: string;
};

export type Speaker = {
  id: string;
  name: string;
  color: string;
  voiceModel?: string; // TTS model or preset
};

export type AppState = {
  currentStep: StepId;
  setCurrentStep: (s: StepId) => void;

  videoFile: File | null;
  videoUrl: string | null;
  setVideoFile: (f: File | null) => void;

  audioWav: Uint8Array | null; // 16-bit PCM WAV bytes
  setAudioWav: (wav: Uint8Array | null) => void;

  detectedLang: string | null;
  setDetectedLang: (lang: string | null) => void;

  segments: Segment[];
  setSegments: (segs: Segment[]) => void;
  updateSegment: (idx: number, seg: Partial<Segment>) => void;

  targetLang: string | null;
  setTargetLang: (lang: string | null) => void;

  speakers: Speaker[];
  addSpeaker: (s: Partial<Speaker>) => void;
  updateSpeaker: (id: string, s: Partial<Speaker>) => void;

  dubbedWav: Uint8Array | null;
  setDubbedWav: (wav: Uint8Array | null) => void;

  srtOriginal: string | null;
  srtTranslated: string | null;
  setSrts: (orig: string, trans: string) => void;

  finalVideo: Uint8Array | null;
  setFinalVideo: (bytes: Uint8Array | null) => void;
};

function randomColor() {
  const hues = [200, 260, 320, 20, 90, 140];
  const h = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${h}deg 60% 55%)`;
}

const useStore = create<AppState>()(immer((set, get) => ({
  currentStep: 'upload',
  setCurrentStep: (s) => set({ currentStep: s }),

  videoFile: null,
  videoUrl: null,
  setVideoFile: (f) => set({ videoFile: f, videoUrl: f ? URL.createObjectURL(f) : null }),

  audioWav: null,
  setAudioWav: (wav) => set({ audioWav: wav }),

  detectedLang: null,
  setDetectedLang: (lang) => set({ detectedLang: lang }),

  segments: [],
  setSegments: (segs) => set({ segments: segs }),
  updateSegment: (idx, seg) => set((state) => {
    if (idx < 0 || idx >= state.segments.length) return;
    state.segments[idx] = { ...state.segments[idx], ...seg };
  }),

  targetLang: null,
  setTargetLang: (lang) => set({ targetLang: lang }),

  speakers: [
    { id: 'spk-1', name: 'Speaker 1', color: randomColor(), voiceModel: undefined }
  ],
  addSpeaker: (s) => set((state) => {
    const id = `spk-${state.speakers.length + 1}`;
    state.speakers.push({ id, name: s.name ?? `Speaker ${state.speakers.length + 1}`, color: randomColor(), voiceModel: s.voiceModel });
  }),
  updateSpeaker: (id, s) => set((state) => {
    const i = state.speakers.findIndex(x => x.id === id);
    if (i >= 0) state.speakers[i] = { ...state.speakers[i], ...s };
  }),

  dubbedWav: null,
  setDubbedWav: (wav) => set({ dubbedWav: wav }),

  srtOriginal: null,
  srtTranslated: null,
  setSrts: (orig, trans) => set({ srtOriginal: orig, srtTranslated: trans }),

  finalVideo: null,
  setFinalVideo: (bytes) => set({ finalVideo: bytes })
})));

export default useStore;
