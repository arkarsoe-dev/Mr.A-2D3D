import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Live2DData, TabType, ThreeDResponse } from '../types';

type Action = 'idle' | 'celebrate' | 'dance' | 'laugh' | 'sad' | 'sleep' | 'wave' | 'think' | 'search' | 'work' | 'talk' | 'watch' | 'reading' | 'surprised' | 'confused' | 'listening' | 'speaking';
type Camera = 'wide' | 'close' | 'profile' | 'jump';
type Props = { activeTab: TabType; data: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean };

const speech: Record<Action, string> = {
  idle: 'Mr.A ဒီမှာရှိတယ်', celebrate: 'အသစ်ထွက်ပြီ!', dance: 'ပျော်လို့ ကနေတယ်!', laugh: 'ဟားဟား!', sad: 'နည်းနည်းဝမ်းနည်းနေတယ်', sleep: 'စောင့်ရင်း အိပ်ချင်လာပြီ', wave: 'မင်္ဂလာပါ!', think: 'စဉ်းစားနေတယ်', search: 'အချက်အလက်ရှာနေတယ်', work: 'တွက်ပေးနေတယ်', talk: 'စကားပြောကြမယ်', watch: 'ရလဒ်ကြည့်နေတယ်', reading: 'အချက်အလက်ဖတ်နေတယ်', surprised: 'အံ့ဩသွားတယ်', confused: 'အချက်အလက်မရှင်းသေးဘူး', listening: 'နားထောင်နေတယ်', speaking: 'ပြောနေတယ်',
};

function contextualAction(tab: TabType, has2D: boolean, loading2D: boolean, loading3D: boolean, error2D: boolean, error3D: boolean): Action {
  if (tab.startsWith('3d_') && loading3D) return 'search';
  if (tab.startsWith('3d_') && error3D) return 'confused';
  if (tab === '2d_live' && loading2D) return 'search';
  if (tab === '2d_live' && error2D) return 'confused';
  if (tab === 'group_chat') return 'talk';
  if (tab === 'ai_chat') return 'think';
  if (tab === 'tools') return 'work';
  if (tab === '2d_history') return 'reading';
  if (tab.startsWith('3d_')) return 'watch';
  return has2D ? 'idle' : 'sleep';
}

function tone(kind: 'good' | 'click' | 'sad') {
  try {
    const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Audio) return;
    const context = new Audio(); const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.frequency.value = kind === 'good' ? 660 : kind === 'sad' ? 180 : 420; oscillator.type = 'sine';
    gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.035, context.currentTime + .02); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .2);
    oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .22);
  } catch { /* Optional sound remains silent when browser policy blocks it. */ }
}

