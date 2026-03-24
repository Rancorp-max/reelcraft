# ReelCraft Pro — AI Instagram Video Generator

Generate branded Instagram Story, Reels, and Feed promo videos for small and medium businesses. Built with React + Vite + Vercel.

## Features

- **Brand Kit** — Save logo, colors, and business name. Persists across sessions.
- **Industry Templates** — One-click presets for Retail, Food & Bev, Beauty, Fitness, Tech, Home Decor, Auto, and General.
- **Product Image Upload** — Composites your product photo into every slide as a background with gradient fade.
- **AI Slide Generation** — 5 custom slides with headline, body copy, badges, and gradient colors.
- **Slide Editor** — Click any slide to edit headline, copy, and badge text live.
- **3 Formats** — 9:16 Stories/Reels, 4:5 Portrait Feed, 1:1 Square Feed.
- **6 Vibes** — Bold, Minimal, Luxury, Playful, Urgent, Elegant.
- **Real Video Export** — Canvas + MediaRecorder renders an actual .webm video file at 540px wide, 8Mbps.
- **Caption Generator** — AI writes Instagram captions + 15-18 hashtags for your post.
- **Watermark Toggle** — Optional "Made with ReelCraft" branding.

No external video API needed. All rendering happens in the browser.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env.local
# Edit .env.local → ANTHROPIC_API_KEY=sk-ant-...

# 3. Start the dev server + API
npx vercel dev
# Opens at http://localhost:3000
```

If you don't have the Vercel CLI, install it first:
```bash
npm i -g vercel
vercel login
```

---

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "ReelCraft Pro v2"
git remote add origin https://github.com/YOUR_USERNAME/reelcraft.git
git push -u origin main

# 2. Import on Vercel
# vercel.com → Add New Project → Import GitHub repo
# Vite is auto-detected (build: vite build, output: dist)

# 3. Add environment variable
# Vercel Project → Settings → Environment Variables
# ANTHROPIC_API_KEY = sk-ant-...
# → Redeploy
```

---

## File Structure

```
reelcraft/
├── src/
│   ├── App.jsx          ← Full React UI + canvas engine
│   └── main.jsx
├── api/
│   └── generate.js      ← Vercel serverless function (slides + captions)
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
└── .gitignore
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Video rendering | Canvas API + MediaRecorder |
| AI | Anthropic Claude Sonnet |
| API route | Vercel Serverless Function |
| Persistence | Browser localStorage (via storage API) |
| Hosting | Vercel (free tier) |

## Video Output

- **Resolution:** 540×960 (9:16) / 540×675 (4:5) / 540×540 (1:1)
- **Duration:** ~17.5s (5 slides × 3.5s)
- **Format:** WebM VP9 — uploads natively to Instagram, TikTok, YouTube Shorts
- **Bitrate:** 8 Mbps (above Instagram's recommended quality)

> Need MP4? Drag the .webm into HandBrake, CloudConvert, or CapCut.

## Notes

- Canvas recording requires **Chrome or Edge** (Safari doesn't support captureStream)
- Brand kit is saved to browser storage — logo images are stored as base64
- Each generation costs ~$0.003 in Anthropic API usage
