import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  User,
  Zap,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { NumeralMode } from '../types';

interface AiChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface AiChatProps {
  numeralMode: NumeralMode;
}

export const AiChat: React.FC<AiChatProps> = () => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'ai_intro',
      role: 'model',
      text: 'မင်္ဂလာပါခင်ဗျာ! ကျွန်တော်က Mr.A AI စမတ်လက်ထောက်ဖြစ်ပါတယ်။ ထိုင်း ၂လုံးထီ၊ ၃လုံးထီ သဘောတရားများ၊ တွက်ချက်နည်းများ၊ အိပ်မက်နိမိတ်ဖတ်ခြင်း သို့မဟုတ် အခြား အထွေထွေဗဟုသုတ မည်သည့်အကြောင်းအရာမဆို မေးမြန်းဆွေးနွေးနိုင်ပါသည်ခင်ဗျာ။',
      time: new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'ထိုင်း ၂လုံးထီ SET Index တွက်နည်း ရှင်းပြပေးပါ',
    '၃လုံးထီ အာကာစိုး ဇယားကို ဘယ်လို ဖတ်ရမလဲ',
    'ဒီနေ့အတွက် ကံကောင်းစေမယ့် အကြံပြုချက်',
    'ရွှေအိပ်မက်မက်ရင် ဘာနိမိတ်လဲ',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (userPrompt?: string) => {
    const textToSend = userPrompt || inputText;
    if (!textToSend.trim() || loading) return;

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
    });

    const userMsg: AiChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      time: timeStr,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'think', text: 'မေးခွန်းကို စဉ်းစားနေတယ်' } }));

    try {
      // Build history for API
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const aiMsg: AiChatMessage = {
          id: `ai_${Date.now()}`,
          role: 'model',
          text: json.reply || 'တုံ့ပြန်ချက်ရရှိပါသည်ခင်ဗျာ။',
          time: new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'speaking', text: 'အဖြေပြောနေတယ်' } }));
      } else {
        throw new Error('API failed');
      }
    } catch (e) {
      console.error('AI chat failed:', e);
      window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'confused', text: 'အဖြေရှာရာမှာ ခဏအခက်အခဲရှိတယ်' } }));
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_err_${Date.now()}`,
          role: 'model',
          text: 'ခေတ္တချို့ယွင်းချက်ဖြစ်ပေါ်နေပါသည်။ ကျေးဇူးပြု၍ ပြန်လည်မေးမြန်းပေးပါခင်ဗျာ။',
          time: new Date().toLocaleTimeString('en-US', {
            hour12: true,
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: 'စကားပြောခန်းအသစ် စတင်ပါပြီခင်ဗျာ။ မည်သည့်အရာ မေးမြန်းလိုပါသလဲ?',
        time: new Date().toLocaleTimeString('en-US', {
          hour12: true,
          hour: 'numeric',
          minute: '2-digit',
        }),
      },
    ]);
  };

  return (
    <div className="mra-chat-panel rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-indigo-500/30 p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
              <span>Mr.A AI စမတ်လက်ထောက်</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Gemini AI
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              ၂လုံး၊ ၃လုံးထီ သဘောတရားနှင့် အထွေထွေ အမေးအဖြေ စကားပြောခန်း
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition flex items-center gap-1"
          title="အသစ်စတင်ရန်"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">စကားပြောခန်းရှင်းရန်</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="flex-shrink-0 text-[11px] text-amber-400 flex items-center gap-1 font-semibold pl-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          နမူနာ မေးခွန်းများ:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-amber-300 transition"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="space-y-3.5 max-h-[460px] min-h-[280px] overflow-y-auto pr-1">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-amber-500/15 border-amber-500/40 text-slate-100 rounded-tr-none'
                    : 'bg-slate-950/80 border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 mb-1 border-b border-slate-800/60 pb-1">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'သင် (You)' : 'Mr.A AI'}
                  </span>
                  <span>{m.time}</span>
                </div>
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Mr.A AI စဉ်းစားဖြေကြားနေပါသည်...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 border-t border-slate-800 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'listening', text: 'နားထောင်နေတယ်' } }));
            }}
            placeholder="Mr.A AI အား အထွေထွေ မေးမြန်းရန် ရိုက်ထည့်ပါ..."
            disabled={loading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">မေးမည်</span>
        </button>
      </form>
    </div>
  );
};
