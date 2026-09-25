import { NumeralMode } from '../types';

export const BURMESE_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];

export const toBurmeseDigits = (input: string | number | undefined | null): string => {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => BURMESE_DIGITS[parseInt(match, 10)]);
};

export const toEnglishDigits = (input: string | number | undefined | null): string => {
  if (input === undefined || input === null) return '';
  const str = String(input);
  const myanmarDigitsMap: Record<string, string> = {
    '၀': '0',
    '၁': '1',
    '၂': '2',
    '၃': '3',
    '၄': '4',
    '၅': '5',
    '၆': '6',
    '၇': '7',
    '၈': '8',
    '၉': '9',
  };
  return str.replace(/[၀-၉]/g, (match) => myanmarDigitsMap[match] || match);
};

export const formatNumeral = (
  input: string | number | undefined | null,
  mode: NumeralMode
): string => {
  if (input === undefined || input === null) return '--';
  const str = String(input);
  if (mode === 'myanmar') {
    return toBurmeseDigits(str);
  }
  return toEnglishDigits(str);
};

// Format Myanmar Date (e.g. ၂၀၂၆ ခုနှစ်၊ စက်တင်ဘာ ၂၅ ရက်)
export const formatMyanmarDateLabel = (dateStr: string, mode: NumeralMode): string => {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length < 3) return formatNumeral(dateStr, mode);

  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parts[2];

  const myanmarMonths = [
    'ဇန်နဝါရီ',
    'ဖေဖော်ဝါရီ',
    'မတ်',
    'ဧပြီ',
    'မေ',
    'ဇွန်',
    'ဇူလိုင်',
    'ဩဂုတ်',
    'စက်တင်ဘာ',
    'အောက်တိုဘာ',
    'နိုဝင်ဘာ',
    'ဒီဇင်ဘာ',
  ];

  const monthName = myanmarMonths[month - 1] || parts[1];

  if (mode === 'myanmar') {
    return `${toBurmeseDigits(year)} ခုနှစ်၊ ${monthName} (${toBurmeseDigits(day)}) ရက်`;
  }
  return `${day} ${monthName} ${year}`;
};

// Web Audio API beep sound for live updates
export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch (e) {
    // Audio contexts might be blocked until user gesture, ignore error
  }
};
