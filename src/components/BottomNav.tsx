import React from 'react';
import { Radio, Trophy, Users, Bot, Sparkles } from 'lucide-react';
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
    { id: '2d_live' as TabType, icon: Radio, label: '2D Live', color: 'emerald' },
    { id: '3d_result' as TabType, icon: Trophy, label: '3D Result', color: 'amber' },
    { id: 'group_chat' as TabType, icon: Users, label: 'Group Chat', color: 'cyan' },
    { id: 'ai_chat' as TabType, icon: Bot, label: 'AI Chat', color: 'indigo' },
    { id: 'tools' as TabType, icon: Sparkles, label: 'Tools', color: 'violet' },
  ];

  return (
    <nav className="mra-bottom-nav" aria-label="Primary navigation">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`mra-icon-nav ${isActive ? 'is-active' : ''}`}
            title={tab.label}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {tab.id === 'group_chat' && unreadChatCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadChatCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
