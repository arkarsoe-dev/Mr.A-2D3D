import React from 'react';
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Info,
  Layers3,
  Radio,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { Live2DData, NumeralMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';

interface Live2DCardProps {
  data: Live2DData | null;
  numeralMode: NumeralMode;
  loading: boolean;
}

const getMarketStatus = () => {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) {
    return { label: 'စနေ/တနင်္ဂနွေ အားလပ်ရက်', tone: 'muted' as const };
  }
  const minutes = now.getHours() * 60 + now.getMinutes();
  if ((minutes >= 570 && minutes <= 721) || (minutes >= 840 && minutes <= 990)) {
    return { label: 'စျေးကွက်ပွင့်ဆဲ · LIVE', tone: 'live' as const };
  }
  if (minutes > 721 && minutes < 840) {
    return { label: 'မွန်းလွဲ ခေတ္တနားချိန်', tone: 'pause' as const };
  }
  return { label: 'ယနေ့ စျေးကွက်ပိတ်ချိန်', tone: 'muted' as const };
};

const toneClasses = {
  live: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  pause: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  muted: 'border-slate-700 bg-slate-800/70 text-slate-400',
};

export const Live2DCard: React.FC<Live2DCardProps> = ({ data, numeralMode, loading }) => {
  const live = data?.live || { set: '--', value: '--', time: '--', twod: '--', date: '--' };
  const results = data?.result || [];
  const marketStatus = getMarketStatus();
  const displayNumber = loading ? '--' : formatNumeral(live.twod, numeralMode);

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-emerald-400/20 bg-[#07151c] shadow-[0_24px_80px_rgba(2,6,23,.45)]">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="relative border-b border-white/5 px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                <Radio className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.22em] text-emerald-300/70">MR.A MARKET DESK</p>
                <h1 className="text-base font-black text-slate-100 sm:text-lg">မြန်မာ ၂လုံးထီ Live Result</h1>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold ${toneClasses[marketStatus.tone]}`}>
              <span className={`h-2 w-2 rounded-full ${marketStatus.tone === 'live' ? 'animate-pulse bg-emerald-300' : 'bg-current'}`} />
              {marketStatus.label}
            </div>
          </div>
        </div>

        <div className="relative grid gap-5 p-4 sm:p-7 lg:grid-cols-[minmax(280px,.9fr)_minmax(0,1.1fr)] lg:gap-8">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-emerald-300/15 bg-slate-950/35 px-4 py-7 text-center sm:py-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" /> ယခုထွက်ပေါ်နေသောဂဏန်း
            </div>
            <div className="relative my-2">
              <div className="absolute inset-0 scale-110 rounded-full bg-emerald-400/20 blur-2xl" />
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-emerald-300/40 bg-[radial-gradient(circle_at_35%_25%,#164e63,#07151c_62%)] shadow-[inset_0_0_35px_rgba(52,211,153,.18),0_0_45px_rgba(16,185,129,.18)] sm:h-52 sm:w-52">
                <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-emerald-300/10 bg-slate-950/80 sm:h-44 sm:w-44">
                  <span className="font-num text-7xl font-black tracking-[-.12em] text-emerald-200 sm:text-8xl">{displayNumber}</span>
                  <span className="mt-1 rounded-full bg-emerald-300/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.18em] text-emerald-300">2D LIVE</span>
                </div>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[.04] px-3 py-2"><Calendar className="h-3.5 w-3.5 text-amber-300" />{formatMyanmarDateLabel(live.date, numeralMode)}</span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[.04] px-3 py-2"><Clock3 className="h-3.5 w-3.5 text-emerald-300" />{formatNumeral(live.time, numeralMode)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 content-center">
            <MetricCard icon={<TrendingUp className="h-4 w-4" />} label="Thai SET Index" sublabel="စတော့အညွှန်းကိန်း" value={loading ? '--' : formatNumeral(live.set, numeralMode)} accent="emerald" />
            <MetricCard icon={<Layers3 className="h-4 w-4" />} label="Total Value" sublabel="M.Baht အရောင်းအဝယ်" value={loading ? '--' : formatNumeral(live.value, numeralMode)} accent="amber" />
            <div className="col-span-2 rounded-2xl border border-amber-300/15 bg-amber-300/[.06] p-3.5 text-xs leading-relaxed text-slate-400">
              <div className="flex items-start gap-2"><Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><span><strong className="text-amber-100">တွက်ချက်နည်း</strong> · SET ၏ နောက်ဆုံးဂဏန်း + Value ၏ ဒသမမတိုင်မီ နောက်ဆုံးဂဏန်း</span></div>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-2xl border border-white/5 bg-slate-950/35 px-3.5 py-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-emerald-300" /> API မှ တိုက်ရိုက်ရယူထားသည်</span>
              <span className="inline-flex items-center gap-1.5 text-slate-500"><ArrowUpRight className="h-3.5 w-3.5" /> Fresh data</span>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/5 bg-slate-950/20 px-4 py-5 sm:px-7">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-amber-300/70">TODAY'S SESSIONS</p>
              <h2 className="mt-1 text-sm font-black text-slate-100 sm:text-base">ယနေ့ ၄ ကြိမ် ရလဒ်အခြေအနေ</h2>
            </div>
            <span className="text-[11px] text-slate-500">{formatMyanmarDateLabel(live.date, numeralMode)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {results.map((item, index) => {
              const closed = Boolean(item.twod && item.twod !== '--');
              return <SessionCard key={`${item.open_time}-${index}`} item={item} index={index} closed={closed} numeralMode={numeralMode} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

function MetricCard({ icon, label, sublabel, value, accent }: { icon: React.ReactNode; label: string; sublabel: string; value: string; accent: 'emerald' | 'amber' }) {
  const colors = accent === 'emerald' ? 'text-emerald-300 border-emerald-300/15' : 'text-amber-300 border-amber-300/15';
  return <div className={`rounded-2xl border bg-slate-950/40 p-3.5 sm:p-4 ${colors}`}><div className="flex items-start justify-between gap-2"><div><div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">{icon}{label}</div><p className="mt-1 text-[10px] text-slate-500">{sublabel}</p></div><span className="rounded-full bg-white/[.05] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">LIVE</span></div><p className="mt-4 truncate font-num text-xl font-black tracking-tight text-slate-100 sm:text-2xl">{value}</p></div>;
}

function SessionCard({ item, index, closed, numeralMode }: { item: Live2DData['result'][number]; index: number; closed: boolean; numeralMode: NumeralMode }) {
  const labels = ['၁၁:၀၀ မနက်', '၁၂:၀၁ နေ့လယ်', '၀၃:၀၀ ညနေ', '၀၄:၃၀ ညနေ'];
  return <div className={`rounded-2xl border p-3 transition-colors ${closed ? 'border-emerald-300/20 bg-emerald-300/[.06]' : 'border-white/5 bg-white/[.025]'}`}>
    <div className="flex items-center justify-between gap-1"><span className="font-num text-[11px] font-bold text-amber-200">{formatNumeral(item.open_time, numeralMode)}</span><span className="truncate text-[9px] text-slate-500">{labels[index] || ''}</span></div>
    <div className="my-3 flex items-center justify-between"><span className="text-[10px] text-slate-500">ပေါက်ဂဏန်း</span><span className={`font-num text-2xl font-black ${closed ? 'text-emerald-300' : 'text-slate-600'}`}>{formatNumeral(item.twod, numeralMode)}</span></div>
    <div className="space-y-1 border-t border-white/5 pt-2 text-[10px] text-slate-500"><div className="flex justify-between"><span>SET</span><span className="font-num text-slate-300">{formatNumeral(item.set, numeralMode)}</span></div><div className="flex justify-between"><span>VALUE</span><span className="font-num text-slate-300">{formatNumeral(item.value, numeralMode)}</span></div></div>
    <div className={`mt-3 flex items-center gap-1 text-[10px] font-bold ${closed ? 'text-emerald-300' : 'text-slate-500'}`}>{closed ? <CheckCircle2 className="h-3 w-3" /> : <Timer className="h-3 w-3" />}{closed ? 'ထွက်ပြီး' : 'စောင့်ဆိုင်းဆဲ'}</div>
  </div>;
}
