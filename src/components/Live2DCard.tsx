import React, { useState } from 'react';
import {
  TrendingUp,
  Clock,
  Calendar,
  CheckCircle2,
  Hourglass,
  Layers,
  Code2,
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

export const Live2DCard: React.FC<Live2DCardProps> = ({ data, numeralMode, loading }) => {
  const [showJson, setShowJson] = useState(false);

  const live = data?.live || {
    set: '--',
    value: '--',
    time: '--',
    twod: '--',
    date: '--',
  };

  const results = data?.result || [];
  const serverTime = data?.server_time || '';

  // Construct raw JSON representation as requested in prompt
  const rawJsonObject = {
    server_time: formatNumeral(serverTime, numeralMode),
    live: {
      set: formatNumeral(live.set, numeralMode),
      value: formatNumeral(live.value, numeralMode),
      time: formatNumeral(live.time, numeralMode),
      twod: formatNumeral(live.twod, numeralMode),
      date: formatNumeral(live.date, numeralMode),
    },
  };

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
      return { text: 'စျေးကွက်ပိတ်သိမ်းပြီး', color: 'text-slate-400 bg-slate-800/50 border-slate-700/50' };
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
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              မြန်မာ ၂လုံးထီ တိုက်ရိုက်ထုတ်လွှင့်မှု (LIVE)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${marketStatus.color}`}>
              {marketStatus.text}
            </span>
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="API JSON အချက်အလက် ကြည့်ရန်"
            >
              <Code2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{showJson ? 'Card View' : 'JSON ပြရန်'}</span>
            </button>
          </div>
        </div>

        {/* Raw JSON View if toggled */}
        {showJson ? (
          <div className="my-5 p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 font-mono text-xs text-amber-300 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400 font-sans text-xs">
              <span>👉 Live Endpoint Raw Output:</span>
              <span className="text-emerald-400">api.thaistock2d.com/live</span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(rawJsonObject, null, 2)}
            </pre>
          </div>
        ) : (
          /* Visual Big Display */
          <div className="my-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* 2D Big Number Circle */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4">
              <span className="text-xs sm:text-sm font-semibold text-amber-400/90 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                ယခုထွက်ပေါ်နေသော ၂လုံးထီ ဂဏန်း
              </span>

              {/* Glowing Digit Pod */}
              <div className="relative group">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-2xl shadow-amber-500/30 animate-pulse-glow">
                  <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center border-4 border-slate-950">
                    <span className="font-num text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 tracking-tighter drop-shadow-md">
                      {loading ? '--' : formatNumeral(live.twod, numeralMode)}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 mt-1 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
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
            <div className="md:col-span-6 space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Thai Stock SET Index
                  </span>
                  <span className="text-[10px] text-amber-400/80">ထိုင်းစတော့အညွှန်းကိန်း</span>
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

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="w-4 h-4 text-amber-400" />
                    Trading Value (Million THB)
                  </span>
                  <span className="text-[10px] text-amber-400/80">ကုန်သွယ်မှုပမာဏ</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="font-num text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                    {loading ? '--' : formatNumeral(live.value, numeralMode)}
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Live Value
                  </span>
                </div>
              </div>

              {/* Formula Explanation Tooltip */}
              <div className="p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/90 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">၂လုံးထီ တွက်ချက်ပုံသဘောတရား: </span>
                  SET ရဲ့ နောက်ဆုံးဂဏန်းနှင့် VALUE ရဲ့ ရှေ့ပြေးဒသမဂဏန်းကို ပေါင်းစပ်၍ ၂လုံးထီ ပေါက်ဂဏန်းအဖြစ် သတ်မှတ်ပါသည်။
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Daily 4-Session Grid: 11:00 AM, 12:01 PM, 03:00 PM, 04:30 PM */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            ယနေ့ ၂လုံးထီ အချိန်ပိုင်းအလိုက် ရလဒ်များ (Daily Results)
          </h2>
          <span className="text-xs text-slate-400 font-num">
            {formatMyanmarDateLabel(live.date, numeralMode)}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {results.map((item, idx) => {
            const isCompleted = item.twod && item.twod !== '--';
            const sessionTitles = [
              '၁၁:၀၀ မနက် (11:00 AM)',
              '၁၂:၀၁ နေ့လည် (12:01 PM)',
              '၀၃:၀၀ ညနေ (03:00 PM)',
              '၀၄:၃၀ ညနေ (04:30 PM)',
            ];
            const title = sessionTitles[idx] || item.open_time;

            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-xl p-3.5 border transition-all ${
                  isCompleted
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-950/20 hover:border-amber-400'
                    : 'bg-slate-900/50 border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-300">
                    {title}
                  </span>
                  {isCompleted ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      ထွက်ပြီး
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                      <Hourglass className="w-3 h-3" />
                      စောင့်ဆိုင်း
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between my-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">ပေါက်ဂဏန်း</span>
                    <span
                      className={`font-num text-3xl font-black ${
                        isCompleted
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-400'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatNumeral(item.twod, numeralMode)}
                    </span>
                  </div>

                  <div className="text-right text-[11px] font-num space-y-0.5">
                    <div className="text-slate-400">
                      SET: <span className="text-slate-200">{formatNumeral(item.set, numeralMode)}</span>
                    </div>
                    <div className="text-slate-400">
                      VAL: <span className="text-amber-300/90">{formatNumeral(item.value, numeralMode)}</span>
                    </div>
                  </div>
                </div>

                {/* Sub info */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>စတော့အချိန်</span>
                  <span className="font-num text-slate-300">
                    {formatNumeral(item.open_time, numeralMode)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
