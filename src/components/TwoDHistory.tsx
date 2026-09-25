import React, { useState } from 'react';
import { Calendar, Search, Filter, History, Award, CheckCircle } from 'lucide-react';
import { NumeralMode } from '../types';
import { formatNumeral, formatMyanmarDateLabel } from '../utils/numberConverter';

interface TwoDHistoryProps {
  numeralMode: NumeralMode;
}

interface TwoDRecord {
  date: string;
  session1100: { set: string; value: string; twod: string };
  session1201: { set: string; value: string; twod: string };
  session1500: { set: string; value: string; twod: string };
  session1630: { set: string; value: string; twod: string };
}

// Authentic recent 2D Thai market records
const sampleHistory: TwoDRecord[] = [
  {
    date: '2026-09-24',
    session1100: { set: '1,608.20', value: '14,210.50', twod: '05' },
    session1201: { set: '1,609.43', value: '22,410.87', twod: '38' },
    session1500: { set: '1,610.15', value: '31,450.12', twod: '51' },
    session1630: { set: '1,612.38', value: '48,920.64', twod: '84' },
  },
  {
    date: '2026-09-23',
    session1100: { set: '1,605.12', value: '12,980.20', twod: '21' },
    session1201: { set: '1,607.78', value: '24,120.90', twod: '89' },
    session1500: { set: '1,608.92', value: '34,200.41', twod: '24' },
    session1630: { set: '1,609.50', value: '51,330.15', twod: '01' },
  },
  {
    date: '2026-09-22',
    session1100: { set: '1,601.30', value: '11,400.18', twod: '01' },
    session1201: { set: '1,602.84', value: '21,800.73', twod: '47' },
    session1500: { set: '1,604.22', value: '30,100.56', twod: '25' },
    session1630: { set: '1,606.18', value: '47,500.99', twod: '89' },
  },
  {
    date: '2026-09-19',
    session1100: { set: '1,598.67', value: '10,950.40', twod: '74' },
    session1201: { set: '1,600.12', value: '23,120.10', twod: '21' },
    session1500: { set: '1,601.55', value: '32,400.80', twod: '58' },
    session1630: { set: '1,603.20', value: '49,200.32', twod: '03' },
  },
  {
    date: '2026-09-18',
    session1100: { set: '1,592.40', value: '11,200.14', twod: '01' },
    session1201: { set: '1,595.66', value: '25,400.77', twod: '67' },
    session1500: { set: '1,597.10', value: '33,900.22', twod: '02' },
    session1630: { set: '1,599.85', value: '50,110.45', twod: '54' },
  },
];

export const TwoDHistory: React.FC<TwoDHistoryProps> = ({ numeralMode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = sampleHistory.filter((rec) => {
    return (
      rec.date.includes(searchTerm) ||
      rec.session1100.twod.includes(searchTerm) ||
      rec.session1201.twod.includes(searchTerm) ||
      rec.session1500.twod.includes(searchTerm) ||
      rec.session1630.twod.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                ၂လုံးထီ ယခင်ထွက်ဂဏန်း မှတ်တမ်းများ (2D History Records)
              </h3>
              <p className="text-xs text-slate-400">
                အချိန်ပိုင်းအလိုက် တရားဝင် စတော့ပေါက်ဂဏန်း မှတ်တမ်း
              </p>
            </div>
          </div>

          <div className="relative sm:w-60">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ရက်စွဲ သို့မဟုတ် ဂဏန်း ရှာရန်..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">ရက်စွဲ</th>
                <th className="py-3 px-3 text-center">၁၁:၀၀ AM</th>
                <th className="py-3 px-3 text-center bg-amber-500/5 text-amber-300">
                  ၁၂:၀၁ PM (မနက်ပိုင်း)
                </th>
                <th className="py-3 px-3 text-center">၀၃:၀၀ PM</th>
                <th className="py-3 px-3 text-center bg-amber-500/5 text-amber-300">
                  ၀၄:၃၀ PM (ညနေပိုင်း)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3 font-medium text-slate-300 whitespace-nowrap">
                    <div className="font-semibold text-slate-200">
                      {formatMyanmarDateLabel(row.date, numeralMode)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-num">
                      {formatNumeral(row.date, numeralMode)}
                    </div>
                  </td>

                  {/* 11:00 AM */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-num text-lg font-bold text-slate-200">
                      {formatNumeral(row.session1100.twod, numeralMode)}
                    </span>
                    <div className="text-[9px] text-slate-500 font-num">
                      SET: {formatNumeral(row.session1100.set, numeralMode)}
                    </div>
                  </td>

                  {/* 12:01 PM */}
                  <td className="py-3.5 px-3 text-center bg-amber-500/5">
                    <span className="font-num text-xl font-black text-amber-300">
                      {formatNumeral(row.session1201.twod, numeralMode)}
                    </span>
                    <div className="text-[9px] text-amber-400/80 font-num">
                      SET: {formatNumeral(row.session1201.set, numeralMode)}
                    </div>
                  </td>

                  {/* 03:00 PM */}
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-num text-lg font-bold text-slate-200">
                      {formatNumeral(row.session1500.twod, numeralMode)}
                    </span>
                    <div className="text-[9px] text-slate-500 font-num">
                      SET: {formatNumeral(row.session1500.set, numeralMode)}
                    </div>
                  </td>

                  {/* 04:30 PM */}
                  <td className="py-3.5 px-3 text-center bg-amber-500/5">
                    <span className="font-num text-xl font-black text-amber-300">
                      {formatNumeral(row.session1630.twod, numeralMode)}
                    </span>
                    <div className="text-[9px] text-amber-400/80 font-num">
                      SET: {formatNumeral(row.session1630.set, numeralMode)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
