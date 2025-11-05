"use client";
import React from 'react';
import type { StepId } from '@/lib/store';

type Step = { id: StepId; label: string };

export default function Stepper({ steps, current, onChange }: { steps: Step[]; current: StepId; onChange: (s: StepId) => void }) {
  return (
    <nav style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, gap: 8, marginBottom: 16 }}>
      {steps.map((s, i) => {
        const isActive = s.id === current;
        return (
          <button key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid ' + (isActive ? '#8ab4f8' : '#2b3540'),
              background: isActive ? '#111827' : '#0e141b',
              color: isActive ? '#e6edf3' : '#b6c2cf',
              textAlign: 'left'
            }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Step {i + 1}</div>
            <div style={{ fontSize: 14 }}>{s.label}</div>
          </button>
        );
      })}
    </nav>
  );
}
