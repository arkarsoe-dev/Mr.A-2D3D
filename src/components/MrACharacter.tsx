import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Live2DData, TabType, ThreeDResponse } from '../types';

type Props = { activeTab: TabType; data: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean };
type BotAction = 'idle' | 'walking' | 'resting' | 'peeking' | 'dancing' | 'thinking' | 'waving' | 'pointing' | 'confused' | 'fallen';
type BrainEvent = 'focus' | 'loading' | 'result2d' | 'result3d' | 'error' | 'tab' | 'click';

const defaultPosition = { x: 48, y: 34 };

export const MrACharacter: React.FC<Props> = ({ activeTab, data, data3D, loading2D, loading3D, error2D, error3D }) => {
  const value2D = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';
  const value3D = data3D?.data?.[0]?.result || '';
  const [action, setAction] = useState<BotAction>('idle');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState(defaultPosition);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const last2D = useRef('');
  const last3D = useRef('');
  const messageTimer = useRef<number | null>(null);
  const actionTimer = useRef<number | null>(null);
  const poseIndex = useRef(0);

  const speak = useCallback((text: string, duration = 3200) => {
    setMessage(text);
    if (messageTimer.current) window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(''), duration);
  }, []);

  const moveTo = useCallback((next: { x: number; y: number }, nextAction: BotAction, text: string, duration = 3000) => {
    const x = Math.max(8, Math.min(window.innerWidth - 108, next.x));
    const y = Math.max(8, Math.min(window.innerHeight - 180, next.y));
    setPosition({ x, y });
    setAction(nextAction);
    speak(text, duration);
    if (actionTimer.current) window.clearTimeout(actionTimer.current);
    actionTimer.current = window.setTimeout(() => setAction('idle'), Math.min(duration, 3600));
  }, [speak]);

  const brain = useCallback((event: BrainEvent, text?: string, target?: HTMLElement | null) => {
    if (event === 'focus' && target) {
      const rect = target.getBoundingClientRect();
      moveTo({ x: rect.left + rect.width / 2 - 50, y: rect.bottom + 16 }, 'peeking', text || 'ရှာဖွေနေတာကို ကြည့်နေတယ်', 3000);
      return;
    }
    if (event === 'loading') { moveTo({ x: Math.max(42, window.innerWidth * .32), y: 92 }, 'thinking', text || 'ဒေတာကို စစ်ဆေးနေတယ်...', 2800); return; }
    if (event === 'result2d' || event === 'result3d') { moveTo({ x: Math.max(42, window.innerWidth * .42), y: 112 }, 'dancing', text || 'ရလဒ်အသစ် ထွက်လာပြီ!', 4200); return; }
    if (event === 'error') { moveTo({ x: 44, y: 70 }, 'confused', text || 'ခဏလေးနော်၊ ဒေတာ ပြန်ရှာနေတယ်', 3600); return; }
    if (event === 'tab') { moveTo({ x: 48, y: 34 }, 'waving', text || 'ဒီ screen ကို အတူကြည့်မယ်', 2600); return; }
    moveTo(position, 'dancing', text || 'ကံကောင်းပါစေ!', 2600);
  }, [moveTo, position]);

  // The free-plan brain is event-driven: UI intent + API state determine movement and expression.
  useEffect(() => {
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
      const hint = target.getAttribute('placeholder') || (activeTab.startsWith('3d_') ? '၃လုံးရလဒ် ရှာနေတယ်' : 'ရှာဖွေနေတာကို ကြည့်နေတယ်');
      brain('focus', hint, target);
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, [activeTab, brain]);

  useEffect(() => {
    const initialLoad = !last2D.current && !last3D.current;
    if ((loading2D && activeTab === '2d_live') || (loading3D && activeTab.startsWith('3d_'))) {
      if (initialLoad) { setAction('thinking'); speak(activeTab.startsWith('3d_') ? '၃လုံးရလဒ် ရှာနေတယ်...' : 'Live 2D ဒေတာ ရယူနေတယ်...', 2800); }
      else brain('loading', activeTab.startsWith('3d_') ? '၃လုံးရလဒ် ရှာနေတယ်...' : 'Live 2D ဒေတာ ရယူနေတယ်...');
    }
    else if ((error2D && activeTab === '2d_live') || (error3D && activeTab.startsWith('3d_'))) brain('error');
  }, [activeTab, loading2D, loading3D, error2D, error3D, brain]);

  useEffect(() => {
    if (value2D && value2D !== last2D.current) {
      const fresh = Boolean(last2D.current); last2D.current = value2D;
      if (fresh) brain('result2d', `2D ရလဒ် ${value2D} ထွက်ပြီ!`);
    }
  }, [value2D, brain]);

  useEffect(() => {
    if (value3D && value3D !== last3D.current) {
      const fresh = Boolean(last3D.current); last3D.current = value3D;
      if (fresh) brain('result3d', `3D ရလဒ် ${value3D} ထွက်ပြီ!`);
    }
  }, [value3D, brain]);

  useEffect(() => {
    if (last2D.current || last3D.current) brain('tab', activeTab.startsWith('3d_') ? '3D screen ကို အတူကြည့်မယ်' : activeTab === '2d_live' ? '2D Live ကို စောင့်ကြည့်နေမယ်' : 'ဒီနေရာမှာ ကူညီပေးမယ်');
  // Tab changes intentionally trigger one small contextual movement.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (action === 'peeking' || action === 'dancing') return;
      const rect = document.querySelector('.mra-roaming-bot')?.getBoundingClientRect();
      if (!rect) return;
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + 30);
      const distance = Math.min(3, Math.hypot(dx, dy) / 70);
      const angle = Math.atan2(dy, dx);
      setEye({ x: Math.cos(angle) * distance, y: Math.sin(angle) * distance });
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [action]);

  useEffect(() => () => { if (messageTimer.current) window.clearTimeout(messageTimer.current); if (actionTimer.current) window.clearTimeout(actionTimer.current); }, []);

  const handleClick = () => {
    const poses: Array<{ action: BotAction; message: string }> = [
      { action: 'waving', message: 'ဟယ်လို! ကံကောင်းပါစေ' },
      { action: 'pointing', message: 'ဒီမှာ ရလဒ်တွေ ရှိတယ်' },
      { action: 'fallen', message: 'အိုး... ခဏနားလိုက်ဦးမယ်' },
      { action: 'dancing', message: 'ရလဒ်ထွက်ပြီ! ကကြမယ်' },
    ];
    const pose = poses[poseIndex.current % poses.length];
    poseIndex.current += 1;
    moveTo(position, pose.action, pose.message, 2600);
  };
  const scale = action === 'peeking' ? 1.12 : 1;
  return <div className={`mra-roaming-bot mra-bot-${action}`} style={{ left: position.x, top: position.y, transform: `scale(${scale})` }}>
    {message && <span className="mra-bot-bubble">{message}</span>}
    <button type="button" className="mra-bot-button" onClick={handleClick} aria-label={`Mr.A roaming robot: ${message || 'Mr.A logo အနားမှာ ရှိနေသည်'}`} title={message || 'Mr.A logo အနားမှာ ရှိနေသည်'}>
      <span className="mra-bot-antenna" />
      <span className="mra-bot-head"><span className="mra-bot-visor"><i style={{ transform: `translate(${eye.x}px, ${eye.y}px)` }} /><i style={{ transform: `translate(${eye.x}px, ${eye.y}px)` }} /></span></span>
      <span className="mra-bot-torso"><span className="mra-bot-arm mra-bot-arm-left" /><span className="mra-bot-chest"><b /><small>{activeTab.startsWith('3d_') ? '3D' : '2D'}</small></span><span className="mra-bot-arm mra-bot-arm-right" /></span>
      <span className="mra-bot-legs"><span className="mra-bot-leg mra-bot-leg-left"><em /></span><span className="mra-bot-leg mra-bot-leg-right"><em /></span></span>
    </button>
  </div>;
};
