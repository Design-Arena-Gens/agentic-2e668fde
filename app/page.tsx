'use client';

import { useState } from 'react';
import Uploader from '@/components/Uploader';
import TranscribeStep from '@/components/TranscribeStep';
import TranslateStep from '@/components/TranslateStep';
import VoiceStep from '@/components/VoiceStep';
import MixStep from '@/components/MixStep';
import ReviewStep from '@/components/ReviewStep';
import Stepper from '@/components/Stepper';
import useStore from '@/lib/store';

export default function Page() {
  const { currentStep, setCurrentStep, videoFile } = useStore();

  const steps = [
    { id: 'upload', label: 'Upload' },
    { id: 'transcribe', label: 'Transcribe' },
    { id: 'translate', label: 'Translate' },
    { id: 'voice', label: 'Voices' },
    { id: 'mix', label: 'Mix' },
    { id: 'review', label: 'Review & Export' }
  ] as const;

  return (
    <main>
      <Stepper steps={steps as any} current={currentStep} onChange={setCurrentStep} />
      {currentStep === 'upload' && <Uploader />}
      {currentStep === 'transcribe' && <TranscribeStep />}
      {currentStep === 'translate' && <TranslateStep />}
      {currentStep === 'voice' && <VoiceStep />}
      {currentStep === 'mix' && <MixStep />}
      {currentStep === 'review' && <ReviewStep />}
    </main>
  );
}
