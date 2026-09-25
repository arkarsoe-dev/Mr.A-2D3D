import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Live2DCard } from './components/Live2DCard';
import { ThreeDSection } from './components/ThreeDSection';
import { CommunityChat } from './components/CommunityChat';
import { AiChat } from './components/AiChat';
import { DreamCalculator } from './components/DreamCalculator';
import { DeploymentModal } from './components/DeploymentModal';
import { MenuDrawer } from './components/MenuDrawer';
import { BottomNav } from './components/BottomNav';
import { Live2DData, ThreeDResponse, NumeralMode, TabType } from './types';
import { playNotificationSound } from './utils/numberConverter';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('2d_live');
  const [numeralMode, setNumeralMode] = useState<NumeralMode>(() => {
    return (localStorage.getItem('mra_numeral_mode') as NumeralMode) || 'myanmar';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mra_sound_enabled') === 'true';
  });

  const [data2D, setData2D] = useState<Live2DData | null>(null);
  const [loading2D, setLoading2D] = useState(true);

  const [data3D, setData3D] = useState<ThreeDResponse | null>(null);
  const [loading3D, setLoading3D] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const prevTwodRef = useRef<string>('');

  // Toggle numeral mode
  const handleToggleNumeralMode = () => {
    const nextMode: NumeralMode = numeralMode === 'myanmar' ? 'english' : 'myanmar';
    setNumeralMode(nextMode);
    localStorage.setItem('mra_numeral_mode', nextMode);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    localStorage.setItem('mra_sound_enabled', String(nextState));
    if (nextState) {
      playNotificationSound();
    }
  };

  // Fetch 2D Live Data
  const fetch2DLive = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      const res = await fetch('/api/live-2d');
      if (res.ok) {
        const json: Live2DData = await res.json();
        setData2D(json);

        // Check if 2D number updated and play sound
        if (json.live?.twod && json.live.twod !== '--') {
          if (prevTwodRef.current && prevTwodRef.current !== json.live.twod && soundEnabled) {
            playNotificationSound();
          }
          prevTwodRef.current = json.live.twod;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch 2D live data:', e);
    } finally {
      setLoading2D(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [soundEnabled]);

  // Fetch 3D Results
  const fetch3DResults = useCallback(async () => {
    try {
      setLoading3D(true);
      const res = await fetch('/api/threed-result');
      if (res.ok) {
        const json: ThreeDResponse = await res.json();
        setData3D(json);
      }
    } catch (e) {
      console.warn('Failed to fetch 3D data:', e);
    } finally {
      setLoading3D(false);
    }
  }, []);

  // Set up polling intervals
  useEffect(() => {
    fetch2DLive();
    fetch3DResults();

    // 2D Live polling every 3 seconds for dynamic market updates
    const interval2D = setInterval(() => {
      fetch2DLive();
    }, 3000);

    // 3D polling every 45 seconds
    const interval3D = setInterval(() => {
      fetch3DResults();
    }, 45000);

    return () => {
      clearInterval(interval2D);
      clearInterval(interval3D);
    };
  }, [fetch2DLive, fetch3DResults]);

  const handleManualRefresh = () => {
    fetch2DLive(true);
    fetch3DResults();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-8 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header with Brand Logo & Compact Tabs & Menu Drawer button */}
      <Header
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5">
        {/* Tab Views */}
        {activeTab === '2d_live' && (
          <Live2DCard
            data={data2D}
            numeralMode={numeralMode}
            loading={loading2D}
          />
        )}

        {/* 3D Result Screens (Splitted into specialized cleaner views) */}
        {activeTab === '3d_result' && (
          <ThreeDSection
            items={data3D?.data || []}
            loading={loading3D}
            numeralMode={numeralMode}
            initialMode="arkarsoe"
            onModeChange={(mode) => {
              if (mode === 'arkarsoe') setActiveTab('3d_arkarsoe');
              else if (mode === 'monthlyCalendar') setActiveTab('3d_calendar');
              else if (mode === 'list') setActiveTab('3d_history');
            }}
          />
        )}

        {activeTab === '3d_arkarsoe' && (
          <ThreeDSection
            items={data3D?.data || []}
            loading={loading3D}
            numeralMode={numeralMode}
            initialMode="arkarsoe"
            onModeChange={(mode) => {
              if (mode === 'monthlyCalendar') setActiveTab('3d_calendar');
              else if (mode === 'list') setActiveTab('3d_history');
            }}
          />
        )}

        {activeTab === '3d_calendar' && (
          <ThreeDSection
            items={data3D?.data || []}
            loading={loading3D}
            numeralMode={numeralMode}
            initialMode="monthlyCalendar"
            onModeChange={(mode) => {
              if (mode === 'arkarsoe') setActiveTab('3d_arkarsoe');
              else if (mode === 'list') setActiveTab('3d_history');
            }}
          />
        )}

        {activeTab === '3d_history' && (
          <ThreeDSection
            items={data3D?.data || []}
            loading={loading3D}
            numeralMode={numeralMode}
            initialMode="list"
            onModeChange={(mode) => {
              if (mode === 'arkarsoe') setActiveTab('3d_arkarsoe');
              else if (mode === 'monthlyCalendar') setActiveTab('3d_calendar');
            }}
          />
        )}

        {activeTab === 'group_chat' && (
          <CommunityChat
            numeralMode={numeralMode}
          />
        )}

        {activeTab === 'ai_chat' && (
          <AiChat numeralMode={numeralMode} />
        )}

        {activeTab === 'tools' && (
          <DreamCalculator
            numeralMode={numeralMode}
          />
        )}

        {/* Minimal Clean Footer */}
        <footer className="mt-8 pt-4 border-t border-slate-900/80 text-center text-xs text-slate-500 flex flex-wrap items-center justify-center gap-2">
          <span className="font-semibold text-slate-400">Mr.A 2D3D Live Myanmar</span>
          <span className="text-slate-700">•</span>
          <span>SET (Thailand) & Thai Government Lottery</span>
        </footer>
      </main>

      {/* Deployment & GitHub Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Slide-out Menu Drawer */}
      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        numeralMode={numeralMode}
        onToggleNumeralMode={handleToggleNumeralMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        serverTime={data2D?.server_time}
        data2D={data2D}
      />

      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
