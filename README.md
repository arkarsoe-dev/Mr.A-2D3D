# Mr.A 2D3D Live (မြန်မာ ၂လုံးထီ ၃လုံးထီ တိုက်ရိုက်ထုတ်လွှင့်မှု ဝဘ်ဆိုဒ်)

Mr.A 2D3D Live ဝဘ်ဆိုက်သည် ထိုင်းစတော့အိတ်ချိန်း (Thai SET) နှင့် ထိုင်းအစိုးရ ထီပေါက်စဉ် (3D Result) အချက်အလက်များကို တိုက်ရိုက်ကြည့်ရှုနိုင်သော ခေတ်မီ Full-stack ဝဘ်အက်ပလီကေးရှင်း ဖြစ်ပါသည်။

---

## အဓိက ပါဝင်သော လုပ်ဆောင်ချက်များ (Key Features)

1. **၂လုံးထီ တိုက်ရိုက်ကြည့်ရှု့ခြင်း (Live 2D Stream)**
   - API Endpoint: `https://api.thaistock2d.com/live`
   - Real-time `server_time`, `set`, `value`, `time`, `twod`, `date` ပြသခြင်း
   - မြန်မာဂဏန်း (၀၁၂၃၄၅၆၇၈၉) နှင့် အင်္ဂလိပ်ဂဏန်း (0123456789) ပြောင်းလဲကြည့်ရှုနိုင်မှု
   - တစ်နေ့တာ ၄ ကြိမ် ရလဒ်များ (11:00 AM, 12:01 PM, 03:00 PM, 04:30 PM)

2. **၃လုံးထီ ထီပေါက်စဉ် ရလဒ်များ (3D Results)**
   - API Endpoint: `https://api.2dboss.com/api/v2/v1/2dstock/threed-result`
   - `data[].result` (၃ ဒီဂရီ ပေါက်ဂဏန်း) နှင့် `data[].datetime` (ထွက်သည့်ရက်စွဲ/အချိန်)
   - လစဉ် ၁ ရက် နှင့် ၁၆ ရက် ထီပေါက်စဉ် ရလဒ်များ ရှာဖွေနိုင်မှု

3. **အဖွဲ့လိုက် စကားပြောခန်း (Community Live Chat)**
   - အသင်းဝင်များ ၂လုံး၊ ၃လုံး ခန့်မှန်းချက်များနှင့် အကြိုက်ဂဏန်းများ မျှဝေဆွေးနွေးနိုင်ခြင်း

4. **မြန်မာ့ရိုးရာ အိပ်မက် အဘိဓာန် နှင့် ဂဏန်းတွက်စက်**
   - အိပ်မက်အလိုက် ထွက်တတ်သော ၂လုံး၊ ၃လုံး ဂဏန်းများ
   - ထိပ်စီး၊ နောက်ပိတ် ဂဏန်းတွဲထုတ်စက်
   - ကံစမ်းဂဏန်း မွေးထုတ်စနစ် (Random Lucky Generator)

---

## GitHub Repo ဖန်တီးခြင်း နှင့် Deploy ပြုလုပ်နည်း

### ၁။ GitHub သို့ တင်ရန် (Git Push)

သင်၏ Terminal သို့မဟုတ် Command Prompt တွင် အောက်ပါ command များကို ရိုက်ထည့်ပါ:

```bash
# Git repository အသစ်စတင်ရန်
git init
git add .
git commit -m "Initial commit for Mr.A 2D3D Live"
git branch -M main

# သင်၏ GitHub repository URL သို့ ချိတ်ဆက်ပါ
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# GitHub ပေါ်သို့ တင်ပါ
git push -u origin main
```

### ၂။ Vercel တွင် Deploy ပြုလုပ်ခြင်း (အကြံပြုချက်)

1. [https://vercel.com](https://vercel.com) သို့ သွားပါ။
2. **Add New Project** ကို နှိပ်ပြီး သင်၏ GitHub Repo ကို ရွေးချယ်ပါ။
3. **Deploy** ကို နှိပ်ရုံဖြင့် `vercel.json` ဖြင့် အလိုအလျောက် Live Website လွှင့်တင်ပေးပါမည်။

### ၃။ Render / Railway တွင် Full-stack Deploy ပြုလုပ်ခြင်း

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: `3000` (သို့မဟုတ် အလိုအလျောက် သတ်မှတ်ပေးသော PORT)
