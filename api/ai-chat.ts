import { GoogleGenAI } from '@google/genai';

type Request = { method?: string; body?: unknown };
type Response = { status: (code: number) => Response; json: (body: unknown) => void; setHeader?: (name: string, value: string) => void };

type ChatItem = { role?: string; text?: string };

type LiveContext = { twod?: string; set?: string; value?: string; latest3d?: string; latest3dDate?: string };

const fallback = 'မင်္ဂလာပါခင်ဗျာ။ Mr.A AI ကို ခဏချိတ်ဆက်မရသေးပါ။ နည်းနည်းကြာပြီး ပြန်မေးပေးပါခင်ဗျာ။';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = (req.body || {}) as { message?: unknown; history?: unknown; liveContext?: unknown };
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'Message is required' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI service is not configured', reply: fallback });

  try {
    const history = Array.isArray(body.history) ? body.history as ChatItem[] : [];
    const live = body.liveContext && typeof body.liveContext === 'object' ? body.liveContext as LiveContext : {};
    const contents = history.slice(-8).filter((item) => item?.text).map((item) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: String(item.text) }],
    }));
    const context = `\n\nLive context (may be delayed; do not make guaranteed predictions): 2D=${live.twod || '--'}, SET=${live.set || '--'}, VALUE=${live.value || '--'}, latest 3D=${live.latest3d || '--'} on ${live.latest3dDate || '--'}.`;
    contents.push({ role: 'user', parts: [{ text: `${message}${context}` }] });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents,
      config: {
        temperature: 0.7,
        systemInstruction: `You are Mr.A AI, a warm and trustworthy Myanmar assistant. Answer naturally in Burmese unless the user asks for another language. Explain 2D/3D, SET and general topics clearly. Treat live numbers as informational and possibly delayed, never as guaranteed lottery predictions. Encourage responsible play and never claim certainty. Keep mobile-chat answers concise, structured, and useful.`,
      },
    });
    return res.status(200).json({ reply: response.text || fallback, model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
  } catch (error) {
    console.error('Vercel AI chat error:', error);
    return res.status(502).json({ error: 'AI provider unavailable', reply: fallback });
  }
}
