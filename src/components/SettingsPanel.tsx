import React, { useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Languages, Moon, Settings, Sun, UserRound, X } from 'lucide-react';

export type SiteLanguage = 'my' | 'en';
export type SiteTheme = 'system' | 'light' | 'dark';
export type CloudModel = 'mra' | 'gemini' | 'chatgpt' | 'deepseek' | 'manus';

type Props = {
  language: SiteLanguage;
  theme: SiteTheme;
  model: CloudModel;
  keys: Record<Exclude<CloudModel, 'mra'>, string>;
  onLanguageChange: (value: SiteLanguage) => void;
  onThemeChange: (value: SiteTheme) => void;
  onModelChange: (value: CloudModel) => void;
  onKeyChange: (model: Exclude<CloudModel, 'mra'>, value: string) => void;
  onClose: () => void;
};

const modelLabels: Record<CloudModel, string> = { mra: 'Mr.A built-in', gemini: 'Google Gemini', chatgpt: 'ChatGPT', deepseek: 'DeepSeek', manus: 'Manus' };

export const SettingsPanel: React.FC<Props> = ({ language, theme, model, keys, onLanguageChange, onThemeChange, onModelChange, onKeyChange, onClose }) => {
  const [showKey, setShowKey] = useState(false);
  const activeKey = model === 'mra' ? '' : keys[model];
  const english = language === 'en';
  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="settings-panel" role="dialog" aria-modal="true" aria-label={english ? 'Website settings' : 'Website settings'}>
      <header className="settings-panel-head"><div><span className="settings-kicker"><Settings /> {english ? 'PREFERENCES' : 'သတ်မှတ်ချက်များ'}</span><h2>{english ? 'Website settings' : 'Website settings'}</h2></div><button className="settings-close" onClick={onClose} aria-label="Close settings"><X /></button></header>
      <div className="settings-panel-body">
        <div className="settings-section"><div className="settings-section-title"><Languages /> <span>{english ? 'Website language' : 'Website language'}</span></div><div className="settings-segment">{(['my', 'en'] as SiteLanguage[]).map((item) => <button key={item} className={language === item ? 'is-active' : ''} onClick={() => onLanguageChange(item)}>{item === 'my' ? 'မြန်မာ' : 'English'}{language === item && <Check />}</button>)}</div></div>
        <div className="settings-section"><div className="settings-section-title"><Sun /> <span>{english ? 'Appearance' : 'Appearance'}</span></div><div className="settings-theme-grid">{([['system', 'Default system', '◐'], ['light', 'Light mode', '☀'], ['dark', 'Dark mode', '◑']] as Array<[SiteTheme, string, string]>).map(([value, label, icon]) => <button key={value} className={theme === value ? 'is-active' : ''} onClick={() => onThemeChange(value)}><b>{icon}</b><span>{english ? ({ system: 'System default', light: 'Light mode', dark: 'Dark mode' } as Record<SiteTheme, string>)[value] : label}</span>{theme === value && <Check />}</button>)}</div></div>
        <div className="settings-section"><div className="settings-section-title"><KeyRound /> <span>{english ? 'AI model' : 'AI model'}</span></div><div className="settings-model-list">{(Object.keys(modelLabels) as CloudModel[]).map((item) => <button key={item} className={model === item ? 'is-active' : ''} onClick={() => onModelChange(item)}><span className={`model-dot model-${item}`} />{modelLabels[item]}{model === item && <Check />}</button>)}</div><p className="settings-note">{english ? 'Mr.A built-in is free and active now. Cloud models and keys are saved locally only and are not sent or used yet.' : 'လက်ရှိ Mr.A built-in ကို အခမဲ့ အသုံးပြုနေပါတယ်။ Cloud model နဲ့ key တွေကို browser ထဲမှာသာ သိမ်းထားပြီး အခုမပို့၊ မသုံးသေးပါ။'}</p></div>
        {model !== 'mra' && <div className="settings-section"><div className="settings-section-title"><KeyRound /> <span>{modelLabels[model]} API key</span></div><div className="key-input-wrap"><input type={showKey ? 'text' : 'password'} value={activeKey} onChange={(event) => onKeyChange(model, event.target.value)} placeholder={english ? 'Paste your own key' : 'ကိုယ်ပိုင် key ထည့်ပါ'} autoComplete="off" /><button onClick={() => setShowKey((value) => !value)} aria-label={showKey ? 'Hide key' : 'Show key'}>{showKey ? <EyeOff /> : <Eye />}</button></div><p className="settings-note warning">{english ? 'Only your own key. Never enter a shared or private key here.' : 'ကိုယ်ပိုင် key သာ ထည့်ပါ။ မျှဝေထားသော key သို့မဟုတ် private key မထည့်ပါနှင့်။'}</p></div>}
      </div>
      <footer className="settings-panel-foot"><UserRound /> <span>{english ? 'Settings stay on this device.' : 'သတ်မှတ်ချက်များကို ဒီစက်ထဲမှာပဲ သိမ်းထားပါတယ်။'}</span></footer>
    </section>
  </div>;
};
