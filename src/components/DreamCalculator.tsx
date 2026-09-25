import React, { useState } from 'react';
import { BookOpen, Sparkles, Calculator, Search, Dices, Flame, Check } from 'lucide-react';
import { NumeralMode } from '../types';
import { formatNumeral } from '../utils/numberConverter';

interface DreamCalculatorProps {
  numeralMode: NumeralMode;
}

interface DreamItem {
  keyword: string;
  twod: string[];
  threed: string[];
  meaning: string;
}

const DREAM_DICTIONARY: DreamItem[] = [
  { keyword: 'မြွေ (Snake)', twod: ['07', '70', '77', '87'], threed: ['707', '870'], meaning: 'မြွေကိုက်ခြင်း၊ မြွေတွေ့ခြင်း' },
  { keyword: 'ရေ (Water/River)', twod: ['22', '24', '42', '02'], threed: ['224', '420'], meaning: 'ရေကူးခြင်း၊ ရေကြီးခြင်း၊ ရေကြည်' },
  { keyword: 'ရွှေ (Gold)', twod: ['19', '91', '14', '41'], threed: ['919', '149'], meaning: 'ရွှေလက်စွပ်၊ ရွှေဆွဲကြိုး ကောက်ရခြင်း' },
  { keyword: 'ဘုရားဖူး (Pagoda)', twod: ['89', '98', '08', '80'], threed: ['980', '889'], meaning: 'ဘုရားရှိခိုးခြင်း၊ ဘုရားဖူးရခြင်း' },
  { keyword: 'ဆင် (Elephant)', twod: ['19', '91', '79', '97'], threed: ['197', '971'], meaning: 'ဆင်ဖြူတော်၊ ဆင်စီးခြင်း' },
  { keyword: 'ငွေကြေး (Money)', twod: ['56', '65', '45', '54'], threed: ['565', '456'], meaning: 'ပိုက်ဆံကောက်ရခြင်း၊ ငွေအများအပြား' },
  { keyword: 'မီး (Fire)', twod: ['03', '30', '33', '93'], threed: ['303', '933'], meaning: 'မီးလောင်ခြင်း၊ မီးတောက်မြင်ရခြင်း' },
  { keyword: 'ကလေးမွေးဖွား (Baby)', twod: ['13', '31', '01', '10'], threed: ['131', '013'], meaning: 'ကလေးမွေးခြင်း၊ ကလေးချီခြင်း' },
  { keyword: 'ကား/ဆိုင်ကယ် (Car/Bike)', twod: ['48', '84', '44', '88'], threed: ['484', '848'], meaning: 'ကားသစ်ဝယ်ခြင်း၊ ကားတိုက်ခြင်း' },
  { keyword: 'ငါး (Fish)', twod: ['08', '80', '28', '82'], threed: ['808', '280'], meaning: 'ငါးဖမ်းခြင်း၊ ငါးကင်စားခြင်း' },
  { keyword: 'သေသူ/အသုဘ (Dead/Funeral)', twod: ['04', '40', '49', '94'], threed: ['404', '494'], meaning: 'သေဆုံးသူနှင့် စကားပြောခြင်း၊ အသုဘ' },
  { keyword: 'မင်္ဂလာဆောင် (Wedding)', twod: ['26', '62', '66', '22'], threed: ['262', '662'], meaning: 'မင်္ဂလာဆောင် တက်ရောက်ခြင်း' },
];

