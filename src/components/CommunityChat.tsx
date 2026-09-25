import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  Smile,
  RefreshCw,
} from 'lucide-react';
import { ChatMessage, NumeralMode } from '../types';
import { formatNumeral } from '../utils/numberConverter';

interface CommunityChatProps {
  numeralMode: NumeralMode;
}

export const CommunityChat: React.FC<CommunityChatProps> = ({ numeralMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState(() => {
    return localStorage.getItem('mra_user_name') || 'ထီဝါသနာရှင်';
  });
  const [predictionTag, setPredictionTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prediction suggestions
  const quickPredictions = ['80', '17', '38', '05', '3D: 640', 'ထိပ်စီး ၈', 'နောက်ပိတ် ၀'];

  const fetchChatMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/chat');
      if (res.ok) {
        const json = await res.json();
        if (json.messages) {
          setMessages(json.messages);
        }
      }
    } catch (e) {
      console.warn('Failed to load chat messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || submitting) return;

    try {
      setSubmitting(true);
      localStorage.setItem('mra_user_name', senderName.trim() || 'ထီဝါသနာရှင်');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderName.trim() || 'ထီဝါသနာရှင်',
          text: inputText.trim(),
          prediction: predictionTag.trim() || undefined,
        }),
      });

      if (res.ok) {
        setInputText('');
        setPredictionTag('');
        window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'speaking', text: 'အဖွဲ့ထဲမှာ စကားပြောနေတယ်' } }));
        await fetchChatMessages();
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mra-chat-panel rounded-2xl bg-slate-900/90 border border-amber-500/20 shadow-xl overflow-hidden flex flex-col h-[650px]">
      {/* Chat Room Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Mr.A အဖွဲ့လိုက် စကားပြောခန်း (Live Group Chat)</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </h3>
            <p className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" />
                အသင်းဝင်များ ၂လုံး၊ ၃လုံး ခန့်မှန်းချက် ဖလှယ်ရာနေရာ
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchChatMessages}
          title="စကားဝိုင်း ပြန်လည်ဆန်းသစ်ရန်"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-amber-400 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-slate-950/40 to-slate-900/40">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-950 flex-shrink-0 shadow-md ${
                msg.avatarColor || 'bg-amber-400'
              }`}
            >
              {msg.sender.slice(0, 1)}
            </div>

            <div className="flex-1 max-w-[85%]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-slate-300">{msg.sender}</span>
                {msg.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {msg.badge}
                  </span>
                )}
                <span className="text-[10px] text-slate-500 font-num">
                  {formatNumeral(msg.time, numeralMode)}
                </span>
              </div>

              <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-950/80 border border-slate-800/90 text-xs sm:text-sm text-slate-200 shadow-sm leading-relaxed">
                {msg.prediction && (
                  <div className="inline-block mb-1.5 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs font-num">
                    🎯 ခန့်မှန်းဂဏန်း: {formatNumeral(msg.prediction, numeralMode)}
                  </div>
                )}
                <div>{msg.text}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Prediction Quick Chips */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
          <TrendingUp className="w-3 h-3 text-amber-400" />
          အကြိုက်ဂဏန်း:
        </span>
        {quickPredictions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setPredictionTag(tag)}
            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition ${
              predictionTag === tag
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-500/50'
            }`}
          >
            {formatNumeral(tag, numeralMode)}
          </button>
        ))}
      </div>

      {/* Input Box Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1/3 sm:w-1/4">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="သင့်အမည်"
              maxLength={20}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                window.dispatchEvent(new CustomEvent('mra:character', { detail: { action: 'listening', text: 'စကားကို နားထောင်နေတယ်' } }));
              }}
              placeholder="သဘောထား/ဂဏန်းအမြင် ရေးသားပါ..."
              maxLength={250}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
            {predictionTag && (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                {predictionTag}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !inputText.trim()}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ပို့မည်</span>
          </button>
        </div>
      </form>
    </div>
  );
};
