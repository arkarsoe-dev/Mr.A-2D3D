import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Live2DData, TabType, ThreeDResponse } from '../types';

type Props = { activeTab: TabType; data: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean };
type BotAction = 'idle' | 'walking' | 'resting' | 'peeking' | 'dancing' | 'thinking';

const phrases = ['လျှောက်သွားနေပါတယ်...', 'စူးစမ်းနေသည်...', 'ဟိုကြည့်ဒီကြည့်...', 'ရလဒ်တွေကို စောင့်ကြည့်နေမယ်'];

export const MrACharacter: React.FC<Props> = ({ activeTab, data, loading2D, loading3D, error2D, error3D }) => {
  const value2D = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';
  const [action, setAction] = useState<BotAction>('idle');
  const [message, setMessage] = useState('မင်္ဂလာပါ! ရလဒ်တွေကို စောင့်ကြည့်နေမယ်');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const last2D = useRef('');
  const timer = useRef<number | null>(null);
  const walkTimer = useRef<number | null>(null);

  const speak = useCallback((text: string, duration = 3000) => {
    setMessage(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(''), duration);
  }, []);

  const wander = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth < 520) return;
    const maxX = Math.max(18, window.innerWidth - 104);
    const maxY = Math.max(100, window.innerHeight - 190);
    const next = { x: 18 + Math.random() * (maxX - 18), y: 70 + Math.random() * (maxY - 70) };
    setPosition(next);
    setAction('walking');
    speak(phrases[Math.floor(Math.random() * phrases.length)], 2200);
    window.setTimeout(() => setAction('idle'), 1700);
  }, [speak]);

  useEffect(() => {
    if (activeTab.startsWith('3d_') || activeTab === '3d_result') { setAction(loading3D ? 'thinking' : error3D ? 'resting' : 'idle'); setMessage(loading3D ? '၃လုံးရလဒ် ရှာနေတယ်' : error3D ? 'ဒေတာ ခဏမရသေးဘူး' : '၃လုံးရလဒ် ကြည့်ကြမယ်'); }
    else if (activeTab === '2d_live') { setAction(loading2D ? 'thinking' : error2D ? 'resting' : 'idle'); setMessage(loading2D ? 'Live ရလဒ် ကြည့်နေတယ်' : error2D ? 'ဒေတာ ခဏမရသေးဘူး' : 'ဒီနေ့ရလဒ်တွေ အဆင်သင့်ပါ'); }
    else if (activeTab === 'group_chat') { setAction('idle'); setMessage('သူငယ်ချင်းတွေနဲ့ စကားပြောကြမယ်'); }
    else if (activeTab === 'tools') { setAction('thinking'); setMessage('အိပ်မက်နဲ့ ဂဏန်းတွေ ကြည့်ကြမယ်'); }
    else { setAction('idle'); setMessage('ရလဒ်တွေကို အေးအေးဆေးဆေး ကြည့်ပါ'); }
  }, [activeTab, loading2D, loading3D, error2D, error3D]);

  useEffect(() => {
    if (!value2D || value2D === last2D.current) return;
    const fresh = Boolean(last2D.current); last2D.current = value2D;
    if (fresh) { setAction('dancing'); speak(`အသစ်ထွက်ပြီ — ${value2D}`, 4200); window.setTimeout(() => setAction('idle'), 4200); }
  }, [value2D, speak]);

  useEffect(() => {
    const schedule = () => { walkTimer.current = window.setTimeout(() => { wander(); schedule(); }, 14000); };
    schedule();
    return () => { if (walkTimer.current) window.clearTimeout(walkTimer.current); if (timer.current) window.clearTimeout(timer.current); };
  }, [wander]);

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

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const handleClick = () => {
    setAction('dancing');
    speak('ကံကောင်းပါစေ! ကကြမယ်', 3000);
    window.setTimeout(() => setAction('idle'), 3000);
  };

  const scale = action === 'peeking' ? 1.7 : 1;
  return <div className={`mra-roaming-bot mra-bot-${action}`} style={{ left: position.x || undefined, top: position.y || undefined, transform: `scale(${scale})` }}>
    {message && <span className="mra-bot-bubble">{message}</span>}
    <button type="button" className="mra-bot-button" onClick={handleClick} aria-label={`Mr.A roaming robot: ${message || 'ကံကောင်းပါစေ'}`} title={message || 'ကံကောင်းပါစေ'}>
      <span className="mra-bot-antenna" />
      <span className="mra-bot-head"><span className="mra-bot-visor"><i style={{ transform: `translate(${eye.x}px, ${eye.y}px)` }} /><i style={{ transform: `translate(${eye.x}px, ${eye.y}px)` }} /></span></span>
      <span className="mra-bot-torso"><span className="mra-bot-arm mra-bot-arm-left" /><span className="mra-bot-chest"><b /><small>2D</small></span><span className="mra-bot-arm mra-bot-arm-right" /></span>
      <span className="mra-bot-legs"><span className="mra-bot-leg mra-bot-leg-left"><em /></span><span className="mra-bot-leg mra-bot-leg-right"><em /></span></span>
    </button>
  </div>;
};
