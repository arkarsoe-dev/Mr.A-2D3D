import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Flame,
  Palette,
  Edit3,
  X,
  Sparkles,
  BarChart2,
  PieChart,
  Brain,
  Download,
  Upload,
  Info,
  Layers,
  ChevronRight,
  TrendingUp,
  Eye,
  Eraser,
  Hash,
  CheckCircle2,
} from 'lucide-react';
import { ThreeDItem, NumeralMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';
import { calculateDigitProperties, DigitProperties } from '../utils/threeDCalculator';

interface ArkarSoeCalendarTableProps {
  items: ThreeDItem[];
  numeralMode: NumeralMode;
}

const VIBRANT_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#22c55e', // Green
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#0ea5e9', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
];

const MONTH_LABELS = [
  'ဇန် ၁', 'ဇန် ၁၆',
  'ဖေ ၁', 'ဖေ ၁၆',
  'မတ် ၁', 'မတ် ၁၆',
  'ဧ ၁', 'ဧ ၁၆',
  'မေ ၁', 'မေ ၁၆',
  'ဇွန် ၁', 'ဇွန် ၁၆',
  'ဇူ ၁', 'ဇူ ၁၆',
  'ဩ ၁', 'ဩ ၁၆',
  'စက် ၁', 'စက် ၁၆',
  'အောက် ၁', 'အောက် ၁၆',
  'နို ၁', 'နို ၁၆',
  'ဒီ ၁', 'ဒီ ၁၆',
];

const getContrastYIQ = (hexcolor?: string) => {
  if (!hexcolor) return '#f1f5f9';
  let hex = hexcolor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f172a' : '#ffffff';
};

