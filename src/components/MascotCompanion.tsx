import React, { useState } from 'react';
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
  const mood = getMood(activeTab, data);
  const twod = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';

  return (
    <button
      type="button"
      className={`mra-companion mra-companion-${mood} ${isInteracting ? 'is-interacting' : ''}`}
      onClick={() => setIsInteracting((value) => !value)}
      title={`${moodCopy[mood]} — Mr.A ကိုနှိပ်ကြည့်ပါ`}
      aria-label={`Mr.A mascot: ${moodCopy[mood]}`}
    >
      <span className="mra-companion-bubble">
        {moodCopy[mood]}
        {mood === 'excited' && <strong className="font-num"> {twod}</strong>}
      </span>
      <span className="mra-mascot" aria-hidden="true">
        <span className="mra-mascot-antenna" />
        <span className="mra-mascot-head">
          <span className="mra-mascot-eye mra-mascot-eye-left" />
          <span className="mra-mascot-eye mra-mascot-eye-right" />
          <span className="mra-mascot-smile" />
        </span>
        <span className="mra-mascot-body" />
        <span className="mra-mascot-arm mra-mascot-arm-left" />
        <span className="mra-mascot-arm mra-mascot-arm-right" />
      </span>
    </button>
  );
};
