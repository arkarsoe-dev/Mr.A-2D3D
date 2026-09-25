import { ThreeDItem } from '../types';

export interface DigitProperties {
  number: string;
  head: string;
  mid: string;
  tail: string;
  sumTotal: number;
  sumSingle: number; // Modulo 10
  frontPair: string;
  backPair: string;
  cutPair: string;
  powerNumber: string;
  natkhatNumber: string;
  evenOddType: string;
  highLowType: string;
}

// Power table (0-5, 1-6, 2-7, 3-8, 4-9)
const POWER_MAP: Record<string, string> = {
  '0': '5', '1': '6', '2': '7', '3': '8', '4': '9',
  '5': '0', '6': '1', '7': '2', '8': '3', '9': '4',
};

// Natkhat table (0-7, 1-8, 2-4, 3-5, 6-9)
const NATKHAT_MAP: Record<string, string> = {
  '0': '7', '1': '8', '2': '4', '3': '5', '4': '2',
  '5': '3', '6': '9', '7': '0', '8': '1', '9': '6',
};

export const calculateDigitProperties = (numStr: string): DigitProperties | null => {
  if (!numStr || numStr.length !== 3) return null;
  const d0 = parseInt(numStr[0], 10);
  const d1 = parseInt(numStr[1], 10);
  const d2 = parseInt(numStr[2], 10);
  if (isNaN(d0) || isNaN(d1) || isNaN(d2)) return null;

  const sumTotal = d0 + d1 + d2;
  const sumSingle = sumTotal % 10;

  const head = numStr[0];
  const mid = numStr[1];
  const tail = numStr[2];

  const frontPair = `${head}${mid}`;
  const backPair = `${mid}${tail}`;
  const cutPair = `${head}${tail}`;

  const powerNumber = `${POWER_MAP[head] || '0'}${POWER_MAP[mid] || '0'}${POWER_MAP[tail] || '0'}`;
  const natkhatNumber = `${NATKHAT_MAP[head] || '0'}${NATKHAT_MAP[mid] || '0'}${NATKHAT_MAP[tail] || '0'}`;

  const isEven = (n: number) => n % 2 === 0;
  const evenOddType = `${isEven(d0) ? 'စုံ' : 'မ'}-${isEven(d1) ? 'စုံ' : 'မ'}-${isEven(d2) ? 'စုံ' : 'မ'}`;

  const isHigh = (n: number) => n >= 5;
  const highLowType = `${isHigh(d0) ? 'ကြီး' : 'ငယ်'}-${isHigh(d1) ? 'ကြီး' : 'ငယ်'}-${isHigh(d2) ? 'ကြီး' : 'ငယ်'}`;

  return {
    number: numStr,
    head,
    mid,
    tail,
    sumTotal,
    sumSingle,
    frontPair,
    backPair,
    cutPair,
    powerNumber,
    natkhatNumber,
    evenOddType,
    highLowType,
  };
};

// Find all permutations of a 3-digit number (e.g. 640 -> 640, 604, 460, 406, 064, 046)
export const getNumberPermutations = (str: string): string[] => {
  if (str.length !== 3) return [str];
  const perms = new Set<string>();
  const arr = str.split('');
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        if (i !== j && j !== k && i !== k) {
          perms.add(`${arr[i]}${arr[j]}${arr[k]}`);
        }
      }
    }
  }
  return Array.from(perms);
};

// Search historical appearances of a number or its permutations
export const search3DHistory = (
  query: string,
  records: ThreeDItem[]
): {
  exactMatches: ThreeDItem[];
  permutationMatches: { record: ThreeDItem; matchedNumber: string }[];
} => {
  const clean = query.trim();
  if (clean.length !== 3) {
    // If partial search (1 or 2 digits)
    const partials = records.filter(r => r.result.includes(clean));
    return {
      exactMatches: partials,
      permutationMatches: [],
    };
  }

  const perms = getNumberPermutations(clean);
  const exactMatches = records.filter(r => r.result === clean);

  const permMatches: { record: ThreeDItem; matchedNumber: string }[] = [];
  records.forEach(r => {
    if (perms.includes(r.result)) {
      permMatches.push({ record: r, matchedNumber: r.result });
    }
  });

  return {
    exactMatches,
    permutationMatches: permMatches,
  };
};

// Find same draw date occurrences across previous years (e.g. Month = 9, Day = 16)
export const getSameDateHistoricalMatches = (
  month: number, // 1-12
  isFirstHalf: boolean, // true for ~1st, false for ~16th
  records: ThreeDItem[]
): ThreeDItem[] => {
  return records.filter(rec => {
    const parts = rec.datetime.split('-');
    if (parts.length < 3) return false;
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (m !== month) return false;
    if (isFirstHalf) {
      return d <= 5;
    } else {
      return d >= 14 && d <= 18;
    }
  });
};

// Digit Frequency Analysis (Head, Mid, Tail)
export const calculateDigitFrequencies = (records: ThreeDItem[]) => {
  const headCounts: Record<string, number> = {};
  const midCounts: Record<string, number> = {};
  const tailCounts: Record<string, number> = {};
  const sumCounts: Record<number, number> = {};

  for (let i = 0; i <= 9; i++) {
    headCounts[String(i)] = 0;
    midCounts[String(i)] = 0;
    tailCounts[String(i)] = 0;
  }

  records.forEach(r => {
    if (r.result && r.result.length === 3) {
      headCounts[r.result[0]] = (headCounts[r.result[0]] || 0) + 1;
      midCounts[r.result[1]] = (midCounts[r.result[1]] || 0) + 1;
      tailCounts[r.result[2]] = (tailCounts[r.result[2]] || 0) + 1;

      const sum = (parseInt(r.result[0], 10) + parseInt(r.result[1], 10) + parseInt(r.result[2], 10)) % 10;
      sumCounts[sum] = (sumCounts[sum] || 0) + 1;
    }
  });

  return { headCounts, midCounts, tailCounts, sumCounts };
};
