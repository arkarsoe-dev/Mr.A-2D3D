import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Search,
  Sparkles,
  ExternalLink,
  Award,
  CalendarDays,
  ListFilter,
  Grid,
} from 'lucide-react';
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

export const ThreeDSection: React.FC<ThreeDSectionProps> = ({
  items,
  loading,
  numeralMode,
  initialMode = 'arkarsoe',
  onModeChange,
  hideHeroOnSubScreens = false,
}) => {
  const [activeMainMode, setActiveMainMode] = useState<ThreeDSubMode>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    if (initialMode) {
      setActiveMainMode(initialMode);
    }
  }, [initialMode]);

  const handleSelectMode = (mode: ThreeDSubMode) => {
    setActiveMainMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const latestDraw = items.length > 0 ? items[0] : null;

  // Filter items for the list view
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.result.includes(searchQuery) || item.datetime.includes(searchQuery);
    const matchesYear =
      selectedYear === 'all' || item.datetime.startsWith(selectedYear);
    return matchesSearch && matchesYear;
  });

  // Calculate next 3D draw date (1st or 16th of each month)
  const getNext3DDrawDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    let nextDrawDate: Date;
    if (currentDate < 1) {
      nextDrawDate = new Date(currentYear, currentMonth, 1);
    } else if (currentDate < 16) {
      nextDrawDate = new Date(currentYear, currentMonth, 16);
    } else {
      nextDrawDate = new Date(currentYear, currentMonth + 1, 1);
    }
    return nextDrawDate.toISOString().split('T')[0];
  };

  const nextDrawDateStr = getNext3DDrawDate();

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Latest 3D Winning Number Hero Card (Only show on main or when not explicitly hidden) */}
      {(!hideHeroOnSubScreens || activeMainMode === 'list') && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-4 sm:p-6 shadow-2xl shadow-amber-950/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="text-center md:text-left space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>ထိုင်း ၃လုံးထီ နောက်ဆုံးရလဒ် (Latest 3D)</span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-slate-100 flex items-center justify-center md:justify-start gap-2">
                <span>၃လုံးထီ ပေါက်စဉ်ရလဒ်</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                  1st & 16th Draw
                </span>
              </h2>

              <p className="text-xs text-slate-300 flex items-center justify-center md:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>ထွက်သည့်ရက်စွဲ: </span>
                <span className="font-bold text-amber-300 font-num">
                  {latestDraw
                    ? formatMyanmarDateLabel(latestDraw.datetime, numeralMode)
                    : '--'}
                </span>
              </p>
            </div>

            {/* 3D Digit Orbs */}
            {latestDraw ? (
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                {latestDraw.result.split('').map((digit, idx) => (
                  <div
                    key={idx}
                    className="w-14 h-18 sm:w-18 sm:h-22 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/20"
                  >
                    <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-center border border-amber-300/30">
                      <span className="font-num text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-300 to-amber-500 drop-shadow-md">
                        {formatNumeral(digit, numeralMode)}
                      </span>
                      <span className="text-[8px] sm:text-[9px] uppercase font-bold text-amber-400/80">
                        ဂဏန်း {idx + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm">ဒေတာရယူနေပါသည်...</div>
            )}
          </div>

          {/* Next Draw Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>နောက်တစ်ကြိမ် ၃လုံးထီ:</span>
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-num">
                {formatMyanmarDateLabel(nextDrawDateStr, numeralMode)} (ညနေ ၃:၃၀)
              </span>
            </div>

            <a
              href="https://www.thaistock2d.com/threedResult"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline"
            >
              <span>မူရင်းစတော့လင့်ခ်</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Screen 1: Arkar Soe Pro Interactive Table */}
      {activeMainMode === 'arkarsoe' && (
        <ArkarSoeCalendarTable items={items} numeralMode={numeralMode} />
      )}

      {/* Screen 2: 3D Monthly Calendar View */}
      {activeMainMode === 'monthlyCalendar' && (
        <ThreeDCalendarView items={items} numeralMode={numeralMode} />
      )}

      {/* Screen 3: Historical List with Search & Year Filter */}
      {activeMainMode === 'list' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  ၃လုံးထီ သမိုင်းဝင် ပေါက်စဉ်မှတ်တမ်းများ (1976 - 2026)
                </h3>
                <p className="text-xs text-slate-400">
                  စုစုပေါင်း {formatNumeral(items.length, numeralMode)} ကြိမ် ရှိပြီး ရက်စွဲ သို့မဟုတ် ဂဏန်းဖြင့် ရှာဖွေနိုင်ပါသည်
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Year filter */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
              >
                <option value="all">နှစ်အားလုံး (All)</option>
                {Array.from({ length: 51 }, (_, i) => 2026 - i).map((y) => (
                  <option key={y} value={String(y)}>
                    {formatNumeral(y, numeralMode)}
                  </option>
                ))}
              </select>

              {/* Search Input */}
              <div className="relative flex-1 sm:w-44">
                <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ဂဏန်း/ရက် ရှာရန်..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3D Result Grid/Table */}
          {loading && items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm animate-pulse">
              ၃လုံးထီ မှတ်တမ်းများကို ရယူနေပါသည်...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော ၃လုံးထီ ရလဒ် မတွေ့ရှိပါ။
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredItems.slice(0, 120).map((item, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 p-4 transition-all duration-200 flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatMyanmarDateLabel(item.datetime, numeralMode)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ရက်စွဲ: <span className="font-num">{formatNumeral(item.datetime, numeralMode)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30">
                      <span className="font-num text-2xl font-black text-amber-300 tracking-wider">
                        {formatNumeral(item.result, numeralMode)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info footer */}
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>တွေ့ရှိသော ရလဒ်: {formatNumeral(filteredItems.length, numeralMode)} ကြိမ်</span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              တရားဝင် ထိုင်းအစိုးရ ထီပေါက်စဉ် အပြည့်အစုံ
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
