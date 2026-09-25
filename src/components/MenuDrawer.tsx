import React, { useState } from 'react';
import {
  X,
  Radio,
  Trophy,
  MessageSquare,
  Sparkles,
  Globe,
  Volume2,
  VolumeX,
  RefreshCw,
  Calendar,
  Clock,
  Github,
  ChevronRight,
  Share2,
  Code2,
  Grid,
  CalendarDays,
  ListFilter,
  Bot,
} from 'lucide-react';
import { TabType, NumeralMode, Live2DData } from '../types';

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
  onOpenDeployModal: () => void;
  serverTime?: string;
  data2D?: Live2DData | null;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onChangeTab,
  numeralMode,
  onToggleNumeralMode,
  soundEnabled,
  onToggleSound,
  onRefresh,
  isRefreshing,
  onOpenDeployModal,
  serverTime,
  data2D,
}) => {
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  if (!isOpen) return null;

  const handleShareApp = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Mr.A 2D3D Live',
          text: 'မြန်မာ ၂လုံးထီ နှင့် ၃လုံးထီ တိုက်ရိုက်ရလဒ်များ၊ အာကာစိုး ဇယားကြီးနှင့် အိပ်မက်/တွက်နည်း',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2200);
    }
  };

  const mainPages = [
    {
      id: '2d_live' as TabType,
      label: '၂လုံး တိုက်ရိုက် (2D Live)',
      desc: 'ထိုင်းစတော့ SET တိုက်ရိုက် ထီပေါက်ဂဏန်းနှင့် မှတ်တမ်း',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 'group_chat' as TabType,
      label: 'အဖွဲ့လိုက် စကားပြောခန်း',
      desc: 'အသုံးပြုသူအချင်းချင်း ၂D/၃D အမြင်များ ဖလှယ်ရန်',
      icon: MessageSquare,
      badge: 'GROUP',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      id: 'ai_chat' as TabType,
      label: 'Mr.A AI စကားပြောခန်း',
      desc: 'AI နှင့် အထွေထွေဗဟုသုတ မေးမြန်းဆွေးနွေးရန်',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      id: 'tools' as TabType,
      label: 'အိပ်မက် အဘိဓာန် & တွက်နည်း',
      desc: 'နိမိတ်အိပ်မက်၊ နေ့နံမိတ်ဖတ်၊ ဂဏန်းတွဲဖော်စက်',
      icon: Sparkles,
      badge: 'AI TOOLS',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
  ];

  const threeDScreens = [
    {
      id: '3d_arkarsoe' as TabType,
      label: 'အာကာစိုး ဇယား (Pro Table)',
      desc: '၁,၂၁၅ ကြိမ် မှတ်တမ်း၊ မျဉ်းဆွဲ/အရောင်ခြယ် Pattern စနစ်',
      icon: Grid,
      badge: '3D MASTER',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
      id: '3d_calendar' as TabType,
      label: 'လအလိုက် ပြက္ခဒိန် (Calendar)',
      desc: 'လစဉ် ၁ ရက် နှင့် ၁၆ ရက် ရလဒ်များ ပြက္ခဒိန်ဇယား',
      icon: CalendarDays,
      badge: 'CALENDAR',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      id: '3d_history' as TabType,
      label: 'သမိုင်းဝင် ပေါက်စဉ် (Draws List)',
      desc: '၁၉၇၆ မှ ယနေ့အထိ ရှာဖွေနိုင်သော စာရင်း',
      icon: ListFilter,
      badge: '1976-2026',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Slides from Right) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md bg-slate-900 border-l border-amber-500/25 shadow-2xl flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-black text-slate-950 text-lg border border-amber-300/40 shadow-sm">
                  A
                </div>
                <div>
                  <h2 className="text-base font-black bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
                    Mr.A 2D3D Menu
                  </h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    တိုက်ရိုက်လွှင့် ထီစနစ် ဗားရှင်း 2.0
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
                title="ပိတ်ရန်"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Server Time info */}
            {serverTime && (
              <div className="mt-3 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>စတော့ အချိန် (SET Time):</span>
                </span>
                <span className="font-num text-amber-300 font-semibold">{serverTime}</span>
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-5 flex-1">
            {/* 3D Result Screens (Dedicated Screen Section) */}
            <div>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2 px-1 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" />
                ၃လုံးထီ သီးသန့် စခရင်များ (3D Screens)
              </span>
              <div className="space-y-1.5">
                {threeDScreens.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeTab === item.id ||
                    (item.id === '3d_arkarsoe' && activeTab === '3d_result');

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onChangeTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition text-left cursor-pointer border ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-inner'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div
                          className={`p-2 rounded-lg mt-0.5 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-amber-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isActive ? 'text-amber-300' : 'text-slate-200'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation Section */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                အခြား စာမျက်နှာများ (Pages)
              </span>
              <div className="space-y-1.5">
                {mainPages.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onChangeTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition text-left cursor-pointer border ${
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/50 shadow-inner'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div
                          className={`p-2 rounded-lg mt-0.5 ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-amber-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs sm:text-sm font-bold ${
                                isActive ? 'text-amber-300' : 'text-slate-200'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                            >
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-amber-400' : 'text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Application Quick Controls & Settings */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                ဆက်တင် နှင့် အသုံးချခလုတ်များ (Preferences)
              </span>
              <div className="space-y-2 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                {/* Numeral Switch */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        ဂဏန်း အခေါ်အဝေါ်
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {numeralMode === 'myanmar' ? 'မြန်မာဂဏန်း (၀, ၁, ၂...)' : 'အင်္ဂလိပ်ဂဏန်း (0, 1, 2...)'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onToggleNumeralMode}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition"
                  >
                    {numeralMode === 'myanmar' ? 'ENG ပြောင်း' : 'မြန်မာ ပြောင်း'}
                  </button>
                </div>

                <div className="h-[1px] bg-slate-800/80 my-1" />

                {/* Sound Switch */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500" />
                    )}
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        ပေါက်ဂဏန်း အသံပေးချက်
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ဂဏန်းပြောင်းလဲချိန်တွင် အသံမြည်ပေးရန်
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onToggleSound}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                      soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {soundEnabled ? 'ဖွင့်ထားသည်' : 'ပိတ်ထားသည်'}
                  </button>
                </div>

                <div className="h-[1px] bg-slate-800/80 my-1" />

                {/* Manual Refresh */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        ဒေတာ အသစ်ပြန်ရယူရန်
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Live 2D နှင့် 3D ဒေတာများကို refresh ပြုလုပ်မည်
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  >
                    {isRefreshing ? 'ရယူနေ...' : 'Refresh'}
                  </button>
                </div>

                {/* Developer Raw JSON Inspector */}
                {data2D && (
                  <>
                    <div className="h-[1px] bg-slate-800/80 my-1" />
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200 block">
                            API JSON Data
                          </span>
                          <span className="text-[10px] text-slate-400">
                            api.thaistock2d.com ဒေတာအကြမ်း
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRawJson(!showRawJson)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        {showRawJson ? 'ဝှက်ရန်' : 'ကြည့်ရန်'}
                      </button>
                    </div>

                    {showRawJson && (
                      <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[10px] text-amber-300 max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(data2D, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions & Extras */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                အထူးဝန်ဆောင်မှုများ (Features & Share)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareApp}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-amber-500/40 transition"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span>{showShareNotification ? 'Link ကူးပြီး!' : 'App မျှဝေရန်'}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenDeployModal();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-amber-500/40 transition"
                >
                  <Github className="w-4 h-4 text-amber-400" />
                  <span>GitHub / Deploy</span>
                </button>
              </div>
            </div>

            {/* Daily Timetable Overview */}
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                ၂လုံးထီ ထွက်ချိန် ၄ ကြိမ် ဇယား:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 font-num">
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/60">
                  <span className="text-amber-300 font-bold block">11:00 AM</span>
                  <span className="text-[10px] text-slate-400">မနက်ခင်း ၁ ကြိမ်မြောက်</span>
                </div>
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/60">
                  <span className="text-amber-300 font-bold block">12:01 PM</span>
                  <span className="text-[10px] text-slate-400">မနက်ခင်း ပိတ်ပွဲ</span>
                </div>
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/60">
                  <span className="text-amber-300 font-bold block">03:00 PM</span>
                  <span className="text-[10px] text-slate-400">ညနေခင်း ၁ ကြိမ်မြောက်</span>
                </div>
                <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800/60">
                  <span className="text-amber-300 font-bold block">04:30 PM</span>
                  <span className="text-[10px] text-slate-400">ညနေခင်း ပိတ်ပွဲ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-[11px] text-slate-400 text-center">
            <p className="font-medium text-slate-300">Mr.A 2D3D Live © 2026</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              ထိုင်းနိုင်ငံ SET Index နှင့် တရားဝင် ထီပေါက်စဉ်ဒေတာ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
