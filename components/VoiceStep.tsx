"use client";
import React from 'react';
import useStore from '@/lib/store';

export default function VoiceStep() {
  const { speakers, addSpeaker, updateSpeaker, segments, updateSegment, setCurrentStep } = useStore();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}>
      <div style={{ border: '1px solid #1b2430', borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 14 }}>Speakers</h3>
          <button onClick={() => addSpeaker({})} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #2b3540', background: '#0e141b', color: '#e6edf3' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {speakers.map(spk => (
            <div key={spk.id} style={{ padding: 8, border: '1px solid #2b3540', borderRadius: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: 10, background: spk.color }} />
                <input value={spk.name} onChange={e => updateSpeaker(spk.id, { name: e.target.value })} style={{ flex: 1, background: '#0e141b', color: '#e6edf3', border: '1px solid #2b3540', borderRadius: 6, padding: '6px 8px' }} />
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ fontSize: 12, color: '#b6c2cf' }}>Voice preset</label>
                <select value={spk.voiceModel ?? 'default'} onChange={e => updateSpeaker(spk.id, { voiceModel: e.target.value })} style={{ width: '100%', background: '#0e141b', color: '#e6edf3', border: '1px solid #2b3540', borderRadius: 6, padding: '6px 8px' }}>
                  <option value="default">Default</option>
                  <option value="bright">Bright</option>
                  <option value="warm">Warm</option>
                </select>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => setCurrentStep('mix')} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #2b3540', background: '#123155', color: '#e6edf3', width: '100%' }}>Continue</button>
        </div>
      </div>
      <div style={{ border: '1px solid #1b2430', borderRadius: 8, padding: 12, maxHeight: 520, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #2b3540' }}>
              <th style={{ padding: 8 }}>Time</th>
              <th style={{ padding: 8 }}>Text</th>
              <th style={{ padding: 8 }}>Translated</th>
              <th style={{ padding: 8 }}>Speaker</th>
            </tr>
          </thead>
          <tbody>
            {segments.map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1b2430' }}>
                <td style={{ padding: 8, whiteSpace: 'nowrap' }}>{s.start.toFixed(2)}?{s.end.toFixed(2)}s</td>
                <td style={{ padding: 8 }}>{s.text}</td>
                <td style={{ padding: 8 }}>{s.translation}</td>
                <td style={{ padding: 8 }}>
                  <select value={s.speakerId ?? speakers[0]?.id} onChange={e => updateSegment(i, { speakerId: e.target.value })} style={{ background: '#0e141b', color: '#e6edf3', border: '1px solid #2b3540', borderRadius: 6, padding: '6px 8px' }}>
                    {speakers.map(sp => (<option key={sp.id} value={sp.id}>{sp.name}</option>))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
