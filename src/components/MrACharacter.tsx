import React, { useEffect, useRef, useState } from 'react';
import { Lottie } from 'lottie-react';
import { Live2DData, TabType, ThreeDResponse } from '../types';
import animationData from '../assets/MrA-LottieAnimation.json';

type Props = { activeTab: TabType; data: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean };
type Mood = 'happy' | 'watching' | 'thinking' | 'sleepy' | 'surprised';

export const MrACharacter: React.FC<Props> = ({ activeTab, data, loading2D, loading3D, error2D, error3D }) => {
  const value2D = data?.live?.twod && data.live.twod !== '--' ? data.live.twod : '';
  const [mood, setMood] = useState<Mood>('happy');
  const [message, setMessage] = useState('ကံကောင်းခြင်းလေးတွေ ယူလာပေးမယ်');
  const last2D = useRef('');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (activeTab.startsWith('3d_') || activeTab === '3d_result') { setMood(loading3D ? 'watching' : error3D ? 'thinking' : 'happy'); setMessage(loading3D ? '၃လုံးရလဒ် ရှာနေတယ်' : error3D ? 'ခဏလေးနော်' : '၃လုံးရလဒ် ကြည့်ကြမယ်'); }
    else if (activeTab === '2d_live') { setMood(loading2D ? 'watching' : error2D ? 'thinking' : 'happy'); setMessage(loading2D ? 'Live ရလဒ် ကြည့်နေတယ်' : error2D ? 'ဒေတာ ခဏမရသေးဘူး' : 'ဒီနေ့ရလဒ်တွေ အဆင်သင့်ပါ'); }
    else if (activeTab === 'group_chat') { setMood('happy'); setMessage('သူငယ်ချင်းတွေနဲ့ စကားပြောကြမယ်'); }
    else if (activeTab === 'tools') { setMood('thinking'); setMessage('အိပ်မက်နဲ့ ဂဏန်းတွေ ကြည့်ကြမယ်'); }
    else { setMood('happy'); setMessage('ရလဒ်တွေကို အေးအေးဆေးဆေး ကြည့်ပါ'); }
  }, [activeTab, loading2D, loading3D, error2D, error3D]);

  useEffect(() => {
    if (!value2D || value2D === last2D.current) return;
    const fresh = Boolean(last2D.current); last2D.current = value2D;
    if (fresh) { setMood('surprised'); setMessage(`အသစ်ထွက်ပြီ — ${value2D}`); if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { setMood('happy'); setMessage('နောက်ထပ်ရလဒ်ကို စောင့်ကြည့်နေမယ်'); }, 4200); }
  }, [value2D]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const onClick = () => { setMood('surprised'); setMessage('ကံကောင်းပါစေ'); if (timer.current) window.clearTimeout(timer.current); timer.current = window.setTimeout(() => { setMood('happy'); setMessage('ရလဒ်တွေကို အေးအေးဆေးဆေး ကြည့်ပါ'); }, 2600); };

  return <button type="button" className={`mra-companion mra-firefly mra-firefly-${mood}`} onClick={onClick} title={message} aria-label={`Mr.A Lucky Robot: ${message}`}>
    <span className="mra-companion-bubble">{message}</span>
    <Lottie
      className="mra-firefly-art mra-lottie-art"
      src={animationData}
      loop
      autoplay
      aria-label="Mr.A animated mascot"
    />
  </button>;
};
