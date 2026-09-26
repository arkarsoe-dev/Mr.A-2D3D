import React, { useEffect, useState } from 'react';

type Destination = '2d' | '3d' | 'calendar';
type Props = { twod?: string; loading?: boolean; onNavigate?: (destination: Destination) => void };

export const MrAInlineCharacter: React.FC<Props> = ({ twod = '--', loading = false, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState<'idle' | 'wave' | 'walk' | 'think' | 'dance'>('idle');
  const display = loading ? '···' : twod || '--';
  const navigate = (destination: Destination) => { onNavigate?.(destination); setOpen(false); };
  useEffect(() => { const poses: Array<'idle' | 'wave' | 'walk' | 'think' | 'dance'> = ['idle', 'wave', 'idle', 'walk', 'think', 'idle', 'dance']; let index = 0; const timer = window.setInterval(() => { index = (index + 1) % poses.length; setPose(poses[index]); }, 3600); return () => window.clearInterval(timer); }, []);

  return (
    <span className={`mra-inline-character mra-pose-${pose} ${loading ? 'is-loading' : ''} ${open ? 'is-open' : ''}`} role="group" aria-label={`Mr.A character says live 2D ${display}`}>
      <span className="mra-inline-speech" role="status">
        {open ? <span className="mra-character-menu" role="menu" aria-label="Mr.A result pages">
          <strong>ဘယ်ကို သွားမလဲ?</strong>
          <button type="button" onClick={() => navigate('2d')} role="menuitem">2D Live</button>
          <button type="button" onClick={() => navigate('3d')} role="menuitem">3D Result</button>
          <button type="button" onClick={() => navigate('calendar')} role="menuitem">3D Calendar</button>
        </span> : <><span className="mra-live-label">2D LIVE</span> <b>{display}</b></>}
      </span>
      <button type="button" className="mra-bot-button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Mr.A menu ပိတ်ရန်' : 'Mr.A result pages menu ဖွင့်ရန်'} aria-expanded={open}>
        <span className="mra-bot-antenna" />
        <span className="mra-bot-head"><span className="mra-bot-visor"><i /><i /></span></span>
        <span className="mra-bot-torso"><span className="mra-bot-arm mra-bot-arm-left" /><span className="mra-bot-chest"><b /><small>2D</small></span><span className="mra-bot-arm mra-bot-arm-right" /></span>
        <span className="mra-bot-legs"><span className="mra-bot-leg mra-bot-leg-left"><em /></span><span className="mra-bot-leg mra-bot-leg-right"><em /></span></span>
      </button>
    </span>
  );
};
