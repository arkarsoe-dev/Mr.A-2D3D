import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Trophy,
  Users,
  Bot,
  Sparkles,
  Menu,
  ChevronDown,
  Grid,
  CalendarDays,
  ListFilter,
  History,
} from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadChatCount?: number;
  onOpenDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onChangeTab,
  unreadChatCount = 0,
  onOpenDrawer,
}) => {
  const [is3DDropdownOpen, setIs3DDropdownOpen] = useState(false);
  const [is2DDropdownOpen, setIs2DDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close 3D dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIs3DDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const is3DActive =
    activeTab === '3d_result' ||
    activeTab === '3d_arkarsoe' ||
    activeTab === '3d_calendar' ||
    activeTab === '3d_history';

  const is2DActive = activeTab === '2d_live' || activeTab === '2d_history';
  const isGroupChatActive = activeTab === 'group_chat';
  const isAiChatActive = activeTab === 'ai_chat';
  const isToolsActive = activeTab === 'tools';

  const handleSelect3DOption = (tab: TabType) => {
    onChangeTab(tab);
    setIs3DDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-amber-500/20 shadow-md">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Mr.A 2D3D Brand Logo */}
          <div
            onClick={() => onChangeTab('2d_live')}
            className="flex items-center gap-1.5 flex-shrink-0 cursor-pointer select-none group"
            title="Mr.A 2D3D Live ပင်မစာမျက်နှာ"
          >
            <div className="mra-mascot" aria-hidden="true">
              <span className="mra-mascot-antenna" />
              <span className="mra-mascot-head">
                <span className="mra-mascot-eye mra-mascot-eye-left" />
                <span className="mra-mascot-eye mra-mascot-eye-right" />
                <span className="mra-mascot-smile" />
              </span>
              <span className="mra-mascot-body" />
              <span className="mra-mascot-arm mra-mascot-arm-left" />
              <span className="mra-mascot-arm mra-mascot-arm-right" />
            </div>
            <span className="inline text-base sm:text-lg font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
              Mr.A
            </span>
          </div>

          {/* Clean Icon-Only Navigation Bar (Fit perfectly on all mobile screens without horizontal scroll) */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {/* 1. 2D Icon Button with Live / History dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIs2DDropdownOpen((open) => !open)}
                  className={`relative flex items-center gap-0.5 p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                    is2DActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900 border border-slate-800/80'
                  }`}
                  title="၂လုံးထီ Live နှင့် History Records"
                  aria-label="2D Live and History Records"
                  aria-expanded={is2DDropdownOpen}
                >
                  <Radio className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${is2DActive ? 'text-slate-950 animate-pulse' : 'text-emerald-400'}`} />
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${is2DDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {is2DDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border-2 border-emerald-500/30 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-md">
                    <div className="px-2 py-1 mb-1 border-b border-slate-800 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      ၂လုံးထီ သီးခြား စခရင်များ
                    </div>
                    <button
                      onClick={() => { onChangeTab('2d_live'); setIs2DDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition ${activeTab === '2d_live' ? 'bg-emerald-500/15 border border-emerald-500/40' : 'hover:bg-slate-800'}`}
                    >
                      <Radio className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-slate-100">2D Live</span>
                    </button>
                    <button
                      onClick={() => { onChangeTab('2d_history'); setIs2DDropdownOpen(false); }}
                      className={`w-full flex items-center gap-2 p-2 rounded-xl text-left transition ${activeTab === '2d_history' ? 'bg-amber-500/15 border border-amber-500/40' : 'hover:bg-slate-800'}`}
                    >
                      <History className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-slate-100">History Records</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. 3D Result Icon Button with Popup Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIs3DDropdownOpen(!is3DDropdownOpen)}
                  className={`relative flex items-center gap-0.5 p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                    is3DActive
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : 'text-slate-400 hover:text-amber-400 hover:bg-slate-900 border border-slate-800/80'
                  }`}
                  title="၃လုံး ရလဒ် နှင့် စခရင်များ (3D Screens)"
                  aria-label="3D Result Screens"
                >
                  <Trophy className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${is3DActive ? 'text-slate-950' : 'text-amber-400'}`} />
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      is3DDropdownOpen ? 'rotate-180 text-slate-950' : is3DActive ? 'text-slate-950' : 'text-slate-400'
                    }`}
                  />
                </button>

                {/* 3D Dropdown / Popup Screen Selector Window */}
                {is3DDropdownOpen && (
                  <div className="absolute top-full mt-2 -left-10 sm:left-0 sm:right-auto w-64 rounded-2xl bg-slate-900/95 border-2 border-amber-500/40 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-md">
                    <div className="px-2 py-1 mb-1 border-b border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Sparkles className="w-3 h-3" />
                        ၃လုံးထီ သီးသန့် စခရင်များ
                      </span>
                    </div>

                    <div className="space-y-1">
                      {/* Option 1: အာကာစိုး ဇယား */}
                      <button
                        onClick={() => handleSelect3DOption('3d_arkarsoe')}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                          activeTab === '3d_arkarsoe' || activeTab === '3d_result'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 mt-0.5">
                          <Grid className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">အာကာစိုး ဇယား (Pro Table)</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            ၁,၂၁၅ ကြိမ် မှတ်တမ်းနှင့် pattern
                          </span>
                        </div>
                      </button>

                      {/* Option 2: လအလိုက် ပြက္ခဒိန် */}
                      <button
                        onClick={() => handleSelect3DOption('3d_calendar')}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                          activeTab === '3d_calendar'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 mt-0.5">
                          <CalendarDays className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">လအလိုက် ပြက္ခဒိန် (Calendar)</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            လစဉ် ၁ ရက်၊ ၁၆ ရက် ရလဒ်ဇယား
                          </span>
                        </div>
                      </button>

                      {/* Option 3: သမိုင်းဝင် ပေါက်စဉ်စာရင်း */}
                      <button
                        onClick={() => handleSelect3DOption('3d_history')}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition cursor-pointer ${
                          activeTab === '3d_history'
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                            : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400 mt-0.5">
                          <ListFilter className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold block">ပေါက်စဉ် စာရင်း (Draws List)</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">
                            ၁၉၇၆ မှ ယနေ့အထိ ရှာဖွေနိုင်သော စာရင်း
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Group Chat Icon Button (အသုံးပြုသူအချင်းချင်း စကားပြောရန်) */}
              <button
                onClick={() => onChangeTab('group_chat')}
                className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                  isGroupChatActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900 border border-slate-800/80'
                }`}
                title="Group Chat (အသုံးပြုသူအချင်းချင်း စကားပြောခန်း)"
                aria-label="Group Chat"
              >
                <Users className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isGroupChatActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              {/* 4. AI Chat Icon Button (AI နှင့် အထွေထွေ စကားပြောရန်) */}
              <button
                onClick={() => onChangeTab('ai_chat')}
                className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                  isAiChatActive
                    ? 'bg-indigo-500 text-white font-black shadow-md shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-900 border border-slate-800/80'
                }`}
                title="AI Chat (Mr.A AI နှင့် အထွေထွေစကားပြောရန်)"
                aria-label="AI Chat"
              >
                <Bot className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isAiChatActive ? 'text-white' : 'text-indigo-400'}`} />
              </button>

              {/* 5. Dream / Calculator Tools Icon Button */}
              <button
                onClick={() => onChangeTab('tools')}
                className={`relative p-2 sm:px-2.5 sm:py-2 rounded-xl transition-all cursor-pointer ${
                  isToolsActive
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                    : 'text-slate-400 hover:text-purple-400 hover:bg-slate-900 border border-slate-800/80'
                }`}
                title="အိပ်မက် အဘိဓာန် & တွက်နည်း (Tools)"
                aria-label="Tools"
              >
                <Sparkles className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isToolsActive ? 'text-slate-950' : 'text-purple-400'}`} />
              </button>
            </nav>

            {/* Menu Drawer Toggle Button */}
            <button
              onClick={onOpenDrawer}
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-400/60 shadow-sm transition cursor-pointer"
              title="Menu Drawer ဖွင့်ရန်"
              aria-label="Menu"
            >
              <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
