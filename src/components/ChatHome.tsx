import React, { useEffect, useRef, useState } from 'react';
import { Activity, Bot, CalendarDays, ChevronRight, Clock3, Hash, Loader2, RefreshCw, Send, Sparkles, TrendingUp, Trophy, UserRound, Wifi } from 'lucide-react';
import { Live2DData, NumeralMode, ThreeDResponse } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';
import { MrAInlineCharacter } from './MrAInlineCharacter';

type Props = { data2D: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean; numeralMode: NumeralMode; onToggleNumeral: () => void; onRefresh: () => void; refreshing: boolean };
type Entry = { id: string; role: 'assistant' | 'user'; text?: string; card?: '2d' | '3d' | 'sessions' | 'calendar'; data?: unknown; time: string };

const timeLabel = () => new Date().toLocaleTimeString('my-MM', { hour: 'numeric', minute: '2-digit' });
const starterText = 'မင်္ဂလာပါ။ Mr.A Brain က 2D/3D Live data၊ ထီမှတ်တမ်းနဲ့ တွက်နည်းတွေကို တစ်နေရာတည်းမှာ ရှင်းပြပေးမယ်။ ဘာကိုကြည့်ချင်လဲ မေးလိုက်ပါ။';

export const ChatHome: React.FC<Props> = ({ data2D, data3D, loading2D, loading3D, error2D, error3D, numeralMode, onToggleNumeral, onRefresh, refreshing }) => {
  const [entries, setEntries] = useState<Entry[]>([{ id: 'welcome', role: 'assistant', text: starterText, time: timeLabel() }]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [last2D, setLast2D] = useState('');
  const [last3D, setLast3D] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const addEntry = (entry: Omit<Entry, 'id' | 'time'>) => setEntries((prev) => [...prev, { ...entry, id: `${Date.now()}-${Math.random()}`, time: timeLabel() }]);
  const scrollDown = () => window.setTimeout(() => { if (feedRef.current) feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }); }, 40);

  useEffect(() => { const next = data2D?.live?.twod || '--'; if (next !== '--') setLast2D(next); }, [data2D]);
  useEffect(() => { const result = data3D?.data?.[0]?.result; if (result) setLast3D(result); }, [data3D]);
  useEffect(() => { scrollDown(); }, [entries.length, thinking]);

  const answerFor = (question: string): { text: string; card?: Entry['card']; data?: unknown } => {
    const q = question.toLowerCase();
    if (q.includes('3d') || q.includes('၃လုံး') || q.includes('အာကာ')) return { text: '3D မှတ်တမ်းထဲက နောက်ဆုံးရလဒ်နဲ့ လက်ရှိရရှိထားတဲ့ data ကို ဒီကဒ်မှာ စုစည်းပြထားပါတယ်။', card: '3d', data: data3D };
    if (q.includes('history') || q.includes('သမိုင်း') || q.includes('မှတ်တမ်း') || q.includes('ဇယား')) return { text: 'မေးထားတဲ့ မှတ်တမ်းကို အောက်က cards တွေထဲမှာ အချိန်စဉ်အလိုက် ဖတ်နိုင်ပါတယ်။', card: 'sessions', data: data2D };
    if (q.includes('2d') || q.includes('၂လုံး') || q.includes('set') || q.includes('live') || q.includes('ရလဒ်')) return { text: 'လက်ရှိ 2D Live အခြေအနေကို အောက်က live card မှာ တိုက်ရိုက်ပြထားပါတယ်။', card: '2d', data: data2D };
    return { text: 'မေးခွန်းကို လက်ခံရရှိပါပြီ။ Live data၊ 2D/3D ရလဒ်၊ မှတ်တမ်းနဲ့ တွက်နည်းအကြောင်း မေးနိုင်ပါတယ်။' };
  };

  const send = async (preset?: string) => {
    const question = (preset || input).trim(); if (!question || thinking) return;
    addEntry({ role: 'user', text: question }); setInput(''); setThinking(true); scrollDown();
    const local = answerFor(question); addEntry({ role: 'assistant', text: local.text, card: local.card, data: local.data });
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: entries.filter((entry) => entry.text).slice(-8).map((entry) => ({ role: entry.role === 'user' ? 'user' : 'model', text: entry.text })) }) });
      if (response.ok) { const json = await response.json(); if (json.reply) addEntry({ role: 'assistant', text: json.reply }); }
    } catch { /* local card answer remains useful on free static hosting */ }
    finally { setThinking(false); }
  };

  const live = data2D?.live;
  const latest3D = data3D?.data?.[0];
  const openDestination = (destination: '2d' | '3d' | 'calendar') => {
    if (destination === '2d') addEntry({ role: 'assistant', card: '2d', data: data2D, text: '2D Live page ကို ဖွင့်ပြထားပါတယ်။' });
    if (destination === '3d') addEntry({ role: 'assistant', card: '3d', data: data3D, text: '3D Result page ကို ဖွင့်ပြထားပါတယ်။' });
    if (destination === 'calendar') addEntry({ role: 'assistant', card: 'calendar', data: data3D, text: '3D Calendar page ကို ဖွင့်ပြထားပါတယ်။' });
    scrollDown();
  };
  return <div className="chat-home-shell">
      <section className="chat-surface" aria-label="Mr.A AI chat">
        <div className="chat-surface-head"><div className="chat-agent"><MrAInlineCharacter twod={formatNumeral(live?.twod || '--', numeralMode)} loading={loading2D} onNavigate={openDestination} /><div><strong>Mr.A Brain</strong><span><i /> Live 2D ကို စောင့်ကြည့်နေတယ်</span></div></div><div className="chat-surface-tools"><span className="chat-live-strip" aria-label="Live 2D 3D summary"><span className="chat-live-state"><i /> LIVE</span><span className="chat-live-item"><b>2D</b>{loading2D ? '···' : formatNumeral(live?.twod || '--', numeralMode)}</span><span className="chat-live-divider" /><span className="chat-live-item chat-live-3d"><b>3D</b>{loading3D ? '···' : formatNumeral(latest3D?.result || '--', numeralMode)}</span></span><button className="chat-mini-action" onClick={onToggleNumeral} title="ဂဏန်းပုံစံပြောင်း">{numeralMode === 'myanmar' ? '၁၂၃' : '123'}</button><button className="chat-mini-action" onClick={onRefresh} disabled={refreshing} title="Live data ပြန်ရယူရန်"><RefreshCw className={refreshing ? 'spin' : ''} /></button></div></div>
        <div className="chat-feed" ref={feedRef}>
          {entries.map((entry) => <article key={entry.id} className={`chat-entry ${entry.role === 'user' ? 'is-user' : ''}`}><div className="chat-avatar">{entry.role === 'user' ? <UserRound /> : <Bot />}</div><div className="chat-entry-body"><div className="chat-entry-meta"><b>{entry.role === 'user' ? 'သင်' : 'Mr.A Brain'}</b><time>{entry.time}</time></div>{entry.text && <p className="chat-bubble-text">{entry.text}</p>}{entry.card === '2d' && <LiveCard data={(entry.data as Live2DData) || data2D} numeralMode={numeralMode} />}{entry.card === '3d' && <ThreeCard data={(entry.data as ThreeDResponse) || data3D} numeralMode={numeralMode} />}{entry.card === 'sessions' && <SessionsCard data={(entry.data as Live2DData) || data2D} numeralMode={numeralMode} />}{entry.card === 'calendar' && <CalendarCard data={(entry.data as ThreeDResponse) || data3D} numeralMode={numeralMode} />}</div></article>)}
          {thinking && <div className="chat-entry"><div className="chat-avatar"><Bot /></div><div className="chat-thinking"><Loader2 className="spin" /> Mr.A Brain စဉ်းစားနေတယ်...</div></div>}
          {error2D && <div className="chat-system-note">2D live data ကို ခဏမရသေးပါ။ နောက်တစ်ကြိမ် refresh လုပ်ပြီး ပြန်စစ်ပေးမယ်။</div>}
          {error3D && <div className="chat-system-note">3D data server ကို ချိတ်ဆက်နေပါတယ်။ ရရှိထားတဲ့ နောက်ဆုံးမှတ်တမ်းကို ပြထားပါတယ်။</div>}
          <div ref={bottomRef} />
        </div>
        <div className="chat-composer-wrap"><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Mr.A ကို မေးပါ…" /><button disabled={!input.trim() || thinking} aria-label="မေးခွန်းပို့ရန်"><Send /></button></form><p className="chat-disclaimer"><Activity /> API live data · AI answers may be approximate</p></div>
      </section>
  </div>;
};

