import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

// 3D Results Cache
let cached3DData: any = null;
let last3DFetchTime = 0;

// Route: 2D Live Data Adapter
app.get('/api/live-2d', async (_req: Request, res: Response) => {
  const now = Date.now();
  // Cache for 2 seconds to prevent rate-limiting while keeping live ticker snappy
  if (cached2DData && now - last2DFetchTime < 2000) {
    return res.json(cached2DData);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const apiRes = await fetch('https://api.thaistock2d.com/live', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MrA2D3D/1.0; +https://thaistock2d.com)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`2D API responded with status ${apiRes.status}`);
    }

    const data = await apiRes.json();
    cached2DData = data;
    last2DFetchTime = now;
    return res.json(data);
  } catch (error: any) {
    console.warn('Failed to fetch from thaistock2d.com:', error.message);
    if (cached2DData) {
      return res.json(cached2DData);
    }

    // Graceful fallback if external site is momentarily down or market closed
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
        set: '1,610.81',
        value: '25,887.81',
        time: `${currentDate} ${currentTimeStr}`,
        twod: '17',
        date: currentDate,
      },
      result: [
        {
          set: '1,608.20',
          value: '14,210.50',
          open_time: '11:00:00',
          twod: '05',
          stock_date: currentDate,
          stock_datetime: `${currentDate} 11:00:00`,
          history_id: 1,
        },
        {
          set: '1,609.43',
          value: '22,410.87',
          open_time: '12:01:00',
          twod: '38',
          stock_date: currentDate,
          stock_datetime: `${currentDate} 12:01:00`,
          history_id: 2,
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
  }
});

// Route: 3D Result Data Adapter (https://api.2dboss.com/api/v2/v1/2dstock/threed-result)
app.get('/api/threed-result', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (cached3DData && now - last3DFetchTime < 30000) {
    return res.json(cached3DData);
  }

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

    if (!apiRes.ok) {
      throw new Error(`3D API responded with status ${apiRes.status}`);
    }

    const json = await apiRes.json();
    cached3DData = json;
    last3DFetchTime = now;
    return res.json(json);
  } catch (error: any) {
    console.warn('Failed to fetch from 2dboss.com 3D API:', error.message);
    if (cached3DData) {
      return res.json(cached3DData);
    }

    // Graceful fallback with authentic 3D recent draw records
    const fallback3D = {
      data: [
        { result: '640', datetime: '2026-09-16' },
        { result: '212', datetime: '2026-09-01' },
        { result: '615', datetime: '2026-08-16' },
        { result: '479', datetime: '2026-08-01' },
        { result: '214', datetime: '2026-07-16' },
        { result: '068', datetime: '2026-07-01' },
        { result: '805', datetime: '2026-06-16' },
        { result: '519', datetime: '2026-06-01' },
        { result: '903', datetime: '2026-05-16' },
        { result: '603', datetime: '2026-05-02' },
        { result: '872', datetime: '2026-04-16' },
        { result: '924', datetime: '2026-04-01' },
      ],
      result: 1,
      message: 'success',
      is_fallback: true,
    };
    return res.json(fallback3D);
  }
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
