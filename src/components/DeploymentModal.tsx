import React, { useState } from 'react';
import { X, Copy, Check, Github, Globe, Terminal, ExternalLink, Rocket } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentModal: React.FC<DeploymentModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const gitSnippet = `# 1. Git repository အသစ်စတင်ရန်
git init
git add .
git commit -m "Initial commit: Mr.A 2D3D Live App"
git branch -M main

# 2. သင်၏ GitHub repo URL ထည့်ပါ (GitHub တွင် repo အသစ်ဖွင့်ပြီးပါက)
git remote add origin https://github.com/<YOUR-USERNAME>/mr-a-2d3d-live.git

# 3. GitHub သို့ တင်ရန် (Push)
git push -u origin main`;

  const vercelSnippet = `# Vercel CLI ဖြင့် တစ်ချက်နှိပ် deploy လုပ်ရန်:
npm install -g vercel
vercel deploy --prod`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-500/30 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>GitHub Repo ဖန်တီးခြင်း နှင့် Website Deploy ပြုလုပ်နည်း</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mr.A 2D3D Live ကို GitHub သို့ တင်ပြီး Vercel / Render / Cloudflare တွင် အခမဲ့ လွှင့်တင်နည်း
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4" />
                အဆင့် ၁: GitHub Repository သို့ တင်ရန် (Git Commands)
              </span>
              <button
                onClick={() => copyToClipboard(gitSnippet, 1)}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 1 ? 'ကူးယူပြီး' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-xs text-amber-200/90 overflow-x-auto whitespace-pre">
              {gitSnippet}
            </pre>
          </div>

          {/* Step 2: Deployment options */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Rocket className="w-4 h-4" />
              အဆင့် ၂: အခမဲ့ Website Hosting များတွင် Deploy ပြုလုပ်ခြင်း
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Vercel */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">၁။ Vercel (အကြံပြုချက်)</span>
                  <a
                    href="https://vercel.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <span>သွားရန်</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-xs">
                  Vercel.com သို့သွားပြီး "Add New Project" မှ သင်၏ GitHub Repo ကို ရွေးချယ်ရုံဖြင့် ချက်ချင်း Live ဖြစ်ပါမည်။
                </p>
              </div>

              {/* Option B: Render / Cloudflare */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">၂။ Render / Railway</span>
                  <a
                    href="https://render.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <span>သွားရန်</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-slate-400 text-xs">
                  Full-stack Express ဆာဗာအတွက် Render.com တွင် "Web Service" အဖြစ် Build Command: <code>npm run build</code>, Start Command: <code>npm start</code> သတ်မှတ်ပါ။
                </p>
              </div>
            </div>
          </div>

          {/* Connected APIs */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
            <div className="font-bold text-amber-300">💡 ချိတ်ဆက်ထားသော Live API များ:</div>
            <div className="text-slate-300">
              • ၂လုံးထီ Live API: <code className="text-amber-400">https://api.thaistock2d.com/live</code>
            </div>
            <div className="text-slate-300">
              • ၃လုံးထီ Results API: <code className="text-amber-400">https://api.2dboss.com/api/v2/v1/2dstock/threed-result</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            ပိတ်မည်
          </button>
        </div>
      </div>
    </div>
  );
};
