import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Live2DCard } from './components/Live2DCard';
import { ThreeDSection } from './components/ThreeDSection';
import { CommunityChat } from './components/CommunityChat';
import { TwoDHistory } from './components/TwoDHistory';
import { DreamCalculator } from './components/DreamCalculator';
import { BottomNav } from './components/BottomNav';
import { DeploymentModal } from './components/DeploymentModal';
import { Live2DData, ThreeDResponse, NumeralMode, TabType } from './types';
import { playNotificationSound } from './utils/numberConverter';
import { ShieldAlert, Sparkles, Radio } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        serverTime={data2D?.server_time || ''}
        numeralMode={numeralMode}
        onToggleNumeralMode={handleToggleNumeralMode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Top Ticker Marquee / Highlights */}
        <div className="mb-4 overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800/80 px-3 py-2 flex items-center gap-2 text-xs">
          <span className="flex-shrink-0 flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            သတင်းတို:
          </span>
          <div className="truncate text-slate-300">
            Mr.A 2D3D Live မှ ကြိုဆိုပါသည် • ထိုင်းစတော့အိတ်ချိန်း တရားဝင် SET ဒေတာ တိုက်ရိုက်ထုတ်လွှင့်မှု • 3D ရလဒ်များကို လစဉ် ၁ ရက် နှင့် ၁၆ ရက်တွင် ထုတ်ပြန်ပေးပါသည်
          </div>
        </div>

        {/* Tab Views */}
        {activeTab === '2d_live' && (
          <Live2DCard
            data={data2D}
            numeralMode={numeralMode}
            loading={loading2D}
          />
        )}

        {activeTab === '3d_result' && (
          <ThreeDSection
            items={data3D?.data || []}
            loading={loading3D}
            numeralMode={numeralMode}
          />
        )}

        {activeTab === 'chat' && (
          <CommunityChat
            numeralMode={numeralMode}
          />
        )}

        {activeTab === 'history' && (
          <TwoDHistory
            numeralMode={numeralMode}
          />
        )}

        {activeTab === 'tools' && (
          <DreamCalculator
            numeralMode={numeralMode}
          />
        )}

        {/* Footer Disclaimer */}
        <footer className="mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center font-black text-slate-950 text-xs">
              A
            </span>
            <span className="font-bold text-slate-300">Mr.A 2D3D Live Myanmar</span>
          </div>
          <p>
            ဒေတာအရင်းအမြစ်များ: SET (Stock Exchange of Thailand) & Thailand Government Lottery
          </p>
          <p className="text-[11px] text-slate-600">
            © 2026 Mr.A 2D3D. မူပိုင်ခွင့်များအားလုံး လက်ဝယ်ရှိသည်။
          </p>
        </footer>
      </main>

      {/* Deployment & GitHub Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      {/* Bottom Sticky Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
    </div>
  );
}
