import React, { useEffect, useRef, useState } from 'react';
import { Live2DData, TabType, ThreeDResponse } from '../types';

type Props = { activeTab: TabType; data: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean };
type Mood = 'happy' | 'watching' | 'thinking' | 'sleepy' | 'surprised';

export const MrACharacter: React.FC<Props> = ({ activeTab, data, data3D, loading2D, loading3D, error2D, error3D }) => {
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

  return <button type="button" className={`mra-companion mra-firefly mra-firefly-${mood}`} onClick={onClick} title={message} aria-label={`Lucky Firefly: ${message}`}>
    <span className="mra-companion-bubble">{message}</span>
    <svg className="mra-firefly-art" viewBox="0 0 100 108" role="img" aria-label="Lucky Firefly mascot">
      <defs><radialGradient id="fireflyBody" cx="35%" cy="20%"><stop stopColor="#fde68a" /><stop offset=".45" stopColor="#f59e0b" /><stop offset="1" stopColor="#b45309" /></radialGradient><linearGradient id="fireflyWing" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a7f3d0" stopOpacity=".85" /><stop offset="1" stopColor="#38bdf8" stopOpacity=".18" /></linearGradient><filter id="fireflyGlow"><feGaussianBlur stdDeviation="3" /></filter></defs>
      <ellipse cx="50" cy="100" rx="24" ry="4" fill="#22d3ee" opacity=".18" filter="url(#fireflyGlow)" />
      <g className="mra-firefly-core"><path className="mra-firefly-wing" d="M43 48C23 25 8 33 20 58c8 14 20 14 26 5Z" fill="url(#fireflyWing)" /><path className="mra-firefly-wing" d="M57 48C77 25 92 33 80 58c-8 14-20 14-26 5Z" fill="url(#fireflyWing)" /><path d="M50 28c-18 0-25 14-23 34 2 25 12 33 23 33s21-8 23-33c2-20-5-34-23-34Z" fill="url(#fireflyBody)" stroke="#fcd34d" strokeOpacity=".55" /><path d="M35 30c-4-12 3-15 8-4M65 30c4-12-3-15-8-4" fill="none" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" /><circle cx="42" cy="53" r="7" fill="#fff7ed" /><circle cx="58" cy="53" r="7" fill="#fff7ed" /><circle cx="43" cy="54" r="2.8" fill="#172033" /><circle cx="59" cy="54" r="2.8" fill="#172033" /><path d="M43 69q7 7 14 0" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" /><ellipse cx="50" cy="81" rx="9" ry="7" fill="#fde68a" opacity=".9" /><path d="M31 72l-8 9M69 72l8 9M40 94l-4 7M60 94l4 7" stroke="#b45309" strokeWidth="4" strokeLinecap="round" /><circle cx="50" cy="80" r="3" fill="#fff7a8" className="mra-firefly-light" /></g>
      <path d="M15 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fef08a" className="mra-firefly-spark" /><path d="M84 14l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5Z" fill="#a7f3d0" className="mra-firefly-spark" />
    </svg>
  </button>;
};
