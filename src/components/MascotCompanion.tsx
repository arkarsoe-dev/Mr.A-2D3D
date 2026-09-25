import React, { useEffect, useRef, useState } from 'react';
import { Live2DData, TabType } from '../types';

interface MascotCompanionProps {
  activeTab: TabType;
  data: Live2DData | null;
}

type MascotMood = 'excited' | 'waiting' | 'searching' | 'social' | 'thinking' | 'working' | 'watching';

function getMood(activeTab: TabType, data: Live2DData | null): MascotMood {
  if (activeTab === 'group_chat') return 'social';
  if (activeTab === 'ai_chat') return 'thinking';
  if (activeTab === 'tools') return 'working';
  if (activeTab === '2d_history') return 'searching';
  if (activeTab.startsWith('3d_')) return 'watching';
  return data?.live?.twod && data.live.twod !== '--' ? 'excited' : 'waiting';
}

const moodCopy: Record<MascotMood, string> = {
  excited: 'Live ထွက်ပြီ!',
  waiting: 'Live စောင့်နေတယ်',
  searching: 'မှတ်တမ်းရှာနေတယ်',
  social: 'စကားပြောကြမယ်',
  thinking: 'စဉ်းစားနေတယ်',
  working: 'တွက်ပေးနေတယ်',
  watching: 'ရလဒ်ကြည့်နေတယ်',
};

export const MascotCompanion: React.FC<MascotCompanionProps> = ({ activeTab, data }) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const lastTwod = useRef('');
  const mood = getMood(activeTab, data);
  const twod = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';

  useEffect(() => {
    if (!twod || lastTwod.current === twod) return;
    const isNewResult = Boolean(lastTwod.current);
    lastTwod.current = twod;
    setAnnouncement(isNewResult ? `အသစ်ထွက်ပြီ — ${twod}` : `Live ထွက်ပြီ! ${twod}`);
    const timer = window.setTimeout(() => setAnnouncement(null), 6500);
    return () => window.clearTimeout(timer);
  }, [twod]);

  return (
    <button
      type="button"
      className={`mra-companion mra-companion-${mood} ${isInteracting ? 'is-interacting' : ''}`}
      onClick={() => setIsInteracting((value) => !value)}
      title={`${moodCopy[mood]} — Mr.A ကိုနှိပ်ကြည့်ပါ`}
      aria-label={`Mr.A mascot: ${moodCopy[mood]}`}
    >
      <span className="mra-companion-bubble">
        {announcement || moodCopy[mood]}
        {!announcement && mood === 'excited' && <strong className="font-num"> {twod}</strong>}
      </span>
      <svg className="mra-character" viewBox="0 0 92 108" role="img" aria-label="Mr.A animated notification character">
        <defs>
          <linearGradient id="mrABody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#263c5a" />
            <stop offset="1" stopColor="#0b172a" />
          </linearGradient>
          <linearGradient id="mrAAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <g className="mra-character-float">
          <path className="mra-character-antenna" d="M46 18V8" />
          <circle className="mra-character-signal" cx="46" cy="6" r="4" />
          <rect className="mra-character-head" x="16" y="17" width="60" height="48" rx="17" fill="url(#mrABody)" />
          <rect className="mra-character-face" x="23" y="25" width="46" height="29" rx="11" />
          <circle className="mra-character-eye" cx="37" cy="39" r="4" />
          <circle className="mra-character-eye" cx="55" cy="39" r="4" />
          <path className="mra-character-mouth" d="M39 48 Q46 54 53 48" />
          <path className="mra-character-neck" d="M39 65V70M53 65V70" />
          <rect className="mra-character-body" x="25" y="69" width="42" height="30" rx="11" fill="url(#mrABody)" />
          <path className="mra-character-badge" d="M46 76l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="url(#mrAAccent)" />
          <path className="mra-character-arm mra-character-arm-left" d="M25 76L10 86" />
          <path className="mra-character-arm mra-character-arm-right" d="M67 76L82 67" />
          <circle className="mra-character-hand" cx="10" cy="86" r="4" />
          <circle className="mra-character-hand" cx="82" cy="67" r="4" />
        </g>
      </svg>
    </button>
  );
};