export const MrACharacter: React.FC<Props> = ({ activeTab, data, data3D, loading2D, loading3D, error2D, error3D }) => {
  const value2D = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';
  const baseAction = contextualAction(activeTab, Boolean(value2D), loading2D, loading3D, error2D, error3D);
  const [action, setAction] = useState<Action>(baseAction);
  const [camera, setCamera] = useState<Camera>('wide');
  const [zone, setZone] = useState(0);
  const [message, setMessage] = useState(speech[baseAction]);
  const [pressed, setPressed] = useState(false);
  const last2D = useRef(''); const last3D = useRef(''); const timer = useRef<number | null>(null);
  const zones = useMemo(() => ['zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e'], []);

  const react = (next: Action, text: string, nextCamera: Camera = 'wide') => {
    setAction(next); setMessage(text); setCamera(nextCamera);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const restored = contextualAction(activeTab, Boolean(value2D), loading2D, loading3D, error2D, error3D);
      setAction(restored); setMessage(speech[restored]); setCamera('wide');
    }, 4200);
  };

  useEffect(() => { setAction(baseAction); setMessage(speech[baseAction]); setCamera('wide'); }, [activeTab, baseAction]);
  useEffect(() => {
    if (!value2D || value2D === last2D.current) return;
    const fresh = Boolean(last2D.current); last2D.current = value2D;
    react('celebrate', fresh ? `အသစ်ထွက်ပြီ — ${value2D}` : `Live ထွက်ပြီ — ${value2D}`, 'jump'); tone('good');
  }, [value2D]);
  useEffect(() => {
    const value3D = data3D?.data?.[0]?.result || '';
    if (!value3D || value3D === last3D.current) return;
    const fresh = Boolean(last3D.current); last3D.current = value3D;
    if (fresh && activeTab.startsWith('3d_')) react('surprised', `3D ရလဒ် ${value3D} ကိုတွေ့ပြီ`, 'close');
  }, [data3D, activeTab]);
  useEffect(() => { const id = window.setInterval(() => setZone((z) => (z + 1) % zones.length), 9000); return () => window.clearInterval(id); }, [zones.length]);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  useEffect(() => {
    const onEvent = (event: Event) => { const detail = (event as CustomEvent<{ action?: Action; text?: string }>).detail || {}; const next = detail.action || 'listening'; react(next, detail.text || speech[next]); };
    window.addEventListener('mra:character', onEvent); return () => window.removeEventListener('mra:character', onEvent);
  }, [activeTab, value2D, loading2D, loading3D, error2D, error3D]);

  const onClick = () => {
    setPressed(true); const options: Array<[Action, string, Camera]> = [['wave', 'မင်္ဂလာပါ! နှိပ်ပေးလို့ ကျေးဇူးပါ', 'close'], ['dance', 'ပျော်လို့ ကပြမယ်!', 'jump'], ['laugh', 'ဟားဟား! အရမ်းကောင်းတယ်', 'close'], ['sad', 'ခဏလေး… စိတ်မကောင်းဖြစ်သွားတယ်', 'profile']];
    const picked = options[Math.floor(Math.random() * options.length)]; react(picked[0], picked[1], picked[2]); tone(picked[0] === 'sad' ? 'sad' : 'click'); window.setTimeout(() => setPressed(false), 700);
  };

  return (
    <button type="button" className={`mra-companion ${zones[zone]} mra-action-${action} mra-camera-${camera} ${pressed ? 'is-interacting' : ''}`} onClick={onClick} title={`${message} — Mr.A ကိုနှိပ်ကြည့်ပါ`} aria-label={`Mr.A creature: ${message}`}>
      <span className="mra-companion-bubble">{message}{action === 'celebrate' && <strong className="font-num"> {value2D}</strong>}</span>
      <svg className="mra-creature" viewBox="0 0 100 118" role="img" aria-label="Mr.A digital creature">
        <defs>
          <radialGradient id="mrACreatureBody" cx="35%" cy="20%" r="85%"><stop offset="0" stopColor="#6366f1" /><stop offset=".55" stopColor="#312e81" /><stop offset="1" stopColor="#111827" /></radialGradient>
          <linearGradient id="mrACreatureBelly" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#38bdf8" stopOpacity=".65" /><stop offset="1" stopColor="#a78bfa" stopOpacity=".16" /></linearGradient>
        </defs>
        <g className="mra-creature-core">
          <path className="mra-creature-ear" d="M27 35L18 19Q17 15 22 17L37 27Z" /><path className="mra-creature-ear" d="M73 35L82 19Q83 15 78 17L63 27Z" />
          <path className="mra-creature-body" d="M50 18C28 18 17 32 18 57c1 27 14 42 32 42s31-15 32-42C83 32 72 18 50 18Z" />
          <ellipse className="mra-creature-belly" cx="50" cy="78" rx="20" ry="16" fill="url(#mrACreatureBelly)" />
          <ellipse className="mra-creature-eye" cx="38" cy="48" rx="9" ry="12" /><ellipse className="mra-creature-eye" cx="62" cy="48" rx="9" ry="12" />
          <circle className="mra-creature-pupil" cx="40" cy="50" r="3.2" /><circle className="mra-creature-pupil" cx="64" cy="50" r="3.2" />
          <path className="mra-creature-mouth" d="M43 64 Q50 70 57 64" />
          <path className="mra-creature-limb" d="M23 70Q11 77 16 87" /><path className="mra-creature-limb" d="M77 70Q89 77 84 87" />
          <ellipse className="mra-creature-foot" cx="35" cy="101" rx="10" ry="5" /><ellipse className="mra-creature-foot" cx="65" cy="101" rx="10" ry="5" />
          <circle className="mra-creature-orb" cx="50" cy="79" r="3" /><path className="mra-creature-spark" d="M10 40l3 5 5 1-5 3-1 5-3-5-5-1 5-3z" />
        </g>
      </svg>
    </button>
  );
};
