import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Live2DData, TabType } from '../types';

type CharacterAction = 'idle' | 'celebrate' | 'dance' | 'laugh' | 'sad' | 'sleep' | 'wave' | 'think' | 'search' | 'work' | 'talk' | 'watch';
type CameraMode = 'wide' | 'close' | 'profile' | 'jump';

type Props = { activeTab: TabType; data: Live2DData | null };

const actionText: Record<CharacterAction, string> = {
  idle: 'Mr.A ဒီမှာရှိတယ်', celebrate: 'အသစ်ထွက်ပြီ!', dance: 'ပျော်လို့ ကနေတယ်!', laugh: 'ဟားဟား!', sad: 'နည်းနည်းဝမ်းနည်းနေတယ်',
  sleep: 'စောင့်ရင်း အိပ်ချင်လာပြီ', wave: 'မင်္ဂလာပါ!', think: 'စဉ်းစားနေတယ်', search: 'မှတ်တမ်းရှာနေတယ်', work: 'တွက်ပေးနေတယ်', talk: 'စကားပြောကြမယ်', watch: 'ရလဒ်ကြည့်နေတယ်',
};

function screenAction(activeTab: TabType, hasLive: boolean): CharacterAction {
  if (activeTab === 'group_chat') return 'talk';
  if (activeTab === 'ai_chat') return 'think';
  if (activeTab === 'tools') return 'work';
  if (activeTab === '2d_history') return 'search';
  if (activeTab.startsWith('3d_')) return 'watch';
  return hasLive ? 'idle' : 'sleep';
}

function playTone(kind: 'celebrate' | 'click' | 'sad') {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = kind === 'celebrate' ? 720 : kind === 'sad' ? 190 : 430;
    gain.gain.setValueAtTime(.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.045, ctx.currentTime + .02);
    gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .22);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + .24);
  } catch { /* Audio is optional and may be blocked until interaction. */ }
}

export const MascotCompanion: React.FC<Props> = ({ activeTab, data }) => {
  const twod = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';
  const baseAction = screenAction(activeTab, Boolean(twod));
  const [action, setAction] = useState<CharacterAction>(baseAction);
  const [camera, setCamera] = useState<CameraMode>('wide');
  const [zone, setZone] = useState(0);
  const [speech, setSpeech] = useState(actionText[baseAction]);
  const [isInteracting, setIsInteracting] = useState(false);
  const lastTwod = useRef('');
  const transientTimer = useRef<number | null>(null);
  const roamZones = useMemo(() => ['zone-a', 'zone-b', 'zone-c', 'zone-d', 'zone-e'], []);

  const perform = (nextAction: CharacterAction, message: string, nextCamera: CameraMode = 'wide') => {
    setAction(nextAction);
    setSpeech(message);
    setCamera(nextCamera);
    if (transientTimer.current) window.clearTimeout(transientTimer.current);
    transientTimer.current = window.setTimeout(() => {
      setAction(screenAction(activeTab, Boolean(twod)));
      setSpeech(actionText[screenAction(activeTab, Boolean(twod))]);
      setCamera('wide');
    }, 5200);
  };

  useEffect(() => {
    setAction(baseAction);
    setSpeech(actionText[baseAction]);
    setCamera('wide');
  }, [activeTab, baseAction]);

  useEffect(() => {
    if (!twod || lastTwod.current === twod) return;
    const isNew = Boolean(lastTwod.current);
    lastTwod.current = twod;
    perform('celebrate', isNew ? `အသစ်ထွက်ပြီ — ${twod}` : `Live ထွက်ပြီ — ${twod}`, 'jump');
    playTone('celebrate');
  }, [twod]);

  useEffect(() => {
    const timer = window.setInterval(() => setZone((value) => (value + 1) % roamZones.length), 7000);
    return () => window.clearInterval(timer);
  }, [roamZones.length]);

  useEffect(() => () => { if (transientTimer.current) window.clearTimeout(transientTimer.current); }, []);

  const handleClick = () => {
    setIsInteracting(true);
    const reactions: Array<[CharacterAction, string, CameraMode]> = [
      ['wave', 'မင်္ဂလာပါ! နှိပ်ပေးလို့ ကျေးဇူးပါ', 'close'],
      ['dance', 'ပျော်လို့ ကပြမယ်!', 'jump'],
      ['laugh', 'ဟားဟား! အရမ်းကောင်းတယ်', 'close'],
      ['sad', 'ခဏလေး… စိတ်မကောင်းဖြစ်သွားတယ်', 'profile'],
    ];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    perform(reaction[0], reaction[1], reaction[2]);
    playTone(reaction[0] === 'sad' ? 'sad' : 'click');
    window.setTimeout(() => setIsInteracting(false), 750);
  };

  return (
    <button
      type="button"
      className={`mra-companion ${roamZones[zone]} mra-action-${action} mra-camera-${camera} ${isInteracting ? 'is-interacting' : ''}`}
      onClick={handleClick}
      title={`${speech} — Mr.A ကိုနှိပ်ပြီး reaction ကြည့်ပါ`}
      aria-label={`Mr.A character: ${speech}`}
    >
      <span className="mra-companion-bubble">{speech}{action === 'celebrate' && <strong className="font-num"> {twod}</strong>}</span>
      <svg className="mra-character" viewBox="0 0 92 108" role="img" aria-label="Animated Mr.A character">
        <defs>
          <linearGradient id="mrABody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#263c5a" /><stop offset="1" stopColor="#0b172a" /></linearGradient>
          <linearGradient id="mrAAccent" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
        </defs>
        <g className="mra-character-float">
          <path className="mra-character-antenna" d="M46 18V8" /><circle className="mra-character-signal" cx="46" cy="6" r="4" />
          <rect className="mra-character-head" x="16" y="17" width="60" height="48" rx="17" fill="url(#mrABody)" />
          <rect className="mra-character-face" x="23" y="25" width="46" height="29" rx="11" />
          <circle className="mra-character-eye" cx="37" cy="39" r="4" /><circle className="mra-character-eye" cx="55" cy="39" r="4" />
          <path className="mra-character-mouth" d="M39 48 Q46 54 53 48" />
          <path className="mra-character-tears" d="M34 45l-2 10M58 45l2 10" />
          <text className="mra-character-z" x="69" y="20">Z</text>
          <path className="mra-character-neck" d="M39 65V70M53 65V70" /><rect className="mra-character-body" x="25" y="69" width="42" height="30" rx="11" fill="url(#mrABody)" />
          <path className="mra-character-badge" d="M46 76l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="url(#mrAAccent)" />
          <path className="mra-character-arm mra-character-arm-left" d="M25 76L10 86" /><path className="mra-character-arm mra-character-arm-right" d="M67 76L82 67" />
          <circle className="mra-character-hand" cx="10" cy="86" r="4" /><circle className="mra-character-hand" cx="82" cy="67" r="4" />
        </g>
      </svg>
      <span className="mra-confetti" aria-hidden="true">✦</span>
    </button>
  );
};
