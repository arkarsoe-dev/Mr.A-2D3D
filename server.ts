import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK with server-side API key
const ai = new GoogleGenAI({});

app.use(express.json());

// In-memory chat storage with initial welcoming messages
interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  badge?: string;
  prediction?: string;
  avatarColor?: string;
}

const chatMessages: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Mr.A Official',
    text: 'မင်္ဂလာပါ! Mr.A 2D3D Live မှ ကြိုဆိုပါသည်။ ကံကောင်းကြပါစေခင်ဗျာ။',
    time: '09:00 AM',
    badge: 'Admin',
    avatarColor: 'bg-amber-500',
  },
  {
    id: 'm2',
    sender: 'ကိုကျော်ကြီး',
    text: 'ဒီနေ့ 12:01 PM အတွက် ထိပ်စီး ၈ (8) လာနိုင်တယ်ဗျို့။ ၈၀၊ ၈၅ ကြိုက်တယ်။',
    time: '09:15 AM',
    prediction: '80, 85',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 'm3',
    sender: 'မသီတာ (မန္တလေး)',
    text: '3D 640 ပေါက်ခဲ့ကြလားရှင့်? ဒီလ 3D ကတော့ 724 ကြိုက်နေတယ်။',
    time: '09:30 AM',
    prediction: '3D: 724',
    avatarColor: 'bg-emerald-500',
  },
  {
    id: 'm4',
    sender: 'အောင်ကောင်းဆု',
    text: 'SET အတက်အကျ ကြည့်ရတာ ညနေပိုင်း 17/71 ဆွဲထားသင့်တယ်',
    time: '10:02 AM',
    prediction: '17',
    avatarColor: 'bg-purple-500',
  },
];

// Myanmar numeral conversion utility
export const toBurmeseDigits = (str: string | number): string => {
  const burmeseDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(str).replace(/[0-9]/g, (match) => burmeseDigits[parseInt(match, 10)]);
};

// 2D Live Cache
let cached2DData: any = null;
let last2DFetchTime = 0;
let isFetching2D = false;

// 3D Results Cache
let cached3DData: any = null;
let last3DFetchTime = 0;

import { THREE_D_HISTORICAL_DATA } from './src/data/threeDHistoricalRecords.ts';

// Merged master 3D dataset
let master3DList = [...THREE_D_HISTORICAL_DATA];

async function fetchFromThaiStock2D() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9500);

  try {
    const apiRes = await fetch('https://api.thaistock2d.com/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data && data.live) {
        cached2DData = data;
        last2DFetchTime = Date.now();
        return data;
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Silent warn, don't spam terminal
    if (error.name !== 'AbortError') {
      console.warn('thaistock2d fetch warning:', error.message);
    }
  }
  return null;
}

// Background auto-refresh loop every 4 seconds to ensure cache is always warm
setInterval(async () => {
  if (isFetching2D) return;
  isFetching2D = true;
  try {
    await fetchFromThaiStock2D();
  } finally {
    isFetching2D = false;
  }
}, 4000);

// Kick off immediately on server start
fetchFromThaiStock2D();

app.get('/api/live-2d', async (_req: Request, res: Response) => {
  const now = Date.now();

  // If cached data is fresh within 4 seconds, respond immediately
  if (cached2DData && now - last2DFetchTime < 4000) {
    return res.json(cached2DData);
  }

  // If cache is older or empty, try a fast fetch with 8s timeout
  if (!isFetching2D) {
    isFetching2D = true;
    try {
      const freshData = await fetchFromThaiStock2D();
      if (freshData) {
        return res.json(freshData);
      }
    } finally {
      isFetching2D = false;
    }
  }

  // If cached data is available (even slightly older), return it immediately to prevent abort errors
  if (cached2DData) {
    return res.json(cached2DData);
  }

  // Graceful fallback if external site is momentarily unreachable
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTimeStr = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const fallback = {
    server_time: `${currentDate} ${currentTimeStr}`,
    live: {
      set: '1,609.99',
      value: '35,895.90',
      time: `${currentDate} ${currentTimeStr}`,
      twod: '95',
      date: currentDate,
    },
    result: [
      {
        set: '1,611.14',
        value: '28,287.09',
        open_time: '11:00:00',
        twod: '47',
        stock_date: currentDate,
        stock_datetime: `${currentDate} 11:00:00`,
        history_id: 2821047,
      },
      {
        set: '--',
        value: '--',
        open_time: '12:01:00',
        twod: '--',
        stock_date: currentDate,
        stock_datetime: `${currentDate} 12:01:00`,
        history_id: null,
      },
      {
        set: '--',
        value: '--',
        open_time: '15:00:00',
        twod: '--',
        stock_date: currentDate,
        stock_datetime: `${currentDate} 15:00:00`,
        history_id: null,
      },
      {
        set: '--',
        value: '--',
        open_time: '16:30:00',
        twod: '--',
        stock_date: currentDate,
        stock_datetime: `${currentDate} 16:30:00`,
        history_id: null,
      },
    ],
    holiday: { status: '0', date: currentDate, name: '' },
    is_fallback: true,
  };
  return res.json(fallback);
});

