import React from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  Hourglass,
  Layers,
  Sparkles,
  Info,
  Zap,
} from 'lucide-react';
import { Live2DData, NumeralMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';

interface Live2DCardProps {
  data: Live2DData | null;
  numeralMode: NumeralMode;
  loading: boolean;
}

export const Live2DCard: React.FC<Live2DCardProps> = ({
  data,
  numeralMode,
  loading,
}) => {
  const live = data?.live || {
    set: '--',
    value: '--',
    time: '--',
    twod: '--',
    date: '--',
  };

  const results = data?.result || [];

  // Determine market status
  const getMarketStatus = () => {
    const now = new Date();
    const day = now.getDay();
    if (day === 0 || day === 6) {
      return { text: 'စနေ/တနင်္ဂနွေ အားလပ်ရက်', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    }
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;

    // 9:30 AM = 570 mins, 12:01 PM = 721 mins
    // 2:00 PM = 840 mins, 4:30 PM = 990 mins
    if (totalMinutes >= 570 && totalMinutes <= 721) {
      return { text: 'မနက်ခင်း စျေးကွက်ပွင့်ဆဲ (LIVE)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    } else if (totalMinutes > 721 && totalMinutes < 840) {
      return { text: 'မွန်းလွဲပိုင်း စျေးကွက်ခေတ္တနားချိန်', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    } else if (totalMinutes >= 840 && totalMinutes <= 990) {
      return { text: 'ညနေခင်း စျေးကွက်ပွင့်ဆဲ (LIVE)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    } else {
      return { text: 'ယနေ့ စျေးကွက်ပိတ်ချိန်', color: 'text-slate-400 bg-slate-800/60 border-slate-700' };
    }
  };

  const marketStatus = getMarketStatus();

  return (
    <div className="space-y-4">
      {/* Main Hero 2D Live Display Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/30 shadow-2xl shadow-amber-950/20 p-5 sm:p-7">
        {/* Glow backdrop effects */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              မြန်မာ ၂လုံးထီ တိုက်ရိုက်ထုတ်လွှင့်မှု (LIVE)
            </span>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${marketStatus.color}`}>
            {marketStatus.text}
          </span>
        </div>

        {/* Visual Big Display */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* 2D Big Number Circle */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-2 sm:p-4">
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              ယခုထွက်ပေါ်နေသော ၂လုံးထီ ဂဏန်း
            </span>

            {/* Glowing Digit Pod (Emerald Green) */}
            <div className="relative group">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-300 p-1 shadow-2xl shadow-emerald-500/40 animate-pulse-glow-green">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center border-4 border-slate-950">
                  <span className="font-num text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-emerald-100 via-emerald-300 to-teal-400 tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                    {loading ? '--' : formatNumeral(live.twod, numeralMode)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-300 mt-1 uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <Zap className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    2D Live Result
                  </span>
                </div>
              </div>
            </div>

            {/* Date & Time pill */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatMyanmarDateLabel(live.date, numeralMode)}</span>
              </span>
              <span className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-num">{formatNumeral(live.time, numeralMode)}</span>
              </span>
            </div>
          </div>

          {/* SET & VALUE Metrics */}
          <div className="md:col-span-6 grid grid-cols-2 gap-2 sm:gap-3 items-stretch">
            <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium min-w-0">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="truncate">Thai Stock SET Index</span>
                  </span>
                  <span className="hidden sm:inline text-[10px] text-amber-400/80">ထိုင်းစတော့အညွှန်းကိန်း</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-num text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {loading ? '--' : formatNumeral(live.set, numeralMode)}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Live SET
                </span>
              </div>
            </div>

            <div className="p-2.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md hover:border-amber-500/40 transition">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium min-w-0">
                    <Layers className="w-4 h-4 text-amber-400" />
                  <span className="truncate">Total Value (M.Baht)</span>
                  </span>
                  <span className="hidden sm:inline text-[10px] text-amber-400/80">ကုန်သွယ်မှုပမာဏ</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-num text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                  {loading ? '--' : formatNumeral(live.value, numeralMode)}
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Value (M)
                </span>
              </div>
            </div>

            {/* Micro Formula Tip */}
            <div className="col-span-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                တွက်ချက်နည်း: <strong className="text-slate-200">SET</strong> ၏ နောက်ဆုံးဂဏန်း +{' '}
                <strong className="text-slate-200">Value</strong> ၏ ဒသမမတိုင်မီ နောက်ဆုံးဂဏန်း
              </span>
            </div>
          </div>
        </div>

        {/* 4 Sessions Result Cards for Today */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              ယနေ့ ထွက်ရှိပြီး / စောင့်ဆိုင်းဆဲ ရလဒ်များ (၄ ကြိမ်)
            </span>
            <span className="text-[11px] text-slate-400 font-num">
              ရက်စွဲ: {formatMyanmarDateLabel(live.date, numeralMode)}
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            {results.map((resItem, idx) => {
              const isClosed = resItem.twod && resItem.twod !== '--';
              const targetTimeMyanmar =
                idx === 0
                  ? '၁၁:၀၀ မနက်'
                  : idx === 1
                  ? '၁၂:၀၁ နေ့လယ်'
                  : idx === 2
                  ? '၀၃:၀၀ ညနေ'
                  : '၀၄:၃၀ ညနေ';

              return (
                <div
                  key={idx}
                  className={`rounded-xl p-3 border transition-all ${
                    isClosed
                      ? 'bg-slate-950/80 border-amber-500/40 shadow-sm'
                      : 'bg-slate-950/40 border-slate-800/80 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-amber-300 font-num">
                      {formatNumeral(resItem.open_time, numeralMode)}
                    </span>
                    <span className="text-[10px] text-slate-400">{targetTimeMyanmar}</span>
                  </div>

                  <div className="flex items-center justify-between my-1">
                    <span className="text-xs text-slate-400">ပေါက်ဂဏန်း</span>
                    <span
                      className={`font-num text-2xl font-black ${
                        isClosed
                          ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatNumeral(resItem.twod, numeralMode)}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-0.5 pt-1.5 border-t border-slate-800/60 font-num">
                    <div className="flex justify-between">
                      <span>SET:</span>
                      <span className="text-slate-300 font-semibold">{formatNumeral(resItem.set, numeralMode)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Value:</span>
                      <span className="text-slate-300 font-semibold">{formatNumeral(resItem.value, numeralMode)}</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-center">
                    {isClosed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        ထွက်ပြီး
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Hourglass className="w-3 h-3 text-amber-400 animate-spin" />
                        စောင့်ဆိုင်းဆဲ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
