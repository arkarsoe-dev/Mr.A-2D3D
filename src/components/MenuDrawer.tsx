import React, { useState } from 'react';
import { Calendar, CalendarDays, Clock3, Globe2, ListFilter, MessageCircle, Radio, RefreshCw, Share2, Sparkles, Trophy, Volume2, VolumeX, X } from 'lucide-react';
import { Live2DData, NumeralMode, TabType } from '../types';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  numeralMode: NumeralMode;
  onToggleNumeralMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  serverTime?: string;
  data2D?: Live2DData | null;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, activeTab, onChangeTab, numeralMode, onToggleNumeralMode, soundEnabled, onToggleSound, onRefresh, isRefreshing, serverTime }) => {
  const [shared, setShared] = useState(false);
  if (!isOpen) return null;

  const go = (tab: TabType) => { onChangeTab(tab); onClose(); };
  const shareApp = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'Mr.A 2D3D Live', text: '2D/3D တိုက်ရိုက်ရလဒ်များကို ကြည့်ရန်', url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
      setShared(true); window.setTimeout(() => setShared(false), 1800);
    } catch { /* sharing can be cancelled by the user */ }
  };

  return <div className="fixed inset-0 z-50 overflow-hidden">
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />
    <aside className="fixed inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-amber-300/15 bg-[#0a111b] shadow-2xl">
      <header className="flex items-center justify-between border-b border-white/5 px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-300 text-lg font-black text-slate-950">A</div><div><h2 className="font-black text-slate-100">Mr.A 2D3D</h2><p className="text-[10px] text-emerald-300">Live results · Myanmar</p></div></div><button onClick={onClose} aria-label="ပိတ်ရန်" className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button></header>
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {serverTime && <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/45 px-3 py-3 text-[11px] text-slate-400"><span className="flex items-center gap-2"><Clock3 className="h-3.5 w-3.5 text-amber-300" />SET အချိန်</span><span className="font-num font-bold text-amber-200">{serverTime}</span></div>}
        <section><p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">အမြန်သွားရန်</p><div className="grid grid-cols-2 gap-2"><QuickButton active={activeTab === '2d_live'} icon={<Radio />} label="2D Live" onClick={() => go('2d_live')} /><QuickButton active={activeTab.startsWith('3d_') || activeTab === '3d_result'} icon={<Trophy />} label="3D Result" onClick={() => go('3d_arkarsoe')} /><QuickButton active={activeTab === 'group_chat'} icon={<MessageCircle />} label="Group Chat" onClick={() => go('group_chat')} /><QuickButton active={activeTab === 'tools'} icon={<Sparkles />} label="Tools" onClick={() => go('tools')} /></div></section>
        <section><p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">3D ကြည့်ရှုရန်</p><div className="space-y-1.5"><TextButton icon={<CalendarDays />} label="လအလိုက် ပြက္ခဒိန်" onClick={() => go('3d_calendar')} /><TextButton icon={<ListFilter />} label="သမိုင်းဝင် ရလဒ်စာရင်း" onClick={() => go('3d_history')} /></div></section>
        <section><p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">အသုံးပြုသူ ဆက်တင်</p><div className="space-y-2 rounded-2xl border border-white/5 bg-slate-950/45 p-3"><SettingRow icon={<Globe2 />} label="ဂဏန်းပုံစံ" detail={numeralMode === 'myanmar' ? 'မြန်မာဂဏန်း' : 'English digits'} action={<button onClick={onToggleNumeralMode} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-amber-200">{numeralMode === 'myanmar' ? 'ENG' : 'မြန်မာ'}</button>} /><div className="h-px bg-white/5" /><SettingRow icon={soundEnabled ? <Volume2 /> : <VolumeX />} label="အသံပေးချက်" detail={soundEnabled ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည်'} action={<button onClick={onToggleSound} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${soundEnabled ? 'bg-emerald-300/15 text-emerald-200' : 'bg-white/5 text-slate-400'}`}>{soundEnabled ? 'ဖွင့်' : 'ပိတ်'}</button>} /><div className="h-px bg-white/5" /><SettingRow icon={<RefreshCw className={isRefreshing ? 'animate-spin' : ''} />} label="ဒေတာ ပြန်ရယူရန်" detail="Live 2D/3D ကို refresh လုပ်မည်" action={<button onClick={onRefresh} disabled={isRefreshing} className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-slate-200">{isRefreshing ? 'ရယူနေ' : 'Refresh'}</button>} /></div></section>
        <button onClick={shareApp} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.07] px-4 py-3 text-xs font-bold text-emerald-200 transition hover:bg-emerald-300/15"><Share2 className="h-4 w-4" />{shared ? 'Link ကူးပြီးပါပြီ' : 'သူငယ်ချင်းများထံ မျှဝေရန်'}</button>
        <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-[11px] text-slate-400"><p className="mb-2 flex items-center gap-2 font-bold text-amber-200"><Calendar className="h-3.5 w-3.5" />၂လုံးထီ ထွက်ချိန်</p><div className="grid grid-cols-2 gap-1.5 font-num text-slate-300"><span className="rounded-lg bg-slate-950/40 px-2 py-1.5">11:00 AM</span><span className="rounded-lg bg-slate-950/40 px-2 py-1.5">12:01 PM</span><span className="rounded-lg bg-slate-950/40 px-2 py-1.5">03:00 PM</span><span className="rounded-lg bg-slate-950/40 px-2 py-1.5">04:30 PM</span></div></section>
      </div>
      <footer className="border-t border-white/5 px-5 py-4 text-center text-[10px] text-slate-600">တိုက်ရိုက်ရလဒ်များကို အမြဲလွယ်ကူစွာ ကြည့်ရှုနိုင်ပါသည်</footer>
    </aside>
  </div>;
};

function QuickButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement<{ className?: string }>; label: string; onClick: () => void }) { return <button onClick={onClick} className={`flex items-center gap-2 rounded-2xl border p-3 text-left text-xs font-bold transition ${active ? 'border-amber-300/30 bg-amber-300/10 text-amber-100' : 'border-white/5 bg-slate-950/45 text-slate-300 hover:bg-white/5'}`}>{React.cloneElement(icon, { className: 'h-4 w-4 text-amber-300' })}{label}</button>; }
function TextButton({ icon, label, onClick }: { icon: React.ReactElement<{ className?: string }>; label: string; onClick: () => void }) { return <button onClick={onClick} className="flex w-full items-center gap-2.5 rounded-xl border border-white/5 bg-slate-950/45 p-3 text-left text-xs font-bold text-slate-300 transition hover:border-amber-300/20 hover:text-amber-100">{React.cloneElement(icon, { className: 'h-4 w-4 text-amber-300' })}{label}</button>; }
function SettingRow({ icon, label, detail, action }: { icon: React.ReactElement<{ className?: string }>; label: string; detail: string; action: React.ReactNode }) { return <div className="flex items-center justify-between gap-3 py-1"><div className="flex min-w-0 items-center gap-2.5">{React.cloneElement(icon, { className: 'h-4 w-4 shrink-0 text-slate-400' })}<div className="min-w-0"><p className="truncate text-xs font-bold text-slate-200">{label}</p><p className="truncate text-[10px] text-slate-500">{detail}</p></div></div>{action}</div>; }
