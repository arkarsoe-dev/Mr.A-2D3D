import React from 'react';
import { Volume2, VolumeX, RefreshCw, Globe, Sparkles, Github, Radio } from 'lucide-react';
import { NumeralMode } from '../types';
import { formatNumeral } from '../utils/numberConverter';

interface HeaderProps {
  serverTime: string;
  numeralMode: NumeralMode;
  onToggleNumeralMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenDeployModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  serverTime,
  numeralMode,
  onToggleNumeralMode,
  soundEnabled,
  onToggleSound,
  onRefresh,
  isRefreshing,
  onOpenDeployModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 font-black text-slate-950 text-xl tracking-tight border border-amber-300/40">
                A
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                  Mr.A 2D3D
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  <Radio className="w-2.5 h-2.5" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>တိုက်ရိုက်ထုတ်လွှင့်မှု</span>
                <span className="text-amber-500/60">•</span>
                <span className="text-slate-300 font-num text-[10px]">
                  {serverTime ? formatNumeral(serverTime, numeralMode) : 'ချိတ်ဆက်နေသည်...'}
                </span>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Numeral Mode Toggle */}
            <button
              onClick={onToggleNumeralMode}
              title={numeralMode === 'myanmar' ? 'အင်္ဂလိပ်ဂဏန်းသို့ ပြောင်းရန်' : 'မြန်မာဂဏန်းသို့ ပြောင်းရန်'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 transition-all text-amber-300 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{numeralMode === 'myanmar' ? 'မြန်မာ' : 'ENG'}</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'အသံပိတ်ရန်' : 'အသံဖွင့်ရန်'}
              className={`p-2 rounded-lg text-xs border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="ပြန်လည်ရယူရန် (Refresh)"
              className={`p-2 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-amber-400 transition-all ${
                isRefreshing ? 'opacity-70' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* GitHub & Deploy Info */}
            <button
              onClick={onOpenDeployModal}
              title="GitHub & Deploy စာမျက်နှာ"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-bold hover:brightness-110 transition-all shadow-md shadow-amber-600/20 border border-amber-400/40"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
