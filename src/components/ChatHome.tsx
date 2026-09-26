import React, { useEffect, useRef, useState } from 'react';
import { Activity, Bot, CalendarDays, Clock3, Hash, Loader2, Send, Settings, Sparkles, Timer, Trophy, UserRound, X } from 'lucide-react';
import { Live2DData, NumeralMode, ThreeDResponse } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';
import { MrAInlineCharacter } from './MrAInlineCharacter';
import { SiteLanguage } from './SettingsPanel';

type Props = { data2D: Live2DData | null; data3D: ThreeDResponse | null; loading2D: boolean; loading3D: boolean; error2D: boolean; error3D: boolean; numeralMode: NumeralMode; onToggleNumeral: () => void; onRefresh: () => void; refreshing: boolean; language: SiteLanguage; onOpenSettings: () => void; onOpenCalendar: () => void };
type Entry = { id: string; role: 'assistant' | 'user'; text?: string; card?: '2d' | '3d' | 'sessions' | 'calendar'; data?: unknown; time: string };

const timeLabel = () => new Date().toLocaleTimeString('my-MM', { hour: 'numeric', minute: '2-digit' });
const starterText = 'မင်္ဂလာပါ။ ကျွန်တော်က Mr.A ပါ။ မေးချင်တာကို လွတ်လပ်စွာ ရေးနိုင်ပါတယ်။ Live 2D/3D data ကိုလည်း အခြေအနေအလိုက် ရှင်းပြပေးနိုင်ပါတယ်။';
const starterEntry = (): Entry => ({ id: `welcome-${Date.now()}`, role: 'assistant', text: starterText, time: timeLabel() });

