import React, { useEffect, useState } from 'react';
import { Award, Calendar, CalendarDays, ExternalLink, Grid3X3, ListFilter, Search, Sparkles, Trophy } from 'lucide-react';
import { ThreeDItem, NumeralMode, ThreeDSubMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';
import { ThreeDCalendarView } from './ThreeDCalendarView';
import { ArkarSoeCalendarTable } from './ArkarSoeCalendarTable';

interface ThreeDSectionProps {
  items: ThreeDItem[];
  loading: boolean;
  numeralMode: NumeralMode;
  initialMode?: ThreeDSubMode;
  onModeChange?: (mode: ThreeDSubMode) => void;
  hideHeroOnSubScreens?: boolean;
}

const modeItems: Array<{ id: ThreeDSubMode; label: string; icon: React.ReactNode }> = [
  { id: 'arkarsoe', label: 'Pro Table', icon: <Grid3X3 className="h-3.5 w-3.5" /> },
  { id: 'monthlyCalendar', label: 'Calendar', icon: <CalendarDays className="h-3.5 w-3.5" /> },
  { id: 'list', label: 'Draws List', icon: <ListFilter className="h-3.5 w-3.5" /> },
];

export const ThreeDSection: React.FC<ThreeDSectionProps> = ({ items, loading, numeralMode, initialMode = 'arkarsoe', onModeChange, hideHeroOnSubScreens = false }) => {
  const [activeMainMode, setActiveMainMode] = useState<ThreeDSubMode>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  useEffect(() => setActiveMainMode(initialMode), [initialMode]);
  const selectMode = (mode: ThreeDSubMode) => { setActiveMainMode(mode); onModeChange?.(mode); };
  const latestDraw = items[0] || null;
  const nextDrawDate = getNext3DDrawDate();
  const filteredItems = items.filter((item) => (item.result.includes(searchQuery) || item.datetime.includes(searchQuery)) && (selectedYear === 'all' || item.datetime.startsWith(selectedYear)));

  return <div className="space-y-4 sm:space-y-5">
    {(!hideHeroOnSubScreens || activeMainMode === 'list') && <section className="result-surface relative overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-[#1b1408] shadow-[0_24px_80px_rgba(2,6,23,.45)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-400/5 blur-3xl" />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-200"><Trophy className="h-3.5 w-3.5" /> 3D Result Desk</div>
          <h2 className="text-xl font-black text-slate-100 sm:text-3xl">၃လုံးထီ နောက်ဆုံးရလဒ်</h2>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5 text-amber-300" />{latestDraw ? formatMyanmarDateLabel(latestDraw.datetime, numeralMode) : 'ဒေတာရယူနေပါသည်...'}</p>
          <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-500">ထိုင်းအစိုးရ ၃လုံးထီ ရလဒ်များကို တိုက်ရိုက် API မှ ရယူပြီး မှတ်တမ်း၊ ပြက္ခဒိန်နှင့် pattern table အဖြစ် ကြည့်ရှုနိုင်ပါသည်။</p>
        </div>
        {latestDraw ? <div className="flex justify-center gap-2 sm:gap-3">{latestDraw.result.split('').map((digit, index) => <div key={`${digit}-${index}`} className="flex h-20 w-16 flex-col items-center justify-center rounded-2xl border border-amber-200/25 bg-slate-950/75 shadow-[0_10px_35px_rgba(245,158,11,.12)] sm:h-28 sm:w-24"><span className="font-num text-4xl font-black tracking-[-.08em] text-amber-200 sm:text-6xl">{formatNumeral(digit, numeralMode)}</span><span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-amber-300/50">digit {index + 1}</span></div>)}</div> : <div className="text-sm text-slate-500">၃လုံးရလဒ်ကို ရယူနေပါသည်...</div>}
      </div>
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-white/5 bg-slate-950/20 px-5 py-4 sm:px-7"><div className="flex items-center gap-2 text-[11px] text-slate-400"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />နောက်တစ်ကြိမ် ၃လုံးထီ <span className="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 font-num font-bold text-emerald-200">{formatMyanmarDateLabel(nextDrawDate, numeralMode)}</span></div><a href="https://www.thaistock2d.com/threedResult" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-100"><span>မူရင်းအရင်းအမြစ်</span><ExternalLink className="h-3 w-3" /></a></div>
    </section>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-slate-900/60 p-2.5 shadow-lg"><div className="flex items-center gap-2 px-2"><Sparkles className="h-4 w-4 text-amber-300" /><span className="text-xs font-bold text-slate-200">3D Screens</span></div><div className="flex flex-1 flex-wrap justify-end gap-1.5">{modeItems.map((mode) => <button key={mode.id} type="button" onClick={() => selectMode(mode.id)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold transition ${activeMainMode === mode.id ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/10' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}>{mode.icon}{mode.label}</button>)}</div></div>
    {activeMainMode === 'arkarsoe' && <ArkarSoeCalendarTable items={items} numeralMode={numeralMode} />}
    {activeMainMode === 'monthlyCalendar' && <ThreeDCalendarView items={items} numeralMode={numeralMode} />}
    {activeMainMode === 'list' && <HistoryList items={items} filteredItems={filteredItems} loading={loading} numeralMode={numeralMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedYear={selectedYear} setSelectedYear={setSelectedYear} />}
  </div>;
};

function HistoryList({ items, filteredItems, loading, numeralMode, searchQuery, setSearchQuery, selectedYear, setSelectedYear }: { items: ThreeDItem[]; filteredItems: ThreeDItem[]; loading: boolean; numeralMode: NumeralMode; searchQuery: string; setSearchQuery: (value: string) => void; selectedYear: string; setSelectedYear: (value: string) => void }) {
  return <section className="rounded-[1.5rem] border border-white/5 bg-slate-900/70 p-4 shadow-xl sm:p-6"><div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2"><Award className="h-5 w-5 text-amber-300" /><h3 className="text-base font-black text-slate-100">၃လုံးထီ သမိုင်းဝင် ရလဒ်များ</h3></div><p className="mt-1 text-xs text-slate-500">စုစုပေါင်း {formatNumeral(items.length, numeralMode)} ကြိမ် · ဂဏန်း သို့မဟုတ် ရက်စွဲဖြင့် ရှာဖွေပါ</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative flex-1 sm:w-56"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ဂဏန်း/ရက် ရှာရန်..." className="w-full rounded-xl border border-white/10 bg-slate-950/70 py-2 pl-9 pr-3 text-xs text-slate-100 outline-none transition focus:border-amber-300/50" /></label><select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-amber-200 outline-none focus:border-amber-300/50"><option value="all">နှစ်အားလုံး</option>{Array.from({ length: 51 }, (_, index) => 2026 - index).map((year) => <option key={year} value={String(year)}>{formatNumeral(year, numeralMode)}</option>)}</select></div></div>{loading && items.length === 0 ? <div className="py-12 text-center text-sm text-slate-500">၃လုံးထီ မှတ်တမ်းများကို ရယူနေပါသည်...</div> : filteredItems.length === 0 ? <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-500">ရှာဖွေမှုနှင့် ကိုက်ညီသော ရလဒ် မတွေ့ရှိပါ။</div> : <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">{filteredItems.slice(0, 120).map((item, index) => <div key={`${item.datetime}-${index}`} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/45 p-3.5 transition hover:border-amber-300/30 hover:bg-amber-300/[.04]"><div><div className="flex items-center gap-1.5 text-xs font-bold text-slate-300"><Calendar className="h-3.5 w-3.5 text-amber-300" />{formatMyanmarDateLabel(item.datetime, numeralMode)}</div><p className="mt-1 font-num text-[10px] text-slate-600">{formatNumeral(item.datetime, numeralMode)}</p></div><span className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 font-num text-2xl font-black tracking-wider text-amber-200">{formatNumeral(item.result, numeralMode)}</span></div>)}</div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-[11px] text-slate-500"><span>တွေ့ရှိသောရလဒ် {formatNumeral(filteredItems.length, numeralMode)} ကြိမ်</span><span className="inline-flex items-center gap-1 text-emerald-300/70"><Sparkles className="h-3 w-3" /> API live data</span></div></section>;
}

function getNext3DDrawDate() { const now = new Date(); if (now.getDate() < 16) return new Date(now.getFullYear(), now.getMonth(), 16).toISOString().split('T')[0]; return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0]; }