function LiveCard({ data, numeralMode }: { data: Live2DData | null; numeralMode: NumeralMode }) { const live = data?.live; return <div className="context-card context-card-live"><div className="context-card-top"><span><Activity /> 2D LIVE TABLE</span><b>{formatMyanmarDateLabel(live?.date || '--', numeralMode)}</b></div><div className="live-card-grid"><div><small>ယခုထွက်ဂဏန်း</small><strong>{formatNumeral(live?.twod || '--', numeralMode)}</strong></div><div><small>SET INDEX</small><b>{formatNumeral(live?.set || '--', numeralMode)}</b></div><div><small>VALUE</small><b>{formatNumeral(live?.value || '--', numeralMode)}</b></div></div></div>; }
function ThreeCard({ data, numeralMode }: { data: ThreeDResponse | null; numeralMode: NumeralMode }) { const item = data?.data?.[0]; return <div className="context-card context-card-3d"><div className="context-card-top"><span><Trophy /> 3D RESULT</span><b>နောက်ဆုံး draw</b></div><div className="three-card-main"><strong>{formatNumeral(item?.result || '--', numeralMode)}</strong><span><CalendarDays /> {item?.datetime || '--'}</span></div></div>; }
function CalendarCard({ data, numeralMode }: { data: ThreeDResponse | null; numeralMode: NumeralMode }) { return <div className="context-card context-card-calendar"><div className="context-card-top"><span><CalendarDays /> 3D CALENDAR</span><b>draw history</b></div><div className="calendar-mini-grid">{(data?.data || []).slice(0, 6).map((item, index) => <div key={`${item.datetime}-${index}`}><small>{item.datetime || '--'}</small><strong>{formatNumeral(item.result || '--', numeralMode)}</strong></div>)}</div></div>; }
function SessionsCard({ data, numeralMode }: { data: Live2DData | null; numeralMode: NumeralMode }) { return <div className="context-card context-card-sessions"><div className="context-card-top"><span><Hash /> 2D SESSIONS</span><b>ယနေ့ draw များ</b></div><div className="session-mini-grid">{(data?.result || []).slice(0, 4).map((item, index) => <div key={`${item.open_time}-${index}`}><small>{formatNumeral(item.open_time, numeralMode)}</small><strong>{formatNumeral(item.twod, numeralMode)}</strong><span><Clock3 /> {formatNumeral(item.open_time, numeralMode)}</span></div>)}</div></div>; }
