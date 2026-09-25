import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calculator,
  Search,
  Flame,
  Layers,
  ArrowRight,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  X,
  Zap,
  Info,
} from 'lucide-react';
import { ThreeDItem, NumeralMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';
import {
  calculateDigitProperties,
  search3DHistory,
  getSameDateHistoricalMatches,
  calculateDigitFrequencies,
  DigitProperties,
} from '../utils/threeDCalculator';

interface ThreeDCalendarViewProps {
  items: ThreeDItem[];
  numeralMode: NumeralMode;
}

const MYANMAR_MONTHS = [
  'ဇန်နဝါရီ (January)',
  'ဖေဖော်ဝါရီ (February)',
  'မတ် (March)',
  'ဧပြီ (April)',
  'မေ (May)',
  'ဇွန် (June)',
  'ဇူလိုင် (July)',
  'ဩဂုတ် (August)',
  'စက်တင်ဘာ (September)',
  'အောက်တိုဘာ (October)',
  'နိုဝင်ဘာ (November)',
  'ဒီဇင်ဘာ (December)',
];

const WEEKDAY_NAMES = [
  { my: 'တနင်္ဂနွေ', en: 'Sun' },
  { my: 'တနင်္လာ', en: 'Mon' },
  { my: 'အင်္ဂါ', en: 'Tue' },
  { my: 'ဗုဒ္ဓဟူး', en: 'Wed' },
  { my: 'ကြာသပတေး', en: 'Thu' },
  { my: 'သောကြာ', en: 'Fri' },
  { my: 'စနေ', en: 'Sat' },
];

export const ThreeDCalendarView: React.FC<ThreeDCalendarViewProps> = ({
  items,
  numeralMode,
}) => {
  // Calendar state: default to latest available draw year (2026) and month (September = 8 in 0-indexed)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // 0-indexed (8 = September)
  const [viewSubTab, setViewSubTab] = useState<'calendar' | 'yearMatrix' | 'calculator'>('calendar');

  // Detail Modal for selected draw
  const [activeDrawDetail, setActiveDrawDetail] = useState<{
    date: string;
    result: string;
    props: DigitProperties | null;
  } | null>(null);

  // Calculator tools state
  const [calcInputNumber, setCalcInputNumber] = useState<string>('640');
  const [calcTargetMonth, setCalcTargetMonth] = useState<number>(9); // 1-indexed (9 = September)
  const [calcTargetHalf, setCalcTargetHalf] = useState<boolean>(false); // false = 16th draw, true = 1st draw

  // Create date lookup map for O(1) matching: YYYY-MM-DD -> result
  const drawsMap = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => {
      if (item.datetime && item.result) {
        map.set(item.datetime, item.result);
      }
    });
    return map;
  }, [items]);

  // Year options: 1976 through 2026 (descending)
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = 2026; y >= 1976; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Compute days in the selected month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const prevMonthDays = new Date(selectedYear, selectedMonth, 0).getDate();

    const days: {
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      winning3D?: string;
    }[] = [];

    // Preceding empty/prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = selectedMonth === 0 ? 12 : selectedMonth;
      const prevY = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
        winning3D: drawsMap.get(dateStr),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        winning3D: drawsMap.get(dateStr),
      });
    }

    // Trailing days to fill 35 or 42 grid slots
    const totalSlots = days.length > 35 ? 42 : 35;
    const remaining = totalSlots - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = selectedMonth === 11 ? 1 : selectedMonth + 2;
      const nextY = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        isCurrentMonth: false,
        dateStr,
        winning3D: drawsMap.get(dateStr),
      });
    }

    return days;
  }, [selectedYear, selectedMonth, drawsMap]);

  // Year Matrix: All draws in the selected year
  const yearDraws = useMemo(() => {
    return items
      .filter((item) => item.datetime.startsWith(String(selectedYear)))
      .sort((a, b) => a.datetime.localeCompare(b.datetime));
  }, [items, selectedYear]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      if (selectedYear > 1976) {
        setSelectedYear(selectedYear - 1);
        setSelectedMonth(11);
      }
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      if (selectedYear < 2026) {
        setSelectedYear(selectedYear + 1);
        setSelectedMonth(0);
      }
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Open detail breakdown
  const handleOpenDetail = (dateStr: string, resultStr: string) => {
    const props = calculateDigitProperties(resultStr);
    setActiveDrawDetail({
      date: dateStr,
      result: resultStr,
      props,
    });
  };

  // Calculator 1: Search results for custom input
  const searchResults = useMemo(() => {
    return search3DHistory(calcInputNumber, items);
  }, [calcInputNumber, items]);

  const calcInputProps = useMemo(() => {
    return calculateDigitProperties(calcInputNumber);
  }, [calcInputNumber]);

  // Calculator 2: Historical same date draws
  const sameDateHistory = useMemo(() => {
    return getSameDateHistoricalMatches(calcTargetMonth, calcTargetHalf, items);
  }, [calcTargetMonth, calcTargetHalf, items]);

  // Frequency Stats
  const frequencyStats = useMemo(() => {
    return calculateDigitFrequencies(items);
  }, [items]);

  return (
    <div className="space-y-5">
      {/* View SubTab Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800">
        <button
          onClick={() => setViewSubTab('calendar')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            viewSubTab === 'calendar'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>လအလိုက် 3D ပြက္ခဒိန်</span>
        </button>

        <button
          onClick={() => setViewSubTab('yearMatrix')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            viewSubTab === 'yearMatrix'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>တစ်နှစ်တာ ၂၄ ကြိမ် စာရင်း</span>
        </button>

        <button
          onClick={() => setViewSubTab('calculator')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition ${
            viewSubTab === 'calculator'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>3D တွက်ချက် & စစ်ဆေးစက်</span>
        </button>
      </div>

      {/* SubTab 1: Monthly Calendar Grid */}
      {viewSubTab === 'calendar' && (
        <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-4 sm:p-6 shadow-xl space-y-4">
          {/* Header Controls: Month/Year Selector & Nav */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                title="ယခင်လသို့"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-400 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {/* Month Selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {MYANMAR_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm font-black text-amber-400 font-num focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {formatNumeral(y, numeralMode)} ခုနှစ်
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleNextMonth}
                title="နောက်လသို့"
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 hover:text-amber-400 transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick jump to latest draw */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedYear(2026);
                  setSelectedMonth(8); // Sept 2026
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>နောက်ဆုံးထွက်လသို့ (၂၀၂၆ စက်တင်ဘာ)</span>
              </button>
            </div>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-bold text-slate-400">
            {WEEKDAY_NAMES.map((w, idx) => (
              <div
                key={idx}
                className={`py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 ${
                  idx === 0 ? 'text-rose-400' : idx === 6 ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                <span className="block text-[11px] sm:text-xs">{w.my}</span>
                <span className="block text-[9px] text-slate-500 uppercase">{w.en}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const hasDraw = Boolean(cell.winning3D);
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (hasDraw && cell.winning3D) {
                      handleOpenDetail(cell.dateStr, cell.winning3D);
                    }
                  }}
                  className={`min-h-[75px] sm:min-h-[92px] rounded-xl p-1.5 sm:p-2 border transition-all flex flex-col justify-between relative ${
                    hasDraw
                      ? 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950 border-amber-400/60 shadow-lg shadow-amber-950/30 cursor-pointer hover:border-amber-300 hover:scale-[1.02]'
                      : cell.isCurrentMonth
                      ? 'bg-slate-950/50 border-slate-800/70 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900 opacity-40'
                  }`}
                >
                  {/* Top Day Number */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-num font-bold ${
                        hasDraw
                          ? 'text-amber-300 font-black'
                          : cell.isCurrentMonth
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatNumeral(cell.dayNumber, numeralMode)}
                    </span>

                    {hasDraw && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                  </div>

                  {/* 3D Winning Number Pill */}
                  {hasDraw && cell.winning3D ? (
                    <div className="my-auto text-center py-1">
                      <div className="inline-block px-1.5 sm:px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/50">
                        <span className="font-num text-base sm:text-xl font-black text-amber-300 tracking-wider drop-shadow-sm">
                          {formatNumeral(cell.winning3D, numeralMode)}
                        </span>
                      </div>
                      <span className="block text-[8px] sm:text-[9px] text-amber-400/90 font-bold mt-0.5">
                        3D ထွက်ဂဏန်း
                      </span>
                    </div>
                  ) : (
                    <div className="h-6" />
                  )}

                  {/* Bottom Indicator for 1st or 16th draw label */}
                  {hasDraw && (
                    <div className="text-[9px] text-slate-400 text-center truncate">
                      {cell.dayNumber <= 5 ? '၁ ရက် ထွက်' : '၁၆ ရက် ထွက်'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Info */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-amber-500 border border-amber-300 inline-block"></span>
              <span>ရွှေရောင်အကွက်သည် 3D ထီပေါက်စဉ် ထွက်ပေါ်သော နေ့ရက်ဖြစ်ပြီး နှိပ်၍ အသေးစိတ် တွက်ချက်မှု ကြည့်ရှုနိုင်ပါသည်။</span>
            </div>
            <div className="text-amber-400 font-bold">
              စုစုပေါင်း မှတ်တမ်း: {formatNumeral(items.length, numeralMode)} ကြိမ်
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Full Year 24-Draw Matrix */}
      {viewSubTab === 'yearMatrix' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{formatNumeral(selectedYear, numeralMode)} ခုနှစ် တစ်နှစ်တာ ၃လုံးထီ ၂၄ ကြိမ် ရလဒ်ဇယား</span>
              </h3>
              <p className="text-xs text-slate-400">
                လစဉ် ၁ ရက် နှင့် ၁၆ ရက် ထွက်ဂဏန်းများ၊ ပေါင်းလဒ်၊ ပါဝါနှင့် နက္ခတ်တွက်ချက်မှုများ
              </p>
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">ခုနှစ်ရွေးရန်:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-black text-amber-400 font-num focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {formatNumeral(y, numeralMode)} ခုနှစ်
                  </option>
                ))}
              </select>
            </div>
          </div>

          {yearDraws.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              ဤခုနှစ်အတွက် ၃လုံးထီ အချက်အလက် မတွေ့ရှိပါ။
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {yearDraws.map((draw, idx) => {
                const props = calculateDigitProperties(draw.result);
                return (
                  <div
                    key={idx}
                    onClick={() => handleOpenDetail(draw.datetime, draw.result)}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 transition cursor-pointer flex items-center justify-between shadow-sm group"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatMyanmarDateLabel(draw.datetime, numeralMode)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>ရက်စွဲ: {formatNumeral(draw.datetime, numeralMode)}</span>
                        {props && (
                          <span className="text-amber-400/90 font-num">
                            ပေါင်း: {formatNumeral(props.sumTotal, numeralMode)} ({formatNumeral(props.sumSingle, numeralMode)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 group-hover:border-amber-400 transition">
                        <span className="font-num text-2xl font-black text-amber-300 tracking-wider">
                          {formatNumeral(draw.result, numeralMode)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: 3D Calculator, Permutation & Same-Date Matcher */}
      {viewSubTab === 'calculator' && (
        <div className="space-y-5">
          {/* Tool A: Number Search & Formula Breakdown */}
          <div className="rounded-2xl bg-slate-900/90 border border-amber-500/30 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-400" />
                  <span>3D ဂဏန်းစစ်ဆေးစက် နှင့် ပတ်လည် (R) ရှာဖွေစနစ်</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ၃လုံးထီ ဂဏန်းတစ်ခုစီ၏ သမိုင်းတစ်လျှောက် ပေါက်ခဲ့ဖူးသော အကြိမ်ရေ၊ ပါဝါ၊ နက္ခတ်နှင့် ပတ်လည်ရလဒ်များ
                </p>
              </div>

              {/* Number input */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-amber-300 whitespace-nowrap">ဂဏန်းထည့်ရန်:</label>
                <input
                  type="text"
                  maxLength={3}
                  value={calcInputNumber}
                  onChange={(e) => setCalcInputNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="640"
                  className="w-24 bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-1.5 text-center text-lg font-black text-amber-300 font-num focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Calculations Breakdown Card */}
            {calcInputProps && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">ပေါင်းဂဏန်း (Sum)</span>
                  <span className="font-num text-lg font-bold text-amber-300">
                    {formatNumeral(calcInputProps.sumTotal, numeralMode)} ({formatNumeral(calcInputProps.sumSingle, numeralMode)})
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">ပါဝါဂဏန်း (Power)</span>
                  <span className="font-num text-lg font-bold text-emerald-300">
                    {formatNumeral(calcInputProps.powerNumber, numeralMode)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">နက္ခတ်ဂဏန်း (Natkhat)</span>
                  <span className="font-num text-lg font-bold text-purple-300">
                    {formatNumeral(calcInputProps.natkhatNumber, numeralMode)}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">၂လုံးတွဲ (Front/Back/Cut)</span>
                  <span className="font-num text-xs font-bold text-slate-200">
                    {formatNumeral(calcInputProps.frontPair, numeralMode)} | {formatNumeral(calcInputProps.backPair, numeralMode)} | {formatNumeral(calcInputProps.cutPair, numeralMode)}
                  </span>
                </div>
              </div>
            )}

            {/* Exact and Permutation Match History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  သမိုင်းတစ်လျှောက် တိုက်ရိုက်ပေါက်ခဲ့ဖူးသော အကြိမ်ရေ: ({formatNumeral(searchResults.exactMatches.length, numeralMode)} ကြိမ်)
                </span>
                <span className="text-slate-400">
                  ပတ်လည်အပါအဝင်: {formatNumeral(searchResults.permutationMatches.length, numeralMode)} ကြိမ်
                </span>
              </div>

              {searchResults.exactMatches.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
                  ဤဂဏန်း ({calcInputNumber}) သည် ၁၉၇၆ မှ ယနေ့အထိ တိုက်ရိုက်မထွက်ဖူးသေးပါ (မထွက်ဖူးသော ဂဏန်းအဖြစ် မွေးရန် သင့်တော်နိုင်ပါသည်)။
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {searchResults.exactMatches.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs"
                    >
                      <div className="text-slate-300">
                        <span>{formatMyanmarDateLabel(m.datetime, numeralMode)}</span>
                        <div className="text-[10px] text-slate-500 font-num">{formatNumeral(m.datetime, numeralMode)}</div>
                      </div>
                      <span className="font-num text-lg font-black text-emerald-400">
                        {formatNumeral(m.result, numeralMode)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tool B: Same-Date Historical Pattern Matcher */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <span>တူညီသော ရက်စွဲ ယခင်နှစ်များ တိုက်ဆိုင်စစ်ဆေးမှု (Same-Date Historical Matcher)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  ဥပမာ: စက်တင်ဘာ ၁၆ ရက် (သို့) အောက်တိုဘာ ၁ ရက် တွင် နှစ်စဉ်နှစ်တိုင်း အရင်က ဘာတွေ ထွက်ခဲ့သလဲ ကြည့်ရှုပြီး လာမည့်အကြိမ်အတွက် တွက်ချက်နိုင်ပါသည်
                </p>
              </div>

              {/* Selector for Target Draw Month & Half */}
              <div className="flex items-center gap-2">
                <select
                  value={calcTargetMonth}
                  onChange={(e) => setCalcTargetMonth(parseInt(e.target.value, 10))}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {MYANMAR_MONTHS.map((m, idx) => (
                    <option key={idx} value={idx + 1}>
                      {m.split(' ')[0]}
                    </option>
                  ))}
                </select>

                <select
                  value={calcTargetHalf ? '1' : '16'}
                  onChange={(e) => setCalcTargetHalf(e.target.value === '1')}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="1">၁ ရက်နေ့ ထွက်</option>
                  <option value="16">၁၆ ရက်နေ့ ထွက်</option>
                </select>
              </div>
            </div>

            {/* List of same-date draws across all years */}
            <div className="space-y-3">
              <div className="text-xs text-slate-300 flex items-center justify-between">
                <span>
                  တွေ့ရှိသော နှစ်အလိုက် ထွက်ဂဏန်းများ: ({formatNumeral(sameDateHistory.length, numeralMode)} ကြိမ်)
                </span>
                <span className="text-amber-400 font-bold">
                  {calcTargetHalf ? '၁ ရက်' : '၁၆ ရက်'} ထွက်စဉ်များ
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                {sameDateHistory.map((rec, i) => (
                  <div
                    key={i}
                    onClick={() => handleOpenDetail(rec.datetime, rec.result)}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-num text-xs font-bold text-slate-400">
                        {formatNumeral(rec.datetime.split('-')[0], numeralMode)}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {formatNumeral(rec.datetime, numeralMode)}
                      </div>
                    </div>
                    <span className="font-num text-xl font-black text-amber-300">
                      {formatNumeral(rec.result, numeralMode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tool C: Digit Frequency Heatmap (Head, Mid, Tail) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <span>ထိပ်စီး၊ အလယ်၊ နောက်ပိတ် ဂဏန်းကြိမ်နှုန်း (Digit Frequency Analysis)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Head Digit Frequency */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  ထိပ်စီးဂဏန်း (Head Digit 0-9)
                </span>
                <div className="space-y-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                    const count = frequencyStats.headCounts[String(digit)] || 0;
                    const pct = Math.round((count / (items.length || 1)) * 100);
                    return (
                      <div key={digit} className="flex items-center gap-2 text-xs">
                        <span className="font-num font-bold text-amber-300 w-4">{formatNumeral(digit, numeralMode)}:</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, pct * 4)}%` }}
                          />
                        </div>
                        <span className="font-num text-[11px] text-slate-400 w-10 text-right">
                          {formatNumeral(count, numeralMode)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mid Digit Frequency */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  အလယ်ဂဏန်း (Mid Digit 0-9)
                </span>
                <div className="space-y-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                    const count = frequencyStats.midCounts[String(digit)] || 0;
                    const pct = Math.round((count / (items.length || 1)) * 100);
                    return (
                      <div key={digit} className="flex items-center gap-2 text-xs">
                        <span className="font-num font-bold text-emerald-300 w-4">{formatNumeral(digit, numeralMode)}:</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, pct * 4)}%` }}
                          />
                        </div>
                        <span className="font-num text-[11px] text-slate-400 w-10 text-right">
                          {formatNumeral(count, numeralMode)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tail Digit Frequency */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" />
                  နောက်ပိတ်ဂဏန်း (Tail Digit 0-9)
                </span>
                <div className="space-y-1.5">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
                    const count = frequencyStats.tailCounts[String(digit)] || 0;
                    const pct = Math.round((count / (items.length || 1)) * 100);
                    return (
                      <div key={digit} className="flex items-center gap-2 text-xs">
                        <span className="font-num font-bold text-purple-300 w-4">{formatNumeral(digit, numeralMode)}:</span>
                        <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, pct * 4)}%` }}
                          />
                        </div>
                        <span className="font-num text-[11px] text-slate-400 w-10 text-right">
                          {formatNumeral(count, numeralMode)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draw Detail Breakdown Modal */}
      {activeDrawDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  ၃လုံးထီ ဂဏန်းအသေးစိတ် တွက်ချက်မှု (3D Detail Breakdown)
                </h3>
              </div>
              <button
                onClick={() => setActiveDrawDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Big Digit Display */}
            <div className="text-center p-4 rounded-xl bg-slate-950 border border-amber-500/30">
              <div className="text-xs text-slate-400 mb-1">
                ထွက်ပေါ်သည့်ရက်စွဲ: {formatMyanmarDateLabel(activeDrawDetail.date, numeralMode)}
              </div>
              <div className="font-num text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                {formatNumeral(activeDrawDetail.result, numeralMode)}
              </div>
            </div>

            {/* Calculations Breakdown */}
            {activeDrawDetail.props && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ပေါင်းဂဏန်း (Sum)</span>
                  <span className="font-num text-base font-bold text-amber-300">
                    {formatNumeral(activeDrawDetail.props.sumTotal, numeralMode)} (နောက်ဆုံး: {formatNumeral(activeDrawDetail.props.sumSingle, numeralMode)})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">ပါဝါဂဏန်း (Power)</span>
                  <span className="font-num text-base font-bold text-emerald-300">
                    {formatNumeral(activeDrawDetail.props.powerNumber, numeralMode)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">နက္ခတ်ဂဏန်း (Natkhat)</span>
                  <span className="font-num text-base font-bold text-purple-300">
                    {formatNumeral(activeDrawDetail.props.natkhatNumber, numeralMode)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">စုံ/မ အမျိုးအစား</span>
                  <span className="text-xs font-bold text-slate-200">
                    {activeDrawDetail.props.evenOddType} ({activeDrawDetail.props.highLowType})
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-1">ခွဲခြမ်းစိတ်ဖြာ ၂လုံးတွဲများ:</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-num">
                      ရှေ့၂လုံး: {formatNumeral(activeDrawDetail.props.frontPair, numeralMode)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-num">
                      နောက်၂လုံး: {formatNumeral(activeDrawDetail.props.backPair, numeralMode)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-num">
                      အလယ်ဖြတ်: {formatNumeral(activeDrawDetail.props.cutPair, numeralMode)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveDrawDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
