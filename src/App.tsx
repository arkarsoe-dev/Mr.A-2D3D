import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatHome } from './components/ChatHome';
import { ThreeDCalendarPage } from './components/ThreeDCalendarPage';
import { CloudModel, SettingsPanel, SiteLanguage, SiteTheme } from './components/SettingsPanel';
import { Live2DData, NumeralMode, ThreeDResponse } from './types';
import { playNotificationSound } from './utils/numberConverter';

const TWO_D_API_URL = 'https://api.thaistock2d.com/live';
const THREE_D_API_URL = 'https://api.2dboss.com/api/v2/v1/2dstock/threed-result';
const THREE_D_FALLBACK: ThreeDResponse = { data: [{ result: '640', datetime: '2026-09-16' }, { result: '212', datetime: '2026-09-01' }, { result: '615', datetime: '2026-08-16' }], result: 1, message: 'fallback', is_fallback: true };

export default function App() {
  const [numeralMode, setNumeralMode] = useState<NumeralMode>(() => (localStorage.getItem('mra_numeral_mode') as NumeralMode) || 'myanmar');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('mra_sound_enabled') === 'true');
  const [language, setLanguage] = useState<SiteLanguage>(() => (localStorage.getItem('mra_language') as SiteLanguage) || 'my');
  const [theme, setTheme] = useState<SiteTheme>(() => (localStorage.getItem('mra_theme') as SiteTheme) || 'system');
  const [model, setModel] = useState<CloudModel>(() => (localStorage.getItem('mra_model') as CloudModel) || 'mra');
  const [modelKeys, setModelKeys] = useState<Record<Exclude<CloudModel, 'mra'>, string>>(() => { try { return JSON.parse(localStorage.getItem('mra_model_keys') || '{}'); } catch { return {}; } });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [data2D, setData2D] = useState<Live2DData | null>(null);
  const [data3D, setData3D] = useState<ThreeDResponse | null>(null);
  const [loading2D, setLoading2D] = useState(true);
  const [loading3D, setLoading3D] = useState(true);
  const [error2D, setError2D] = useState(false);
  const [error3D, setError3D] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const previous2D = useRef('');

  const fetch2D = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    try {
      const response = await fetch(`${TWO_D_API_URL}?_=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('2D request failed');
      const json: Live2DData = await response.json();
      setData2D(json); setError2D(false);
      const next = json.live?.twod;
      if (next && next !== '--' && previous2D.current && next !== previous2D.current && soundEnabled) playNotificationSound();
      if (next && next !== '--') previous2D.current = next;
    } catch { setError2D(true); }
    finally { setLoading2D(false); if (manual) setIsRefreshing(false); }
  }, [soundEnabled]);

  const fetch3D = useCallback(async () => {
    try {
      setLoading3D(true);
      const response = await fetch(`${THREE_D_API_URL}?_=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('3D request failed');
      setData3D(await response.json()); setError3D(false);
    } catch { setData3D(THREE_D_FALLBACK); setError3D(true); }
    finally { setLoading3D(false); }
  }, []);

  useEffect(() => {
    fetch2D(); fetch3D();
    const liveTimer = window.setInterval(() => { if (document.visibilityState === 'visible') fetch2D(); }, 5000);
    const threeTimer = window.setInterval(() => { if (document.visibilityState === 'visible') fetch3D(); }, 180000);
    const onVisible = () => { if (document.visibilityState === 'visible') { fetch2D(); fetch3D(); } };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(liveTimer); window.clearInterval(threeTimer); document.removeEventListener('visibilitychange', onVisible); };
  }, [fetch2D, fetch3D]);

  const toggleNumeral = () => { const next: NumeralMode = numeralMode === 'myanmar' ? 'english' : 'myanmar'; setNumeralMode(next); localStorage.setItem('mra_numeral_mode', next); };
  const refresh = () => { fetch2D(true); fetch3D(); };
  const toggleSound = () => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem('mra_sound_enabled', String(next)); if (next) playNotificationSound(); };
  const changeLanguage = (value: SiteLanguage) => { setLanguage(value); localStorage.setItem('mra_language', value); };
  const changeTheme = (value: SiteTheme) => { setTheme(value); localStorage.setItem('mra_theme', value); };
  const changeModel = (value: CloudModel) => { setModel(value); localStorage.setItem('mra_model', value); };
  const changeModelKey = (provider: Exclude<CloudModel, 'mra'>, value: string) => { const next = { ...modelKeys, [provider]: value }; setModelKeys(next); localStorage.setItem('mra_model_keys', JSON.stringify(next)); };
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  return <div className="mra-chat-app">{calendarOpen ? <ThreeDCalendarPage data3D={data3D} numeralMode={numeralMode} language={language} onBack={() => setCalendarOpen(false)} /> : <ChatHome data2D={data2D} data3D={data3D} loading2D={loading2D} loading3D={loading3D} error2D={error2D} error3D={error3D} numeralMode={numeralMode} onToggleNumeral={toggleNumeral} onRefresh={refresh} refreshing={isRefreshing} language={language} onOpenSettings={() => setSettingsOpen(true)} onOpenCalendar={() => setCalendarOpen(true)} />}<button className="sound-toggle" onClick={toggleSound} aria-label="အသံပြောင်းရန်">{soundEnabled ? 'SOUND ON' : 'SOUND OFF'}</button>{settingsOpen && <SettingsPanel language={language} theme={theme} model={model} keys={modelKeys} onLanguageChange={changeLanguage} onThemeChange={changeTheme} onModelChange={changeModel} onKeyChange={changeModelKey} onClose={() => setSettingsOpen(false)} />}</div>;
}