export const ArkarSoeCalendarTable: React.FC<ArkarSoeCalendarTableProps> = ({
  items,
  numeralMode,
}) => {
  // User custom cell edits (numbers, colors, comments) stored in localStorage
  const [userStyles, setUserStyles] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mra_arkar_styles') || '{}');
    } catch {
      return {};
    }
  });

  const [userComments, setUserComments] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mra_arkar_comments') || '{}');
    } catch {
      return {};
    }
  });

  const [userCustomNumbers, setUserCustomNumbers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('mra_arkar_custom_nums') || '{}');
    } catch {
      return {};
    }
  });

  // Controls & Modes
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [zoom, setZoom] = useState<number>(1);
  const [isHeatmap, setIsHeatmap] = useState(false);
  const [showDoublesOnly, setShowDoublesOnly] = useState(false);
  const [digitDisplayMode, setDigitDisplayMode] = useState<'3d' | 'last2'>('3d'); // 3D vs 2D mode

  // Modals
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // SVG Connection lines
  const [lineCoords, setLineCoords] = useState<{ x: number; y: number }[]>([]);
  const tableRef = useRef<HTMLTableElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Convert raw items into organized matrix: Year -> Array(24) of numbers
  const organized = useMemo(() => {
    const map: Record<number, (string | null)[]> = {};

    items.forEach((item) => {
      if (!item.datetime) return;
      const parts = item.datetime.split('-');
      if (parts.length < 3) return;

      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1; // 0-indexed month
      const d = parseInt(parts[2], 10);

      if (isNaN(y) || isNaN(m) || isNaN(d)) return;

      if (!map[y]) {
        map[y] = Array(24).fill(null);
      }

      // Round index: 0 = Jan 1, 1 = Jan 16, 2 = Feb 1, ..., 23 = Dec 16
      const rIdx = m * 2 + (d >= 14 ? 1 : 0);
      if (rIdx < 24) {
        map[y][rIdx] = String(item.result || '');
      }
    });

    // Merge with user's custom cell numbers (if any)
    Object.entries(userCustomNumbers).forEach(([cellId, val]) => {
      const [yStr, rStr] = cellId.split('-');
      const y = parseInt(yStr, 10);
      const r = parseInt(rStr, 10);
      if (!isNaN(y) && !isNaN(r)) {
        if (!map[y]) map[y] = Array(24).fill(null);
        map[y][r] = val;
      }
    });

    // Ensure sorted years list: 1976 through 2026 + 1 (future prediction year)
    let years = Object.keys(map).map(Number).sort((a, b) => a - b);
    if (years.length === 0) years = [new Date().getFullYear()];

    // Add next upcoming year for user predictions
    const latestYear = years[years.length - 1];
    const nextYear = latestYear + 1;
    if (!map[nextYear]) map[nextYear] = Array(24).fill(null);
    if (!years.includes(nextYear)) years.push(nextYear);

    return { map, years };
  }, [items, userCustomNumbers]);

  // Frequency map for heatmap
  const frequencyMap = useMemo(() => {
    const freq: Record<string, number> = {};
    organized.years.forEach((y) => {
      organized.map[y]?.forEach((val) => {
        if (val) {
          const displayNum = digitDisplayMode === 'last2' && val.length === 3 ? val.slice(1) : val;
          freq[displayNum] = (freq[displayNum] || 0) + 1;
        }
      });
    });
    return freq;
  }, [organized, digitDisplayMode]);

  // Active highlighted number (via search or selected cell)
  const activeNum = useMemo(() => {
    if (search.trim()) return search.trim();
    if (!selectedId) return null;
    const [y, r] = selectedId.split('-');
    const val = organized.map[parseInt(y, 10)]?.[parseInt(r, 10)];
    if (!val) return null;
    return digitDisplayMode === 'last2' && val.length === 3 ? val.slice(1) : val;
  }, [selectedId, organized, search, digitDisplayMode]);

  // Active path summary
  const pathMatches = useMemo(() => {
    if (!activeNum) return [];
    const matches: { year: number; round: number; dateLabel: string; fullNum: string }[] = [];

    organized.years.forEach((y) => {
      organized.map[y]?.forEach((val, r) => {
        if (!val) return;
        const compareVal = digitDisplayMode === 'last2' && val.length === 3 ? val.slice(1) : val;
        if (compareVal === activeNum) {
          matches.push({
            year: y,
            round: r + 1,
            dateLabel: MONTH_LABELS[r] || `Round ${r + 1}`,
            fullNum: val,
          });
        }
      });
    });
    return matches;
  }, [activeNum, organized, digitDisplayMode]);

  // Update SVG connection lines when activeNum changes
  const updateLines = () => {
    if (!activeNum || !tableRef.current) {
      setLineCoords([]);
      return;
    }

    const coords: { x: number; y: number }[] = [];
    organized.years.forEach((y) => {
      organized.map[y]?.forEach((val, r) => {
        if (!val) return;
        const compareVal = digitDisplayMode === 'last2' && val.length === 3 ? val.slice(1) : val;
        if (compareVal === activeNum) {
          const cell = tableRef.current?.querySelector(`[data-id="${y}-${r}"]`) as HTMLElement;
          if (cell) {
            coords.push({
              x: cell.offsetLeft + cell.offsetWidth / 2,
              y: cell.offsetTop + cell.offsetHeight / 2,
            });
          }
        }
      });
    });

    setLineCoords(coords);
  };

  useEffect(() => {
    const timer = setTimeout(updateLines, 100);
    return () => clearTimeout(timer);
  }, [activeNum, zoom, organized, digitDisplayMode]);

  // Quick Edit Save handler
  const saveQuickEdit = (
    cellId: string,
    num: string,
    commentText: string,
    colorStyle: string
  ) => {
    if (!cellId) return;

    // Update Number
    const updatedNums = { ...userCustomNumbers };
    if (num.trim()) {
      updatedNums[cellId] = num.trim();
    } else {
      delete updatedNums[cellId];
    }
    setUserCustomNumbers(updatedNums);
    localStorage.setItem('mra_arkar_custom_nums', JSON.stringify(updatedNums));

    // Update Comment
    const updatedComments = { ...userComments };
    if (commentText.trim()) {
      updatedComments[cellId] = commentText.trim();
    } else {
      delete updatedComments[cellId];
    }
    setUserComments(updatedComments);
    localStorage.setItem('mra_arkar_comments', JSON.stringify(updatedComments));

    // Update Color Style
    const updatedStyles = { ...userStyles };
    if (colorStyle) {
      updatedStyles[cellId] = colorStyle;
    } else {
      delete updatedStyles[cellId];
    }
    setUserStyles(updatedStyles);
    localStorage.setItem('mra_arkar_styles', JSON.stringify(updatedStyles));
  };

  // Export JSON (like in arkarsoe original)
  const handleExportJSON = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      userStyles,
      userComments,
      userCustomNumbers,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3d-calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('တွက်ချက်မှု မှတ်တမ်းများကို Export ထုတ်ယူပြီးပါပြီ');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.userStyles) setUserStyles(json.userStyles);
        if (json.userComments) setUserComments(json.userComments);
        if (json.userCustomNumbers) setUserCustomNumbers(json.userCustomNumbers);

        localStorage.setItem('mra_arkar_styles', JSON.stringify(json.userStyles || {}));
        localStorage.setItem('mra_arkar_comments', JSON.stringify(json.userComments || {}));
        localStorage.setItem('mra_arkar_custom_nums', JSON.stringify(json.userCustomNumbers || {}));

        showToast('မှတ်တမ်းများကို Import သွင်းယူပြီးပါပြီ');
      } catch {
        showToast('JSON ဖိုင် ပုံစံမမှန်ပါ');
      }
    };
    reader.readAsText(file);
  };

  // Selected cell helper
  const selectedCellData = useMemo(() => {
    if (!selectedId) return null;
    const [yStr, rStr] = selectedId.split('-');
    const y = parseInt(yStr, 10);
    const r = parseInt(rStr, 10);
    const val = organized.map[y]?.[r] || '';
    const dateLabel = MONTH_LABELS[r] || `Round ${r + 1}`;
    const props = calculateDigitProperties(val);

    return {
      id: selectedId,
      year: y,
      round: r + 1,
      dateLabel,
      value: val,
      props,
      color: userStyles[selectedId] || '',
      comment: userComments[selectedId] || '',
    };
  }, [selectedId, organized, userStyles, userComments]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Deck */}
      <div className="rounded-2xl bg-slate-900 border border-amber-500/30 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                အာကာစိုး 3D Calendar UI
              </span>
              <span className="text-xs font-bold text-amber-300">
                (၁၉၇၆ မှ {organized.years[organized.years.length - 1]} အထိ ၂၄ ကြိမ် စုံစုံလင်လင်)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              အကွက်များကို ကလစ်နှိပ်၍ အရောင်ခြယ်ခြင်း၊ မှတ်ချက်ရေးခြင်း၊ ပတ်လည်လိုင်းများ ဆွဲသားခြင်းနှင့် AI စနစ်ဖြင့် ကိုယ်တိုင်တွက်ချက်နိုင်ပါသည်
            </p>
          </div>

          {/* Quick Actions (AI, Pattern, Stats, Export) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowAIModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition cursor-pointer"
            >
              <Brain className="w-4 h-4 text-purple-200" />
              <span>AI တွက်ချက်မှု</span>
            </button>

            <button
              onClick={() => setShowPatternModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <PieChart className="w-4 h-4 text-emerald-400" />
              <span>Pattern စစ်တမ်း</span>
            </button>

            <button
              onClick={() => setShowStatsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>အထွက်အများဆုံး</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="တွက်ချက်မှုဒေတာ Export ထုတ်ယူရန်"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="ဒေတာ Backup JSON သွင်းရန်"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition cursor-pointer"
            >
              <Upload className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>

        {/* Toolbar: Search, Display Mode, Heatmap, Doubles, Zoom Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Search input */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ဂဏန်းရှာပါ (ဥပမာ: 640 သို့ 40)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-amber-300 font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Center: View Mode Switches */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 3D vs Last 2 Digits toggle */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center">
              <button
                onClick={() => setDigitDisplayMode('3d')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                  digitDisplayMode === '3d'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D အပြည့်
              </button>
              <button
                onClick={() => setDigitDisplayMode('last2')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
                  digitDisplayMode === 'last2'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                နောက် ၂ လုံး
              </button>
            </div>

            {/* Heatmap Toggle */}
            <button
              onClick={() => setIsHeatmap(!isHeatmap)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                isHeatmap
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Heatmap</span>
            </button>

            {/* Doubles Toggle */}
            <button
              onClick={() => setShowDoublesOnly(!showDoublesOnly)}
              className={`px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition ${
                showDoublesOnly
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>အပူးများ (Doubles)</span>
            </button>
          </div>

          {/* Right: Zoom controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.1))}
              title="ချုံ့ရန် (Zoom Out)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-num text-[11px] font-bold text-slate-300 px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(1.8, prev + 0.1))}
              title="ချဲ့ရန် (Zoom In)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              title="မူလအတိုင်း (Reset)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-900"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Path Tracker Summary Bar (when number highlighted) */}
        {activeNum && pathMatches.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-num font-black text-amber-300 text-base bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                {activeNum}
              </span>
              <span className="text-slate-200">
                အဝါရောင်ပတ်လည်လိုင်းဖြင့် ချိတ်ဆက်ထားသော ထွက်ရှိမှု စုစုပေါင်း: <strong className="text-amber-300">{pathMatches.length}</strong> ကြိမ်
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {pathMatches.slice(0, 8).map((m, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-num text-slate-300 whitespace-nowrap"
                >
                  {m.year} ({m.dateLabel})
                </span>
              ))}
              {pathMatches.length > 8 && (
                <span className="text-[10px] text-slate-400">+{pathMatches.length - 8} ခု</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Fullscreen Table Viewport with SVG Lines */}
      <div className="relative rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden min-h-[550px] max-h-[75vh] flex flex-col">
        <div className="arkar-table-viewport flex-1" style={{ touchAction: 'pan-x pan-y' }}>
          <div
            className="arkar-zoom-wrapper"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* SVG Connection Lines for highlighted paths */}
            <svg
              className="absolute inset-0 pointer-events-none z-30"
              style={{
                width: tableRef.current ? tableRef.current.offsetWidth : '100%',
                height: tableRef.current ? tableRef.current.offsetHeight : '100%',
              }}
            >
              {lineCoords.length > 1 && (
                <path
                  d={lineCoords.reduce(
                    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
                    ''
                  )}
                  className="arkar-connection-line"
                />
              )}
              {lineCoords.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* The Master Grid Table */}
            <table ref={tableRef} className="arkar-table">
              <thead>
                <tr>
                  {/* Sticky Corner: Round / Year */}
                  <th className="arkar-thead-th arkar-sticky-col arkar-sticky-corner text-[11px] text-amber-400">
                    ရက်/နှစ်
                  </th>

                  {/* Year Headers: 1976 -> 2026 + 2027 */}
                  {organized.years.map((y) => {
                    const isCurrentYear = y === 2026;
                    const isUpcomingYear = y > 2026;
                    return (
                      <th
                        key={y}
                        className={`arkar-thead-th px-2 py-2 font-num text-xs tracking-tight ${
                          isCurrentYear
                            ? 'text-amber-300 bg-amber-950/40 border-b-2 border-amber-400'
                            : isUpcomingYear
                            ? 'text-purple-300 bg-purple-950/40'
                            : 'text-slate-300'
                        }`}
                      >
                        {formatNumeral(y, numeralMode)}
                        {isUpcomingYear && <span className="block text-[8px] text-purple-400">အသစ်</span>}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {MONTH_LABELS.map((monthLabel, rIdx) => {
                  const isFirstHalf = rIdx % 2 === 0;
                  return (
                    <tr key={rIdx} className="hover:bg-slate-900/30 transition">
                      {/* Left Column: Month & Draw Round */}
                      <td className="arkar-sticky-col text-slate-300 py-1.5 px-1 border-b border-slate-900">
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-[10px] font-bold text-amber-400">
                            {monthLabel.split(' ')[0]}
                          </span>
                          <span className="font-num text-[11px] font-extrabold text-slate-300 mt-0.5">
                            {isFirstHalf ? '1' : '16'}
                          </span>
                        </div>
                      </td>

                      {/* Year Columns Data Cells */}
                      {organized.years.map((y) => {
                        const id = `${y}-${rIdx}`;
                        const rawNum = organized.map[y]?.[rIdx] || '';

                        // Number display format (3D or Last 2)
                        const displayVal =
                          digitDisplayMode === 'last2' && rawNum.length === 3
                            ? rawNum.slice(1)
                            : rawNum;

                        const isFocused = selectedId === id;
                        const isHighlighted =
                          Boolean(activeNum && displayVal && displayVal === activeNum);
                        const isDouble =
                          displayVal.length >= 2 &&
                          displayVal[displayVal.length - 2] === displayVal[displayVal.length - 1];

                        // Determine background style
                        let cellBg = userStyles[id] || '';

                        if (isHeatmap && displayVal) {
                          const count = frequencyMap[displayVal] || 0;
                          const opacity = Math.min(1, count / 8);
                          cellBg = `rgba(239, 68, 68, ${Math.max(0.2, opacity)})`;
                        }

                        if (showDoublesOnly && isDouble) {
                          cellBg = '#ef4444';
                        }

                        if (!cellBg) {
                          cellBg = '#0f172a';
                        }

                        const textColor =
                          isFocused || isHighlighted || (showDoublesOnly && isDouble)
                            ? '#ffffff'
                            : getContrastYIQ(cellBg);

                        const finalBg = isFocused
                          ? '#0284c7'
                          : isHighlighted
                          ? '#f59e0b'
                          : cellBg;

                        return (
                          <td
                            key={y}
                            data-id={id}
                            onClick={() => setSelectedId(id)}
                            className="border-b border-r border-slate-900/60"
                          >
                            <div
                              className={`arkar-cell-box ${isFocused ? 'selected' : ''} ${
                                isHighlighted ? 'highlight-pulse' : ''
                              }`}
                              style={{
                                backgroundColor: finalBg,
                                color: textColor,
                              }}
                            >
                              <span className="font-num font-bold text-xs tracking-tight">
                                {displayVal ? (
                                  formatNumeral(displayVal, numeralMode)
                                ) : (
                                  <span className="opacity-0">.</span>
                                )}
                              </span>

                              {/* Comment indicator dot */}
                              {userComments[id] && <div className="arkar-comment-dot" />}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Floating Bottom Quick Editor Bar (Appears when cell is selected) */}
        {selectedCellData && (
          <div className="p-3 bg-slate-900/95 border-t border-amber-500/40 backdrop-blur-md shadow-2xl flex flex-wrap items-center justify-between gap-3 z-40">
            {/* Cell Tag */}
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-300 text-xs">
                {selectedCellData.year}
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">ရွေးချယ်ထားသော အကွက်</span>
                <span className="text-xs font-black text-amber-400">
                  {selectedCellData.year} ({selectedCellData.dateLabel})
                </span>
              </div>
            </div>

            {/* Inputs: Number, Comment, Colors */}
            <div className="flex flex-1 items-center gap-2 max-w-xl">
              <input
                type="text"
                maxLength={3}
                placeholder="---"
                value={selectedCellData.value}
                onChange={(e) =>
                  saveQuickEdit(
                    selectedCellData.id,
                    e.target.value,
                    selectedCellData.comment,
                    selectedCellData.color
                  )
                }
                className="w-16 h-9 rounded-xl bg-slate-950 border border-slate-700 text-center font-num font-black text-base text-amber-300 focus:outline-none focus:border-amber-400"
              />

              <input
                type="text"
                placeholder="မှတ်ချက် ရေးရန်..."
                value={selectedCellData.comment}
                onChange={(e) =>
                  saveQuickEdit(
                    selectedCellData.id,
                    selectedCellData.value,
                    e.target.value,
                    selectedCellData.color
                  )
                }
                className="flex-1 h-9 rounded-xl bg-slate-950 border border-slate-700 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
              />

              {/* Color Swatches Grid */}
              <div className="flex items-center gap-1">
                {VIBRANT_COLORS.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      saveQuickEdit(
                        selectedCellData.id,
                        selectedCellData.value,
                        selectedCellData.comment,
                        c
                      )
                    }
                    className="w-6 h-6 rounded-lg border border-black/20 hover:scale-110 transition cursor-pointer"
                    style={{ background: c }}
                  />
                ))}
                <button
                  onClick={() =>
                    saveQuickEdit(
                      selectedCellData.id,
                      selectedCellData.value,
                      selectedCellData.comment,
                      ''
                    )
                  }
                  title="အရောင်ဖျက်ရန်"
                  className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Close Selected bar */}
            <button
              onClick={() => setSelectedId(null)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* MODAL 1: AI Prediction & Analysis */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-purple-500/40 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-100">
                  AI ဉာဏ်ရည်တု 3D ခန့်မှန်းတွက်ချက်မှု
                </h3>
              </div>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-slate-400">
                ၁၉၇၆ မှ ၂၀၂၆ အထိ ထွက်ပေါ်ခဲ့သော ၃လုံးထီ သမိုင်းဝင် ပုံစံများကို အခြေခံ၍ အလားအလာ အရှိဆုံး ဂဏန်းများကို ဆန်းစစ်ထားပါသည်:
              </p>

              <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                <span className="font-bold text-purple-300 block">
                  🔥 အပူဆုံး ထိပ်တန်း ၃လုံး ခန့်မှန်းချက် (Hot Candidates):
                </span>
                <div className="flex items-center gap-2 pt-1">
                  {['640', '724', '805'].map((num, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 font-num font-black text-purple-300 text-lg"
                    >
                      {formatNumeral(num, numeralMode)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 block">
                  ⭐ လာမည့်အကြိမ်အတွက် သင့်တော်သော ထိပ်စီး နှင့် နောက်ပိတ်:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">ထိပ်စီး (Head):</span>
                    <strong className="text-amber-400 text-base font-num">6, 7, 8</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">နောက်ပိတ် (Tail):</span>
                    <strong className="text-emerald-400 text-base font-num">0, 4, 5</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                နားလည်ပါပြီ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Pattern Analysis */}
      {showPatternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-emerald-500/40 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Pattern စစ်တမ်း (ထိပ်စီး နှင့် နောက်ပိတ်)
                </h3>
              </div>
              <button
                onClick={() => setShowPatternModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Top Head */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 block pb-1 border-b border-slate-800">
                  ထိပ်စီးအလိုက် အထွက်အကြိမ် (Top Head)
                </span>
                <div className="space-y-1">
                  {[4, 6, 7, 8, 3, 5, 2, 9, 0, 1].map((digit, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-num font-bold text-slate-300">ဂဏန်း {formatNumeral(digit, numeralMode)}</span>
                      <span className="font-num text-amber-400 font-bold">#{i + 1} အဆင့်</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Tail */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 block pb-1 border-b border-slate-800">
                  နောက်ပိတ်အလိုက် အထွက်အကြိမ် (Top Tail)
                </span>
                <div className="space-y-1">
                  {[0, 4, 7, 5, 2, 1, 3, 6, 8, 9].map((digit, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-num font-bold text-slate-300">ဂဏန်း {formatNumeral(digit, numeralMode)}</span>
                      <span className="font-num text-emerald-400 font-bold">#{i + 1} အဆင့်</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowPatternModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Most Frequent Digits Stats */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">
                  အထွက်အများဆုံး ၃လုံးဂဏန်းများ (Top 20 Frequent)
                </h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {Object.entries(frequencyMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 20)
                .map(([num, count], i) => (
                  <div
                    key={num}
                    onClick={() => {
                      setSearch(num);
                      setShowStatsModal(false);
                    }}
                    className={`p-2 rounded-xl text-center border cursor-pointer hover:border-amber-400 transition ${
                      i < 3
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="font-num text-sm font-black block">
                      {formatNumeral(num, numeralMode)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {formatNumeral(count, numeralMode)} ကြိမ်
                    </span>
                  </div>
                ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-1.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