export const ChatHome: React.FC<Props> = ({ data2D, data3D, loading2D, loading3D, error2D, error3D, numeralMode, onOpenSettings, onOpenCalendar }) => {
  const english = false;
  const [entries, setEntries] = useState<Entry[]>(() => { try { const saved = sessionStorage.getItem('mra_chat_history'); return saved ? JSON.parse(saved) : [starterEntry()]; } catch { return [starterEntry()]; } });
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [connection, setConnection] = useState<'ready' | 'online' | 'offline'>('ready');
  const [thinkingLabel, setThinkingLabel] = useState('Mr.A စဉ်းစားနေတယ်...');
  const [last2D, setLast2D] = useState('');
  const [last3D, setLast3D] = useState('');
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [countdownTarget, setCountdownTarget] = useState('');
  const initializedResult = useRef(false);
  const latestResultKey = useRef('');
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { sessionStorage.setItem('mra_chat_history', JSON.stringify(entries.slice(-40))); } catch { /* storage is optional */ } }, [entries]);
  const addEntry = (entry: Omit<Entry, 'id' | 'time'>) => setEntries((prev) => [...prev, { ...entry, id: `${Date.now()}-${Math.random()}`, time: timeLabel() }]);
  const scrollDown = () => window.setTimeout(() => feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' }), 40);
  const character = (action: string, text: string) => window.dispatchEvent(new CustomEvent('mra:character', { detail: { action, text } }));

  useEffect(() => { const next = data2D?.live?.twod || '--'; if (next !== '--') setLast2D(next); }, [data2D]);
  useEffect(() => { const result = data3D?.data?.[0]?.result; if (result) setLast3D(result); }, [data3D]);
  useEffect(() => { scrollDown(); }, [entries.length, thinking]);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = (data2D?.result || []).map((item) => { const [hours, minutes, seconds = '0'] = item.open_time.split(':'); const target = new Date(now); target.setHours(Number(hours), Number(minutes), Number(seconds), 0); return { item, target }; }).filter(({ item, target }) => (item.twod === '--' || !item.twod) && target.getTime() > now.getTime()).sort((a, b) => a.target.getTime() - b.target.getTime())[0];
      if (!next) { setCountdownSeconds(null); setCountdownTarget(''); return; }
      const secondsLeft = Math.ceil((next.target.getTime() - now.getTime()) / 1000);
      if (secondsLeft > 0 && secondsLeft <= 60) { setCountdownSeconds(secondsLeft); setCountdownTarget(next.item.open_time.slice(0, 5)); } else { setCountdownSeconds(null); setCountdownTarget(''); }
    };
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [data2D]);
  useEffect(() => {
    const completed = (data2D?.result || []).filter((item) => item.twod && item.twod !== '--').sort((a, b) => `${a.stock_date} ${a.open_time}`.localeCompare(`${b.stock_date} ${b.open_time}`));
    const latest = completed[completed.length - 1]; if (!latest) return;
    const key = `${latest.stock_date}-${latest.open_time}-${latest.twod}`;
    if (!initializedResult.current) { initializedResult.current = true; latestResultKey.current = key; return; }
    if (key !== latestResultKey.current) { latestResultKey.current = key; addEntry({ role: 'assistant', card: '2d', data: data2D, text: `2D Live result ${formatNumeral(latest.twod, numeralMode)} ထွက်လာပါပြီ။` }); character('celebrate', `2D ${latest.twod} ထွက်လာပြီ!`); scrollDown(); }
  }, [data2D, numeralMode]);

  const localFallback = (question: string): { text: string; card?: Entry['card']; data?: unknown } => {
    const q = question.toLowerCase();
    if (q.includes('3d') || q.includes('၃လုံး') || q.includes('အာကာ')) return { text: '3D မှတ်တမ်းထဲက နောက်ဆုံးရလဒ်ကို ဒီကဒ်မှာ စုစည်းပြထားပါတယ်။', card: '3d', data: data3D };
    if (q.includes('history') || q.includes('သမိုင်း') || q.includes('မှတ်တမ်း') || q.includes('ဇယား')) return { text: 'လက်ရှိ ရရှိထားတဲ့ 2D မှတ်တမ်းကို အချိန်စဉ်အလိုက် ပြထားပါတယ်။', card: 'sessions', data: data2D };
    if (q.includes('2d') || q.includes('၂လုံး') || q.includes('set') || q.includes('live') || q.includes('ရလဒ်')) return { text: 'လက်ရှိ 2D Live အခြေအနေကို အောက်က live card မှာ ပြထားပါတယ်။', card: '2d', data: data2D };
    return { text: 'Live data၊ 2D/3D ရလဒ်၊ မှတ်တမ်း၊ တွက်နည်းနဲ့ အထွေထွေဗဟုသုတအကြောင်း မေးနိုင်ပါတယ်။' };
  };

  const send = async (preset?: string) => {
    const question = (preset || input).trim(); if (!question || thinking) return;
    const previous = entries.filter((entry) => entry.text).slice(-10).map((entry) => ({ role: entry.role === 'user' ? 'user' : 'model', text: entry.text }));
    addEntry({ role: 'user', text: question }); setInput(''); setThinking(true); setThinkingLabel('မေးခွန်းကို နားထောင်ပြီး စဉ်းစားနေတယ်...'); setConnection('ready'); character('listening', 'မေးခွန်းကို နားထောင်နေတယ်'); scrollDown();
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: previous, liveContext: { twod: data2D?.live?.twod || '--', set: data2D?.live?.set || '--', value: data2D?.live?.value || '--', latest3d: data3D?.data?.[0]?.result || '--', latest3dDate: data3D?.data?.[0]?.datetime || '--' } }) });
      if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
      const json = await response.json();
      addEntry({ role: 'assistant', text: json.reply || 'တုံ့ပြန်ချက်ရရှိပါပြီ။' }); setConnection('online'); setThinkingLabel('Mr.A စကားပြောနေတယ်...'); character('speaking', 'အဖြေကို ပြောပြနေတယ်');
    } catch (error) {
      console.warn('Mr.A AI unavailable:', error); const fallback = localFallback(question); addEntry({ role: 'assistant', ...fallback }); setConnection('offline'); setThinkingLabel('အင်တာနက်မရသေးပါ'); character('confused', 'AI server ကို ခဏချိတ်မရသေးဘူး');
    } finally { setThinking(false); scrollDown(); }
  };

  const clearChat = () => { setEntries([starterEntry()]); setConnection('ready'); try { sessionStorage.removeItem('mra_chat_history'); } catch { /* optional */ } };
  const openDestination = (destination: '2d' | '3d' | 'calendar') => { if (destination === '2d') addEntry({ role: 'assistant', card: '2d', data: data2D, text: '2D Live page ကို ဒီ chat ထဲမှာ ဖွင့်ပြထားပါတယ်။' }); if (destination === '3d') addEntry({ role: 'assistant', card: '3d', data: data3D, text: '3D Result page ကို ဒီ chat ထဲမှာ ဖွင့်ပြထားပါတယ်။' }); if (destination === 'calendar') onOpenCalendar(); scrollDown(); };
  const quickPrompts = ['လက်ရှိ 2D Live ကိုရှင်းပြပါ', '3D နောက်ဆုံးရလဒ်ပြပါ', 'SET Index ဆိုတာဘာလဲ'];
  const live = data2D?.live;
  return <div className="chat-home-shell"><section className="chat-surface" aria-label="Mr.A AI chat">
    <div className="chat-surface-head"><div className="chat-agent"><div className="chat-agent-icon"><Bot /></div><div><strong>Mr.A</strong><span><i className={connection === 'online' ? 'is-online' : ''} /> {connection === 'online' ? 'AI online' : connection === 'offline' ? 'offline fallback' : 'အဆင်သင့်ရှိနေပါတယ်'}</span></div><div className="mra-walk-zone"><MrAInlineCharacter twod={formatNumeral(live?.twod || '--', numeralMode)} loading={loading2D} onNavigate={openDestination} /></div></div><div className="chat-surface-tools"><button className="chat-icon-button" aria-label="စကားပြောခန်းရှင်းရန်" title="စကားပြောခန်းရှင်းရန်" onClick={clearChat}><X /></button><button className="chat-icon-button" aria-label="Website settings" title="Website settings" onClick={onOpenSettings}><Settings /></button></div></div>
    <div className="chat-quick-row chat-quick-row-main">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => send(prompt)} disabled={thinking}><Sparkles />{prompt}</button>)}</div>
    <div className="chat-feed" ref={feedRef}>{entries.map((entry) => <article key={entry.id} className={`chat-entry ${entry.role === 'user' ? 'is-user' : ''}`}><div className="chat-avatar">{entry.role === 'user' ? <UserRound /> : <Bot />}</div><div className="chat-entry-body"><div className="chat-entry-meta"><b>{entry.role === 'user' ? 'သင်' : 'Mr.A'}</b><time>{entry.time}</time></div>{entry.text && <p className="chat-bubble-text">{entry.text}</p>}{entry.card === '2d' && <LiveCard data={(entry.data as Live2DData) || data2D} numeralMode={numeralMode} />}{entry.card === '3d' && <ThreeCard data={(entry.data as ThreeDResponse) || data3D} numeralMode={numeralMode} />}{entry.card === 'sessions' && <SessionsCard data={(entry.data as Live2DData) || data2D} numeralMode={numeralMode} />}</div></article>)}{countdownSeconds !== null && <CountdownCard seconds={countdownSeconds} target={countdownTarget} />}{thinking && <div className="chat-entry"><div className="chat-avatar"><Bot /></div><div className="chat-thinking"><Loader2 className="spin" /> {thinkingLabel}</div></div>}{error2D && <div className="chat-system-note">2D live data ကို ခဏမရသေးပါ။ နောက်တစ်ကြိမ် ပြန်စစ်ပေးမယ်။</div>}{error3D && <div className="chat-system-note">3D server ချိတ်နေပါတယ်။ နောက်ဆုံးမှတ်တမ်းကို ပြထားပါတယ်။</div>}</div>
    <div className="chat-composer-wrap"><form className="chat-composer" onSubmit={(event) => { event.preventDefault(); send(); }}><input value={input} onChange={(event) => { setInput(event.target.value); if (event.target.value) character('listening', 'မေးခွန်းကို ရိုက်နေတယ်'); }} placeholder="Mr.A ကို မေးပါ…" autoComplete="off" /><button disabled={!input.trim() || thinking} aria-label="မေးခွန်းပို့ရန်"><Send /></button></form><p className="chat-disclaimer"><Activity /> {connection === 'online' ? 'Real AI response · live context included' : 'Real AI server ချိတ်ဆက်ရန် စောင့်နေသည် · fallback ပါဝင်သည်'}</p></div>
  </section></div>;
};