// Route: 3D Result Data Adapter (https://api.2dboss.com/api/v2/v1/2dstock/threed-result)
app.get('/api/threed-result', async (req: Request, res: Response) => {
  const now = Date.now();
  const yearQuery = req.query.year as string;

  if (now - last3DFetchTime > 30000) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const apiRes = await fetch('https://api.2dboss.com/api/v2/v1/2dstock/threed-result', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MrA2D3D/1.0)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const json = await apiRes.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          // Merge newly fetched data with master dataset
          const map = new Map<string, string>();
          // Put master list first
          master3DList.forEach((item) => map.set(item.datetime, item.result));
          // Overwrite/add with fresh API data
          json.data.forEach((item: any) => {
            if (item.datetime && item.result) {
              map.set(item.datetime, String(item.result));
            }
          });
          master3DList = Array.from(map.entries())
            .map(([datetime, result]) => ({ datetime, result }))
            .sort((a, b) => b.datetime.localeCompare(a.datetime));
        }
      }
      last3DFetchTime = now;
    } catch (error: any) {
      console.warn('Live 3D API fetch warning:', error.message);
    }
  }

  let filtered = master3DList;
  if (yearQuery) {
    filtered = master3DList.filter((item) => item.datetime.startsWith(yearQuery));
  }

  return res.json({
    data: filtered,
    total: filtered.length,
    result: 1,
    message: 'success',
  });
});

// Route: Community Live Chat
app.get('/api/chat', (_req: Request, res: Response) => {
  res.json({ success: true, messages: chatMessages });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { sender, text, prediction } = req.body;
  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const colors = [
    'bg-amber-500',
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-teal-500',
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: true,
    hour: 'numeric',
    minute: '2-digit',
  });

  const newMessage: ChatMessage = {
    id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sender: sender?.trim() || 'မိတ်ဆွေ',
    text: text.trim().slice(0, 300),
    time: timeStr,
    prediction: prediction?.trim() ? prediction.trim().slice(0, 20) : undefined,
    avatarColor: randomColor,
  };

  chatMessages.push(newMessage);
  if (chatMessages.length > 100) {
    chatMessages.shift();
  }

  return res.json({ success: true, message: newMessage });
});

// Route: AI Chat Assistant with Gemini 3.8 Flash
app.post('/api/ai-chat', async (req: Request, res: Response) => {
  const { message, history, liveContext } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const systemInstruction = `You are Mr.A AI, a warm, polite, and deeply knowledgeable Myanmar AI Assistant embedded in the Mr.A 2D3D Live platform.
Your expertise covers:
1. Myanmar and Thailand 2D and 3D stock/lottery systems, calculations, patterns, formulas (SET index, market open/close times: 11:00 AM, 12:01 PM, 03:00 PM, 04:30 PM, Thailand 3D on 1st & 16th of each month).
2. General knowledge, mathematics, daily questions, friendly conversation, dream interpretation, Myanmar traditional knowledge, astrology, technology, and helpful advice.
3. Always respond naturally and politely in Burmese (မြန်မာဘာသာ). Keep answers helpful, clear, and well-structured.
4. Reminder: Remind users to play responsibly when discussing lottery predictions.`;

    // Format chat history if provided
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    const contextLine = liveContext && typeof liveContext === 'object'
      ? `\n\nCurrent live context (may be delayed; never present it as a guaranteed prediction): 2D=${String(liveContext.twod || '--')}, SET=${String(liveContext.set || '--')}, VALUE=${String(liveContext.value || '--')}, latest 3D=${String(liveContext.latest3d || '--')} on ${String(liveContext.latest3dDate || '--')}.`
      : '';

    contents.push({
      role: 'user',
      parts: [{ text: `${message.trim()}${contextLine}` }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'မင်္ဂလာပါခင်ဗျာ၊ မေးခွန်းကို ပြန်လည်ဖြေကြားပေးပါမည်။';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Graceful helpful fallback
    return res.json({
      reply: 'မင်္ဂလာပါခင်ဗျာ! Mr.A AI စနစ်မှ ကြိုဆိုပါသည်။ လက်ရှိတွင် ကွန်ရက်ခေတ္တအလုပ်များနေပါသဖြင့် ခေတ္တအကြာတွင် ပြန်လည်မေးမြန်းနိုင်ပါသည်။ ၂လုံးထီ၊ ၃လုံးထီ သို့မဟုတ် အထွေထွေ ဗဟုသုတများကို ဆက်လက်မေးမြန်းနိုင်ပါသည်ခင်ဗျာ။',
    });
  }
});

// Static or Vite integration
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mr.A 2D3D Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
