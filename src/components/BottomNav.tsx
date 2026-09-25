import React from 'react';
import { Radio, Trophy, MessageSquare, History, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unreadChatCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  unreadChatCount = 0,
}) => {
  const tabs = [
    {
      id: '2d_live' as TabType,
      label: '၂လုံး တိုက်ရိုက်',
      subLabel: '2D Live',
      icon: Radio,
      badge: 'LIVE',
    },
    {
      id: '3d_result' as TabType,
      label: '၃လုံး ရလဒ်',
      subLabel: '3D Results',
      icon: Trophy,
    },
    {
      id: 'chat' as TabType,
      label: 'အဖွဲ့လိုက်စကားပြော',
      subLabel: 'Group Chat',
      icon: MessageSquare,
      badge: unreadChatCount > 0 ? `${unreadChatCount}` : undefined,
    },
    {
      id: 'history' as TabType,
      label: '၂လုံး မှတ်တမ်း',
      subLabel: 'History',
      icon: History,
    },
    {
      id: 'tools' as TabType,
      label: 'အိပ်မက်/တွက်နည်း',
      subLabel: 'Tools',
      icon: Sparkles,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-amber-500/20 shadow-2xl">
      <div className="max-w-md sm:max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-amber-400 bg-amber-500/10 scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950 leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] sm:text-[11px] font-bold mt-0.5 tracking-tight ${isActive ? 'text-amber-300' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
