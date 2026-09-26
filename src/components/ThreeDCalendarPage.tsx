import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, RefreshCw, Sparkles } from 'lucide-react';
import { ThreeDItem, ThreeDResponse, NumeralMode } from '../types';
import { THREE_D_HISTORICAL_DATA } from '../data/threeDHistoricalRecords';
import { ThreeDCalendarView } from './ThreeDCalendarView';
import { formatNumeral } from '../utils/numberConverter';

type Props = {
  data3D: ThreeDResponse | null;
  numeralMode: NumeralMode;
  language: 'my' | 'en';
  onBack: () => void;
};

type SyncedRow = { date: string; number: string };

export const ThreeDCalendarPage: React.FC<Props> = ({ data3D, numeralMode, language, onBack }) => {
  const english = language === 'en';
  const [syncedRows, setSyncedRows] = useState<SyncedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/data.json?_=${Date.now()}`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('data.json unavailable')))
      .then((rows: SyncedRow[]) => { if (active) setSyncedRows(rows); })
      .catch(() => { if (active) setSyncedRows(THREE_D_HISTORICAL_DATA.map((item) => ({ date: item.datetime, number: item.result }))); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const items = useMemo<ThreeDItem[]>(() => {
    const merged = new Map<string, string>();
    syncedRows.forEach((row) => { if (row.date && row.number) merged.set(row.date, row.number); });
    (data3D?.data || []).forEach((row) => { if (row.datetime && row.result) merged.set(row.datetime.slice(0, 10), row.result); });
    return [...merged.entries()]
      .map(([datetime, result]) => ({ datetime, result }))
      .filter((row) => /^\d{3}$/.test(row.result))
      .sort((a, b) => b.datetime.localeCompare(a.datetime));
  }, [syncedRows, data3D]);

  return <div className="calendar-page-shell">
    <header className="calendar-page-header">
      <button type="button" className="calendar-back-button" onClick={onBack} aria-label={english ? 'Back to Mr.A chat' : 'Chat screen သို့ပြန်သွားရန်'}><ArrowLeft /></button>
      <div className="calendar-page-title"><span className="calendar-page-kicker"><CalendarDays /> 3D CALENDAR</span><h1>{english ? '3D Calendar & Calculator' : '၃လုံး 3D ပြက္ခဒိန်နှင့် တွက်နည်း'}</h1><p>{english ? 'Explore draw dates, historical patterns, and calculation tools.' : 'ထွက်ရက်များ၊ သမိုင်းမှတ်တမ်းနဲ့ 3D တွက်နည်းတွေကို တစ်နေရာတည်းမှာ ကြည့်နိုင်ပါတယ်။'}</p></div>
      <div className="calendar-page-status"><span className="calendar-status-dot" />{loading ? <RefreshCw className="spin" /> : formatNumeral(items.length, numeralMode)} <small>{english ? 'records synced' : 'မှတ်တမ်း sync'}</small></div>
    </header>
    <div className="calendar-page-note"><Sparkles /><span>{english ? 'Mr.A uses the public 3D API results and the synced calendar file. This page is for historical reference and calculation, not guaranteed prediction.' : 'Mr.A သည် public 3D API ရလဒ်များနှင့် sync လုပ်ထားသော calendar data ကို အသုံးပြုထားပါတယ်။ ဤစာမျက်နှာသည် မှတ်တမ်းနှင့် တွက်ချက်ရန်အတွက်သာဖြစ်ပြီး ရလဒ်ခန့်မှန်းချက် အာမခံမဟုတ်ပါ။'}</span></div>
    <ThreeDCalendarView items={items} numeralMode={numeralMode} />
  </div>;
};