function CountdownCard({ seconds, target }: { seconds: number; target: string }) { const mm = String(Math.floor(seconds / 60)).padStart(2, '0'); const ss = String(seconds % 60).padStart(2, '0'); return <div className="countdown-card"><div className="countdown-orbit"><Timer /><span>{mm}:{ss}</span></div><div><strong>2D Live မကြာမီ ထွက်ပါမယ်</strong><small>{target} draw အတွက် countdown</small></div><i className="countdown-pulse" /></div>; }
function LiveCard({ data, numeralMode }: { data: Live2DData | null; numeralMode: NumeralMode }) { const live = data?.live; return <div className="context-card context-card-live"><div className="context-card-top"><span><Activity /> 2D LIVE TABLE</span><b>{formatMyanmarDateLabel(live?.date || '--', numeralMode)}</b></div><div className="live-card-grid"><div><small>ယခုထွက်ဂဏန်း</small><strong>{formatNumeral(live?.twod || '--', numeralMode)}</strong></div><div><small>SET INDEX</small><b>{formatNumeral(live?.set || '--', numeralMode)}</b></div><div><small>VALUE</small><b>{formatNumeral(live?.value || '--', numeralMode)}</b></div></div></div>; }
function ThreeCard({ data, numeralMode }: { data: ThreeDResponse | null; numeralMode: NumeralMode }) { const item = data?.data?.[0]; return <div className="context-card context-card-3d"><div className="context-card-top"><span><Trophy /> 3D RESULT</span><b>နောက်ဆုံး draw</b></div><div className="three-card-main"><strong>{formatNumeral(item?.result || '--', numeralMode)}</strong><span><CalendarDays /> {item?.datetime || '--'}</span></div></div>; }
function SessionsCard({ data, numeralMode }: { data: Live2DData | null; numeralMode: NumeralMode }) { return <div className="context-card context-card-sessions"><div className="context-card-top"><span><Hash /> 2D SESSIONS</span><b>ယနေ့ draw များ</b></div><div className="session-mini-grid">{(data?.result || []).slice(0, 4).map((item, index) => <div key={`${item.open_time}-${index}`}><small>{formatNumeral(item.open_time, numeralMode)}</small><strong>{formatNumeral(item.twod, numeralMode)}</strong><span><Clock3 /> {formatNumeral(item.open_time, numeralMode)}</span></div>)}</div></div>; }