export const DreamCalculator: React.FC<DreamCalculatorProps> = ({ numeralMode }) => {
  const [activeTab, setActiveTab] = useState<'dream' | 'calc' | 'random'>('dream');
  const [searchQuery, setSearchQuery] = useState('');

  // Formula inputs
  const [inputHead, setInputHead] = useState('');
  const [inputTail, setInputTail] = useState('');
  const [inputBrake, setInputBrake] = useState('');

  // Random generator
  const [random2D, setRandom2D] = useState<string[]>(['80', '17', '38']);
  const [random3D, setRandom3D] = useState<string[]>(['640', '212', '724']);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredDreams = DREAM_DICTIONARY.filter(
    (d) =>
      d.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.twod.some((n) => n.includes(searchQuery))
  );

  const generateLuckyNumbers = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const new2D = Array.from({ length: 4 }, () =>
        String(Math.floor(Math.random() * 100)).padStart(2, '0')
      );
      const new3D = Array.from({ length: 3 }, () =>
        String(Math.floor(Math.random() * 1000)).padStart(3, '0')
      );
      setRandom2D(new2D);
      setRandom3D(new3D);
      setIsGenerating(false);
    }, 400);
  };

  // Calculate combinations from Head/Tail
  const calculatedNumbers: string[] = [];
  if (inputHead) {
    for (let i = 0; i <= 9; i++) {
      calculatedNumbers.push(`${inputHead}${i}`);
    }
  }
  if (inputTail) {
    for (let i = 0; i <= 9; i++) {
      calculatedNumbers.push(`${i}${inputTail}`);
    }
  }

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Sub Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('dream')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'dream'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>အိပ်မက် အဘိဓာန်</span>
        </button>

        <button
          onClick={() => setActiveTab('random')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'random'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>ကံစမ်းဂဏန်း မွေးရန်</span>
        </button>

        <button
          onClick={() => setActiveTab('calc')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${
            activeTab === 'calc'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>ထိပ်စီး/နောက်ပိတ်</span>
        </button>
      </div>

      {/* Tab 1: Dream Dictionary */}
      {activeTab === 'dream' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>မြန်မာ့ရိုးရာ အိပ်မက်နိမိတ် ထီဂဏန်းများ</span>
              </h3>
              <p className="text-xs text-slate-400">
                အိပ်မက်မြင်မက်မှုအလိုက် ထွက်တတ်သော ၂လုံး၊ ၃လုံး ဂဏန်းများ
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="အိပ်မက်အမည် ရှာရန် (ဥပမာ: မြွေ၊ ရေ)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredDreams.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between space-y-2 shadow-sm"
              >
                <div>
                  <h4 className="text-xs font-bold text-amber-300">{item.keyword}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.meaning}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">၂လုံးဂဏန်း:</span>
                    <div className="flex items-center gap-1">
                      {item.twod.map((n, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-num font-bold text-xs"
                        >
                          {formatNumeral(n, numeralMode)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-500">၃လုံးဂဏန်း:</span>
                    <div className="flex items-center gap-1">
                      {item.threed.map((n, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-num font-bold text-xs"
                        >
                          {formatNumeral(n, numeralMode)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Random Lucky Generator */}
      {activeTab === 'random' && (
        <div className="space-y-5 text-center py-4">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-100 flex items-center justify-center gap-2">
              <Dices className="w-5 h-5 text-amber-400" />
              <span>Mr.A ကံစမ်းဂဏန်း မွေးထုတ်စနစ် (Lucky Generator)</span>
            </h3>
            <p className="text-xs text-slate-400">
              ဒီနေ့အတွက် ကံကောင်းစေမည့် ၂လုံးထီနှင့် ၃လုံးထီ မွေးဂဏန်းများ ရယူပါ
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* 2D Lucky Box */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                ⭐ ကံထူး ၂လုံးထီ ဂဏန်းများ
              </span>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {random2D.map((num, i) => (
                  <div
                    key={i}
                    className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-950 border border-amber-500/40 flex items-center justify-center shadow-lg"
                  >
                    <span className="font-num text-2xl font-black text-amber-300">
                      {formatNumeral(num, numeralMode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Lucky Box */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                💎 ကံထူး ၃လုံးထီ ဂဏန်းများ
              </span>
              <div className="flex items-center justify-center gap-2.5 flex-wrap">
                {random3D.map((num, i) => (
                  <div
                    key={i}
                    className="w-16 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950 border border-emerald-500/40 flex items-center justify-center shadow-lg"
                  >
                    <span className="font-num text-2xl font-black text-emerald-300">
                      {formatNumeral(num, numeralMode)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <button
              onClick={generateLuckyNumbers}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm hover:brightness-110 shadow-lg shadow-amber-500/25 transition disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'ဂဏန်းရွေးချယ်နေသည်...' : 'ကံစမ်းဂဏန်း အသစ်ထုတ်မည်'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Formula & Head-Tail */}
      {activeTab === 'calc' && (
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>ထိပ်စီး နှင့် နောက်ပိတ် ဂဏန်းတွဲထုတ်စက်</span>
            </h3>
            <p className="text-xs text-slate-400">
              မိမိနှစ်သက်သော ထိပ်စီး သို့မဟုတ် နောက်ပိတ် ဂဏန်းကို ရိုက်ထည့်၍ တွဲဂဏန်းများ ထုတ်ယူနိုင်ပါသည်
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-amber-300 block">
                ထိပ်စီး ဂဏန်း (Head Digit):
              </label>
              <input
                type="number"
                min="0"
                max="9"
                value={inputHead}
                onChange={(e) => setInputHead(e.target.value.slice(0, 1))}
                placeholder="ဥပမာ: 8"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-num"
              />
              <span className="text-[10px] text-slate-500">
                (ထိပ်စီး 8 ထည့်ပါက 80 မှ 89 အထိ ထွက်ပေါ်မည်)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-amber-300 block">
                နောက်ပိတ် ဂဏန်း (Tail Digit):
              </label>
              <input
                type="number"
                min="0"
                max="9"
                value={inputTail}
                onChange={(e) => setInputTail(e.target.value.slice(0, 1))}
                placeholder="ဥပမာ: 0"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-num"
              />
              <span className="text-[10px] text-slate-500">
                (နောက်ပိတ် 0 ထည့်ပါက 00, 10, ... 90 အထိ ထွက်ပေါ်မည်)
              </span>
            </div>
          </div>

          {/* Results preview */}
          {calculatedNumbers.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-2">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ထွက်ပေါ်လာသော ဂဏန်းတွဲများ ({formatNumeral(calculatedNumbers.length, numeralMode)} ကွက်):
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {calculatedNumbers.map((num, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-num font-bold text-sm"
                  >
                    {formatNumeral(num, numeralMode)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
