import React, { useEffect, useState } from 'react';

type Destination = '2d' | '3d' | 'calendar';
type Pose = 'idle' | 'wave' | 'walk' | 'think' | 'dance';
type Props = { twod?: string; loading?: boolean; onNavigate?: (destination: Destination) => void };

export const MrAInlineCharacter: React.FC<Props> = ({ twod = '--', loading = false, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState<Pose>('idle');
  const [brainSpeech, setBrainSpeech] = useState('');
  const display = loading ? '···' : twod || '--';

  const navigate = (destination: Destination) => { onNavigate?.(destination); setOpen(false); };

  useEffect(() => {
    const poses: Pose[] = ['idle', 'wave', 'idle', 'walk', 'think', 'idle', 'dance'];
    let index = 0;
    const timer = window.setInterval(() => { index = (index + 1) % poses.length; setPose(poses[index]); }, 3600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    const onCharacter = (event: Event) => {
      const detail = (event as CustomEvent<{ action?: string; text?: string }>).detail || {};
      const action = detail.action || 'idle';
      const nextPose: Pose = action === 'listening' ? 'wave' : action === 'think' ? 'think' : action === 'speaking' ? 'dance' : action === 'confused' ? 'walk' : action === 'celebrate' ? 'dance' : 'idle';
      setPose(nextPose);
      if (detail.text) {
        setBrainSpeech(detail.text);
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => setBrainSpeech(''), 4200);
      }
    };
    window.addEventListener('mra:character', onCharacter);
    return () => { window.removeEventListener('mra:character', onCharacter); if (timer) window.clearTimeout(timer); };
  }, []);

  return (
    <span className={`mra-inline-character mra-pose-${pose} ${loading ? 'is-loading' : ''} ${open ? 'is-open' : ''} ${brainSpeech ? 'is-speaking' : ''}`} role="group" aria-label={`Mr.A character says ${brainSpeech || `live 2D ${display}`}`}>
      <span className="mra-inline-speech" role="status">
        {open ? <span className="mra-character-menu" role="menu" aria-label="Mr.A result pages">
          <strong>ဘယ်ကို သွားမလဲ?</strong>
          <button type="button" onClick={() => navigate('2d')} role="menuitem">2D Live</button>
          <button type="button" onClick={() => navigate('3d')} role="menuitem">3D Result</button>
          <button type="button" onClick={() => navigate('calendar')} role="menuitem">3D Calendar</button>
        </span> : brainSpeech ? <><span className="mra-live-label">Mr.A</span> <b className="mra-brain-speech">{brainSpeech}</b></> : <><span className="mra-live-label">2D LIVE</span> <b>{display}</b></>}
      </span>
      <button type="button" className="mra-bot-button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Mr.A menu ပိတ်ရန်' : 'Mr.A result pages menu ဖွင့်ရန်'} aria-expanded={open}>
        <span className="mra-bot-antenna" />
        <span className="mra-bot-head"><span className="mra-bot-visor"><i /><i /></span></span>
        <span className="mra-bot-torso"><span className="mra-bot-arm mra-bot-arm-left" /><span className="mra-bot-chest"><b /><small>{brainSpeech ? 'AI' : '2D'}</small></span><span className="mra-bot-arm mra-bot-arm-right" /></span>
        <span className="mra-bot-legs"><span className="mra-bot-leg mra-bot-leg-left"><em /></span><span className="mra-bot-leg mra-bot-leg-right"><em /></span></span>
      </button>
    </span>
  );
};
