import { useState, useRef, useCallback, useEffect } from "react";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const FORMATS = {
  "9:16": { label: "Story / Reels", icon: "📱", w: 540, h: 960 },
  "4:5":  { label: "Portrait Feed", icon: "🖼",  w: 540, h: 675 },
  "1:1":  { label: "Square Feed",   icon: "⬜", w: 540, h: 540 },
};
const SLIDE_MS = 3500, FADE_MS = 500, FPS = 30;
const MAX_PW = 300, MAX_PH = 460;

const INDUSTRIES = [
  { key: "retail",   label: "👗 Retail",      sale: "Up to 50% off selected styles",       detail: "Free shipping on orders over $75. Limited quantities.",      cta: "Shop Now" },
  { key: "food",     label: "🍕 Food & Bev",   sale: "Weekend special — buy 2 get 1 free",  detail: "Dine-in and takeout. This weekend only.",                    cta: "Order Now" },
  { key: "beauty",   label: "💅 Beauty",       sale: "Buy 2 get 1 free on skincare",        detail: "Mix and match from our full range. In-store & online.",     cta: "Shop Beauty" },
  { key: "fitness",  label: "💪 Fitness",      sale: "First month free — join today",       detail: "All classes included. No contracts. Cancel anytime.",       cta: "Join Now" },
  { key: "tech",     label: "💻 Tech / SaaS",  sale: "20% off all annual plans this week",  detail: "Includes priority support and all premium features.",       cta: "Get Started" },
  { key: "home",     label: "🏠 Home & Decor", sale: "Furniture clearance — up to 40% off", detail: "Selected items only. While stocks last. Free delivery.",    cta: "Shop Now" },
  { key: "auto",     label: "🚗 Auto",         sale: "Free oil change with any service",    detail: "Book online. Valid this month only. All makes and models.", cta: "Book Now" },
  { key: "general",  label: "🏪 General",      sale: "Big sale — limited time only",        detail: "Don't miss our biggest offer of the year.",                 cta: "Learn More" },
];

const VIBES = [
  { key: "bold",    label: "⚡ Bold" },
  { key: "minimal", label: "◽ Minimal" },
  { key: "luxury",  label: "✦ Luxury" },
  { key: "playful", label: "🎉 Playful" },
  { key: "urgent",  label: "🔥 Urgent" },
  { key: "elegant", label: "🌿 Elegant" },
];
const VIBE_DESC = {
  bold:    "bold, high-energy, loud typography, strong contrast, impactful",
  minimal: "clean, minimal, breathing room, refined and modern",
  luxury:  "luxurious, premium, sophisticated, aspirational",
  playful: "fun, playful, energetic, vibrant, cheerful",
  urgent:  "urgent, FOMO-driven, flash sale pressure, countdown energy",
  elegant: "elegant, soft, organic, flowing, high-end feel",
};

/* ─────────────────────────────────────────────
   CSS
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@1&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#08080d;color:#ede9e0;overflow:hidden}

/* ── App shell ── */
.app{height:100vh;display:flex;flex-direction:column;background:#08080d}
.hdr{padding:14px 24px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;gap:10px;flex-shrink:0}
.hdr-logo{width:26px;height:26px;border-radius:7px;background:linear-gradient(135deg,#ff6b35,#e8369a);display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;font-weight:800}
.hdr-name{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:2.5px}
.hdr-pro{margin-left:6px;padding:2px 7px;border-radius:4px;background:linear-gradient(90deg,rgba(255,107,53,.2),rgba(232,54,154,.2));border:1px solid rgba(255,107,53,.3);font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:#ff9070}
.hdr-spacer{flex:1}
.hdr-saved{font-size:11px;color:rgba(255,255,255,.28);display:flex;align-items:center;gap:4px}
.saved-dot{width:5px;height:5px;border-radius:50%;background:#22c55e}

/* ── Layout ── */
.main{flex:1;display:grid;grid-template-columns:380px 1fr;overflow:hidden}

/* ── Left panel ── */
.left{display:flex;flex-direction:column;border-right:1px solid rgba(255,255,255,.06);overflow:hidden}
.tabs{display:flex;border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0}
.tab{flex:1;padding:11px 4px;font-size:11px;font-weight:500;color:rgba(255,255,255,.35);cursor:pointer;transition:all .15s;text-align:center;letter-spacing:.3px;border-bottom:2px solid transparent;background:none;border-top:none;border-left:none;border-right:none;font-family:'DM Sans',sans-serif}
.tab:hover{color:rgba(255,255,255,.6)}
.tab.on{color:#ff6b35;border-bottom-color:#ff6b35}
.tab-body{flex:1;overflow-y:auto;padding:20px 18px;display:flex;flex-direction:column;gap:16px}
.tab-body::-webkit-scrollbar{width:4px}
.tab-body::-webkit-scrollbar-track{background:transparent}
.tab-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}

/* ── Form elements ── */
.sec{display:flex;flex-direction:column;gap:10px}
.sec-label{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.25)}
.field{display:flex;flex-direction:column;gap:4px}
.field label{font-size:11px;font-weight:500;color:rgba(255,255,255,.4);letter-spacing:.3px}
.field input,.field textarea,.field select{
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);
  border-radius:8px;padding:9px 12px;color:#ede9e0;
  font-family:'DM Sans',sans-serif;font-size:13px;outline:none;
  transition:border-color .2s, background .2s;resize:none
}
.field input:focus,.field textarea:focus,.field select:focus{
  border-color:rgba(255,107,53,.45);background:rgba(255,107,53,.03)
}
.field select option{background:#14141f}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}

/* color pickers */
.clr-pair{display:flex;gap:8px}
.clr-box{flex:1;display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:8px;padding:7px 10px;cursor:pointer;transition:border-color .2s}
.clr-box:hover{border-color:rgba(255,255,255,.18)}
.swatch{width:28px;height:28px;border-radius:5px;border:1.5px solid rgba(255,255,255,.15);position:relative;overflow:hidden;flex-shrink:0}
.swatch input[type=color]{position:absolute;inset:-8px;width:calc(100%+16px);height:calc(100%+16px);border:none;padding:0;cursor:pointer;opacity:0}
.clr-info{display:flex;flex-direction:column;gap:1px}
.clr-role{font-size:9px;color:rgba(255,255,255,.28);letter-spacing:.5px;text-transform:uppercase}
.clr-val{font-size:11px;color:rgba(255,255,255,.5);font-family:monospace}

/* upload areas */
.upload-area{
  border:1.5px dashed rgba(255,255,255,.12);border-radius:9px;
  padding:16px;text-align:center;cursor:pointer;
  transition:all .2s;background:rgba(255,255,255,.02);position:relative;overflow:hidden
}
.upload-area:hover{border-color:rgba(255,107,53,.4);background:rgba(255,107,53,.03)}
.upload-area input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.upload-ico{font-size:22px;margin-bottom:6px}
.upload-label{font-size:11px;color:rgba(255,255,255,.35);line-height:1.5}
.upload-label b{color:rgba(255,255,255,.6)}
.upload-preview{width:100%;height:80px;object-fit:contain;border-radius:6px;margin-top:8px}
.upload-logo-preview{width:50px;height:50px;object-fit:contain;border-radius:6px;margin:6px auto 0;display:block}

/* industry grid */
.industry-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ind-btn{padding:7px 8px;border-radius:7px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);color:rgba(255,255,255,.45);font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;text-align:left}
.ind-btn:hover{border-color:rgba(255,107,53,.35);color:#ede9e0}
.ind-btn.on{border-color:#ff6b35;background:rgba(255,107,53,.08);color:#ff9070;font-weight:600}

/* vibes */
.vibe-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.vibe-btn{padding:8px 4px;border-radius:7px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);font-size:11px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;text-align:center}
.vibe-btn:hover{border-color:rgba(255,107,53,.35);color:#ede9e0}
.vibe-btn.on{border-color:#ff6b35;background:rgba(255,107,53,.08);color:#ff9070;font-weight:600}

/* format selector */
.fmt-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.fmt-btn{padding:9px 4px;border-radius:7px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.03);color:rgba(255,255,255,.4);font-size:10px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .15s;text-align:center;display:flex;flex-direction:column;gap:3px;align-items:center}
.fmt-btn:hover{border-color:rgba(255,107,53,.35);color:#ede9e0}
.fmt-btn.on{border-color:#ff6b35;background:rgba(255,107,53,.08);color:#ff9070;font-weight:600}
.fmt-ico{font-size:16px}
.fmt-label{font-size:9px;letter-spacing:.5px}

/* toggle */
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:8px}
.toggle-info{display:flex;flex-direction:column;gap:2px}
.toggle-title{font-size:12px;font-weight:500;color:rgba(255,255,255,.7)}
.toggle-sub{font-size:10px;color:rgba(255,255,255,.28)}
.toggle{width:36px;height:20px;border-radius:10px;background:rgba(255,255,255,.12);border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
.toggle.on{background:#ff6b35}
.toggle-thumb{width:14px;height:14px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.toggle.on .toggle-thumb{transform:translateX(16px)}

/* action buttons */
.action-area{padding:14px 18px;border-top:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;gap:8px;flex-shrink:0}
.btn{width:100%;padding:12px;border-radius:9px;border:none;font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:2px;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none !important;box-shadow:none !important}
.btn-primary{background:linear-gradient(135deg,#ff6b35,#e8369a);color:#fff}
.btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(255,107,53,.3)}
.btn-secondary{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.14);color:#ede9e0}
.btn-secondary:hover:not(:disabled){background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.25)}
.btn-green{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff}
.btn-green:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(34,197,94,.3)}
.btn-row{display:flex;gap:7px}
.btn-sm{flex:1;padding:9px 8px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.5);font-family:'DM Sans',sans-serif;font-size:11px;font-weight:500;cursor:pointer;transition:all .15s}
.btn-sm:hover{background:rgba(255,255,255,.07);color:#ede9e0;border-color:rgba(255,255,255,.18)}

/* spinner */
.spin{width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;display:inline-block;flex-shrink:0}
@keyframes sp{to{transform:rotate(360deg)}}

/* progress bar */
.prog-wrap{display:flex;flex-direction:column;gap:6px}
.prog-row{display:flex;justify-content:space-between;align-items:center}
.prog-label{font-size:11px;color:rgba(255,255,255,.4);display:flex;align-items:center;gap:6px}
.prog-pct{font-family:'Bebas Neue',sans-serif;font-size:14px;color:#ede9e0}
.prog-track{width:100%;height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden}
.prog-fill{height:100%;background:linear-gradient(90deg,#ff6b35,#e8369a);border-radius:2px;transition:width .08s linear}

/* status badges */
.status-ready{padding:10px 14px;border-radius:8px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.22);display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500;color:#4ade80}
.status-dot{width:6px;height:6px;border-radius:50%;background:#22c55e;box-shadow:0 0 6px #22c55e;flex-shrink:0}
.err{padding:10px 12px;border-radius:8px;border:1px solid rgba(255,80,80,.25);background:rgba(255,80,80,.07);font-size:11px;color:#ff9090;line-height:1.5}

/* ── Right panel ── */
.right{display:flex;flex-direction:column;align-items:center;gap:0;overflow-y:auto;background:radial-gradient(ellipse at 50% 10%,rgba(255,107,53,.05) 0%,transparent 55%)}
.right-top{display:flex;flex-direction:column;align-items:center;gap:16px;padding:28px 24px 16px;flex:1}

/* phone + plain frames */
.preview-wrap{display:flex;flex-direction:column;align-items:center;gap:12px}
.preview-label{font-size:10px;color:rgba(255,255,255,.25);letter-spacing:1.5px;text-transform:uppercase;display:flex;align-items:center;gap:6px}
.phone-frame{border-radius:34px;border:6px solid #1a1a28;box-shadow:0 0 0 1px rgba(255,255,255,.07),0 30px 60px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.05);overflow:hidden;position:relative;background:#000;flex-shrink:0}
.plain-frame{border-radius:14px;border:2px solid rgba(255,255,255,.1);box-shadow:0 20px 50px rgba(0,0,0,.5);overflow:hidden;position:relative;background:#000;flex-shrink:0}
.phone-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:58px;height:5px;border-radius:3px;background:#1a1a28;z-index:10}
.canvas-container{position:relative;overflow:hidden}
.canvas-container canvas{position:absolute;top:0;left:0;transform-origin:top left;display:block}
.canvas-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center}
.empty-ico{font-size:28px;opacity:.2}
.empty-txt{font-size:10px;color:rgba(255,255,255,.2);line-height:1.7;letter-spacing:.3px}

/* nav dots */
.nav-dots{display:flex;gap:6px;align-items:center}
.nav-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.18);cursor:pointer;transition:all .18s}
.nav-dot.on{background:#ff6b35;transform:scale(1.45)}
.nav-dot-label{font-size:10px;color:rgba(255,255,255,.28);margin-left:6px}

/* slide editor */
.slide-editor{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.editor-header{display:flex;align-items:center;justify-content:space-between}
.editor-title{font-size:11px;font-weight:600;color:rgba(255,255,255,.5);letter-spacing:.5px;text-transform:uppercase}
.editor-close{width:22px;height:22px;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.4);font-size:11px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
.editor-close:hover{background:rgba(255,255,255,.1);color:#ede9e0}
.editor-field{display:flex;flex-direction:column;gap:3px}
.editor-label{font-size:10px;color:rgba(255,255,255,.3);letter-spacing:.3px}
.editor-input{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:7px 10px;color:#ede9e0;font-family:'DM Sans',sans-serif;font-size:12px;outline:none;transition:border-color .2s;resize:none;width:100%}
.editor-input:focus{border-color:rgba(255,107,53,.4)}

/* video preview */
.video-preview{border-radius:10px;background:#000;display:block}

/* caption panel */
.caption-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px}
.caption-header{display:flex;align-items:center;justify-content:space-between}
.caption-title{font-size:11px;font-weight:600;color:rgba(255,255,255,.4);letter-spacing:.5px;text-transform:uppercase}
.caption-text{font-size:12px;color:rgba(255,255,255,.65);line-height:1.65;white-space:pre-wrap}
.copy-btn{padding:5px 12px;border-radius:6px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:rgba(255,255,255,.5);font-family:'DM Sans',sans-serif;font-size:10px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:all .15s}
.copy-btn:hover{background:rgba(255,255,255,.09);color:#ede9e0}

/* music info */
.music-info{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:6px}
.music-title{font-size:11px;font-weight:600;color:rgba(255,255,255,.45);display:flex;align-items:center;gap:5px}
.music-desc{font-size:10px;color:rgba(255,255,255,.28);line-height:1.6}
.music-sources{display:flex;flex-direction:column;gap:4px;margin-top:2px}
.music-src{font-size:10px;color:rgba(255,107,53,.7);text-decoration:none;display:flex;align-items:center;gap:4px}
.music-src:hover{color:#ff6b35}

/* divider */
.divider{height:1px;background:rgba(255,255,255,.06);margin:4px 0}

/* info note */
.note{font-size:10px;color:rgba(255,255,255,.22);line-height:1.6;padding:8px 10px;background:rgba(255,255,255,.02);border-radius:6px;border-left:2px solid rgba(255,107,53,.25)}
`;

/* ─────────────────────────────────────────────
   CANVAS UTILITIES
───────────────────────────────────────────── */
function makeGrad(ctx, w, h, angle, stops) {
  const rad = ((angle || 135) - 90) * Math.PI / 180;
  const len = Math.hypot(w, h) / 2;
  const cx = w / 2, cy = h / 2;
  const g = ctx.createLinearGradient(
    cx + Math.cos(rad + Math.PI) * len, cy + Math.sin(rad + Math.PI) * len,
    cx + Math.cos(rad) * len, cy + Math.sin(rad) * len
  );
  (stops || [{ offset: 0, color: "#333" }, { offset: 1, color: "#111" }])
    .forEach(s => g.addColorStop(s.offset, s.color));
  return g;
}

function wrapText(ctx, text, cx, y, maxW, lineH) {
  if (!text) return 0;
  const words = String(text).split(" ").filter(Boolean);
  const lines = []; let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineH));
  return lines.length * lineH;
}

function drawBadge(ctx, text, cx, cy, style) {
  if (!text) return;
  const fs = 30;
  ctx.font = `700 ${fs}px "DM Sans",sans-serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const tw = ctx.measureText(text.toUpperCase()).width;
  const ph = fs * 0.9, pv = fs * 0.5;
  const bw = tw + ph * 2, bh = pv * 2 + fs;
  ctx.fillStyle = style?.background || "rgba(255,255,255,.2)";
  ctx.beginPath(); ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, bh / 2); ctx.fill();
  ctx.fillStyle = style?.color || "#fff";
  ctx.fillText(text.toUpperCase(), cx, cy);
}

function drawProgressBars(ctx, w, n, elapsed) {
  const barH = 4, barY = 52, pad = 8;
  const totalW = w - 48;
  const bw = (totalW - pad * (n - 1)) / n;
  const sx = 24;
  const si = Math.min(Math.floor(elapsed / SLIDE_MS), n - 1);
  const se = elapsed - si * SLIDE_MS;
  for (let i = 0; i < n; i++) {
    const x = sx + i * (bw + pad);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath(); ctx.roundRect(x, barY, bw, barH, 2); ctx.fill();
    const fw = i < si ? bw : i === si ? Math.min((se / SLIDE_MS) * bw, bw) : 0;
    if (fw > 0) {
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.beginPath(); ctx.roundRect(x, barY, fw, barH, 2); ctx.fill();
    }
  }
}

function drawSlide(ctx, w, h, slide, opts = {}) {
  ctx.fillStyle = makeGrad(ctx, w, h, slide.gradientAngle, slide.gradientStops);
  ctx.fillRect(0, 0, w, h);

  const hasProduct = opts.productImg?.complete && opts.productImg?.naturalWidth > 0;
  if (hasProduct) {
    const imgH = h * 0.58;
    const img = opts.productImg;
    const ar = img.naturalWidth / img.naturalHeight;
    let iw = w, ih = w / ar;
    if (ih < imgH) { ih = imgH; iw = ih * ar; }
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w, imgH); ctx.clip();
    ctx.drawImage(img, (w - iw) / 2, 0, iw, ih);
    ctx.restore();
    const bg = slide.gradientStops?.[slide.gradientStops.length - 1]?.color || "#000";
    const fade = ctx.createLinearGradient(0, imgH * 0.42, 0, imgH);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, bg);
    ctx.fillStyle = fade; ctx.fillRect(0, 0, w, imgH);
    ctx.fillStyle = bg; ctx.fillRect(0, imgH - 2, w, h - imgH + 2);
  }

  const vig = ctx.createRadialGradient(w / 2, h * 0.45, h * 0.1, w / 2, h / 2, h * 0.82);
  vig.addColorStop(0, "rgba(0,0,0,0)"); vig.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vig; ctx.fillRect(0, 0, w, h);

  const tc = slide.textColor || "#fff";
  const cx = w / 2;

  if (!hasProduct) {
    ctx.font = `${Math.round(w * 0.26)}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(slide.emoji || "✨", cx, h * (h > w ? 0.36 : 0.28));
  }

  const hlSz = Math.round(w * (hasProduct ? 0.135 : 0.165));
  ctx.font = `700 ${hlSz}px "Bebas Neue",sans-serif`;
  ctx.fillStyle = tc;
  const hlY = hasProduct ? h * 0.62 : (h > w ? h * 0.52 : h * 0.42);
  const hlH = wrapText(ctx, (slide.headline || "").toUpperCase(), cx, hlY, w - 64, hlSz * 1.1);

  const subSz = Math.round(w * 0.057);
  ctx.font = `400 ${subSz}px "DM Sans",sans-serif`;
  ctx.fillStyle = `${tc}C8`;
  wrapText(ctx, slide.sub || "", cx, hlY + hlH + 16, w - 88, subSz * 1.48);

  if (slide.badge) {
    drawBadge(ctx, slide.badge, cx, h * (hasProduct ? 0.9 : (h > w ? 0.84 : 0.88)), slide.badgeStyle);
  }

  const hasLogo = opts.logoImg?.complete && opts.logoImg?.naturalWidth > 0;
  if (hasLogo) {
    const lsz = Math.round(w * 0.1);
    ctx.drawImage(opts.logoImg, w * 0.055, 76, lsz, lsz);
  } else if (opts.brandName) {
    ctx.font = `600 ${Math.round(w * 0.038)}px "DM Sans",sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,.72)";
    ctx.textAlign = "left"; ctx.textBaseline = "top";
    ctx.fillText(opts.brandName.toUpperCase(), w * 0.055, 78);
  }

  if (opts.watermark) {
    ctx.font = `500 ${Math.round(w * 0.032)}px "DM Sans",sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.textAlign = "right"; ctx.textBaseline = "bottom";
    ctx.fillText("Made with ReelCraft", w * 0.96, h * 0.975);
  }
}

function renderFrame(mainCtx, offCtx, w, h, slides, elapsed, opts) {
  const si = Math.min(Math.floor(elapsed / SLIDE_MS), slides.length - 1);
  const se = elapsed - si * SLIDE_MS;
  const alpha = Math.min(se / FADE_MS, 1);
  if (si === 0 || alpha >= 1) {
    drawSlide(mainCtx, w, h, slides[si], opts);
  } else {
    drawSlide(mainCtx, w, h, slides[si - 1], opts);
    drawSlide(offCtx, w, h, slides[si], opts);
    mainCtx.globalAlpha = alpha;
    mainCtx.drawImage(offCtx.canvas, 0, 0);
    mainCtx.globalAlpha = 1;
  }
  drawProgressBars(mainCtx, w, slides.length, elapsed);
}

/* ─────────────────────────────────────────────
   STORAGE HELPERS (localStorage, no window.storage)
───────────────────────────────────────────── */
const STORAGE_KEY = "reelcraft_brand_v1";

function loadBrandKit() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveBrandKit(kit) {
  try {
    const { logoImg, ...toSave } = kit;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {}
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function App() {
  const [brand, setBrand] = useState({ name: "", color1: "#ff6b35", color2: "#1a0a2e", logoBase64: null, logoImg: null });
  const [brandSaved, setBrandSaved] = useState(false);
  const [form, setForm] = useState({ sale: "", detail: "", cta: "Shop Now", industry: "" });
  const [style, setStyle] = useState({ vibe: "bold", format: "9:16", watermark: false });
  const [productBase64, setProductBase64] = useState(null);
  const productImgRef = useRef(null);
  const [slides, setSlides] = useState(null);
  const [previewSi, setPreviewSi] = useState(0);
  const [editingIdx, setEditingIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recPct, setRecPct] = useState(0);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMime, setVideoMime] = useState("video/webm");
  const [caption, setCaption] = useState(null);
  const [captionLoading, setCaptionLoading] = useState(false);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [tab, setTab] = useState("brand");
  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const offCtxRef = useRef(null);
  const animRef = useRef(null);

  const fmt = FORMATS[style.format];
  const previewScale = Math.min(MAX_PW / fmt.w, MAX_PH / fmt.h);
  const previewW = Math.round(fmt.w * previewScale);
  const previewH = Math.round(fmt.h * previewScale);
  const isStory = style.format === "9:16";

  /* ── Init offscreen canvas ── */
  useEffect(() => {
    const oc = document.createElement("canvas");
    oc.width = fmt.w; oc.height = fmt.h;
    offCtxRef.current = oc.getContext("2d");
  }, [fmt.w, fmt.h]);

  useEffect(() => {
    if (canvasRef.current) { canvasRef.current.width = fmt.w; canvasRef.current.height = fmt.h; }
    if (offCtxRef.current) { offCtxRef.current.canvas.width = fmt.w; offCtxRef.current.canvas.height = fmt.h; }
  }, [fmt.w, fmt.h]);

  /* ── Load brand kit from localStorage ── */
  useEffect(() => {
    const kit = loadBrandKit();
    if (kit) {
      if (kit.logoBase64) {
        const img = new Image();
        img.src = kit.logoBase64;
        kit.logoImg = img;
      }
      setBrand(kit);
    }
  }, []);

  const persistBrand = (kit) => {
    saveBrandKit(kit);
    setBrandSaved(true);
    setTimeout(() => setBrandSaved(false), 2000);
  };

  const setBK = (k, v) => {
    const next = { ...brand, [k]: v };
    setBrand(next);
    persistBrand(next);
  };

  const getOpts = useCallback(() => ({
    productImg: productImgRef.current,
    logoImg: brand.logoImg,
    brandName: brand.name,
    watermark: style.watermark,
  }), [brand.logoImg, brand.name, style.watermark]);

  const refreshPreview = useCallback(() => {
    if (!slides || recording) return;
    document.fonts.ready.then(() => {
      const canvas = canvasRef.current;
      if (!canvas || !offCtxRef.current) return;
      const ctx = canvas.getContext("2d");
      renderFrame(ctx, offCtxRef.current, fmt.w, fmt.h, slides,
        previewSi * SLIDE_MS + SLIDE_MS * 0.55, getOpts());
    });
  }, [slides, previewSi, fmt.w, fmt.h, getOpts, recording]);

  useEffect(() => { refreshPreview(); }, [refreshPreview]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      const img = new Image(); img.src = b64;
      img.onload = refreshPreview;
      const next = { ...brand, logoBase64: b64, logoImg: img };
      setBrand(next); persistBrand(next);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    const next = { ...brand, logoBase64: null, logoImg: null };
    setBrand(next); persistBrand(next);
  };

  const handleProductUpload = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setProductBase64(b64);
      const img = new Image(); img.src = b64;
      img.onload = refreshPreview;
      productImgRef.current = img;
    };
    reader.readAsDataURL(file);
  };

  const removeProduct = () => { setProductBase64(null); productImgRef.current = null; };

  const applyTemplate = (key) => {
    const t = INDUSTRIES.find(i => i.key === key);
    if (t) setForm(f => ({ ...f, sale: t.sale, detail: t.detail, cta: t.cta, industry: key }));
  };

  /* ── Generate slides via /api/generate ── */
  const generate = async () => {
    if (!form.sale.trim()) return;
    setLoading(true); setError(""); setSlides(null); setVideoUrl(null);
    setCaption(null); setPreviewSi(0); setEditingIdx(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "slides",
          brand,
          form: { ...form, hasProductImage: !!productBase64 },
          style,
        }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (!data.slides) throw new Error(data.error || "No slides returned");
      setSlides(data.slides);
    } catch (e) {
      setError(e.message || "Generation failed — please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (i, field, value) => {
    setSlides(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  /* ── Record video ── */
  const startRecording = useCallback(async () => {
    if (!slides || !canvasRef.current) return;
    setRecording(true); setVideoUrl(null); setRecPct(0); setError(""); setEditingIdx(null);

    await document.fonts.ready;

    const canvas = canvasRef.current;
    canvas.width = fmt.w; canvas.height = fmt.h;
    const ctx = canvas.getContext("2d");
    const offCtx = offCtxRef.current;
    const opts = getOpts();

    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
      .find(t => MediaRecorder.isTypeSupported(t)) || "video/webm";
    setVideoMime(mimeType);

    let stream, recorder;
    try {
      stream = canvas.captureStream(FPS);
      recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
    } catch {
      setError("Canvas recording not supported in this browser. Use Chrome or Edge.");
      setRecording(false); return;
    }

    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      setVideoUrl(URL.createObjectURL(new Blob(chunks, { type: mimeType })));
      setRecording(false); setRecPct(100);
    };

    recorder.start(100);
    const totalMs = slides.length * SLIDE_MS;
    let startTs = null;

    function frame(ts) {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      setRecPct(Math.min(Math.round((elapsed / totalMs) * 100), 99));
      renderFrame(ctx, offCtx, fmt.w, fmt.h, slides, Math.min(elapsed, totalMs), opts);
      if (elapsed < totalMs) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        renderFrame(ctx, offCtx, fmt.w, fmt.h, slides, totalMs - 100, opts);
        setTimeout(() => recorder.stop(), 400);
      }
    }
    animRef.current = requestAnimationFrame(frame);
  }, [slides, fmt.w, fmt.h, getOpts]);

  const download = () => {
    if (!videoUrl) return;
    const ext = videoMime.includes("mp4") ? "mp4" : "webm";
    const name = `${(brand.name || "promo").replace(/\s+/g, "-").toLowerCase()}-${style.format.replace(":", "x")}.${ext}`;
    const a = document.createElement("a"); a.href = videoUrl; a.download = name; a.click();
  };

  /* ── Generate caption via /api/generate ── */
  const generateCaption = async () => {
    if (!slides) return;
    setCaptionLoading(true); setCaption(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "caption", brand, form, style }),
      });
      const data = await res.json();
      setCaption(data.caption || "Failed to generate. Please try again.");
    } catch {
      setCaption("Failed to generate. Please try again.");
    } finally {
      setCaptionLoading(false);
    }
  };

  const copyCaption = () => {
    if (caption) {
      navigator.clipboard.writeText(caption);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 2000);
    }
  };

  const canGenerate = form.sale.trim() && !loading && !recording;
  const canRecord = !!slides && !loading && !recording;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        <header className="hdr">
          <div className="hdr-logo">▶</div>
          <span className="hdr-name">REELCRAFT</span>
          <span className="hdr-pro">PRO</span>
          <div className="hdr-spacer" />
          {brandSaved && <div className="hdr-saved"><div className="saved-dot" />Brand kit saved</div>}
        </header>

        <div className="main">

          {/* ═══════ LEFT PANEL ═══════ */}
          <div className="left">
            <div className="tabs">
              {[["brand","🏷 Brand"],["campaign","📢 Campaign"],["style","🎨 Style"]].map(([k,l]) => (
                <button key={k} className={`tab${tab===k?" on":""}`} onClick={() => setTab(k)}>{l}</button>
              ))}
            </div>

            <div className="tab-body">

              {tab === "brand" && (
                <>
                  <div className="sec">
                    <div className="sec-label">Identity</div>
                    <div className="field">
                      <label>Brand / Business name</label>
                      <input value={brand.name} onChange={e => setBK("name", e.target.value)} placeholder="e.g. Zara, Sunrise Café, Your Store" />
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Colors</div>
                    <div className="clr-pair">
                      <div className="clr-box">
                        <div className="swatch" style={{ background: brand.color1 }}>
                          <input type="color" value={brand.color1} onChange={e => setBK("color1", e.target.value)} />
                        </div>
                        <div className="clr-info">
                          <span className="clr-role">Accent</span>
                          <span className="clr-val">{brand.color1}</span>
                        </div>
                      </div>
                      <div className="clr-box">
                        <div className="swatch" style={{ background: brand.color2 }}>
                          <input type="color" value={brand.color2} onChange={e => setBK("color2", e.target.value)} />
                        </div>
                        <div className="clr-info">
                          <span className="clr-role">Background</span>
                          <span className="clr-val">{brand.color2}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Logo</div>
                    {brand.logoBase64 ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <img src={brand.logoBase64} className="upload-logo-preview" alt="logo" />
                        <button className="btn-sm" onClick={removeLogo}>Remove Logo</button>
                      </div>
                    ) : (
                      <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} />
                        <div className="upload-ico">🏷</div>
                        <div className="upload-label"><b>Click to upload logo</b><br />PNG or SVG with transparent background works best</div>
                      </div>
                    )}
                  </div>
                  <div className="note">
                    Your brand kit is saved automatically and loaded on future visits. Set it once — use it for every campaign.
                  </div>
                </>
              )}

              {tab === "campaign" && (
                <>
                  <div className="sec">
                    <div className="sec-label">Quick Templates</div>
                    <div className="industry-grid">
                      {INDUSTRIES.map(i => (
                        <button key={i.key} className={`ind-btn${form.industry===i.key?" on":""}`} onClick={() => applyTemplate(i.key)}>
                          {i.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divider" />
                  <div className="sec">
                    <div className="sec-label">Campaign Details</div>
                    <div className="field">
                      <label>Sale or offer *</label>
                      <input value={form.sale} onChange={e => setForm(f=>({...f,sale:e.target.value}))} placeholder="e.g. 50% off all summer styles this weekend" />
                    </div>
                    <div className="field">
                      <label>Extra details</label>
                      <textarea rows={2} value={form.detail} onChange={e => setForm(f=>({...f,detail:e.target.value}))} placeholder="e.g. Free shipping on orders over $75. Ends Sunday." />
                    </div>
                    <div className="field">
                      <label>Call to action</label>
                      <input value={form.cta} onChange={e => setForm(f=>({...f,cta:e.target.value}))} placeholder="Shop Now" />
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Product / Hero Image <span style={{color:"rgba(255,255,255,.25)",fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional)</span></div>
                    {productBase64 ? (
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        <img src={productBase64} className="upload-preview" alt="product" />
                        <button className="btn-sm" onClick={removeProduct}>Remove Image</button>
                      </div>
                    ) : (
                      <div className="upload-area">
                        <input type="file" accept="image/*" onChange={handleProductUpload} />
                        <div className="upload-ico">📸</div>
                        <div className="upload-label"><b>Upload product photo</b><br />Shows as background on each slide. JPEG or PNG.</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {tab === "style" && (
                <>
                  <div className="sec">
                    <div className="sec-label">Vibe</div>
                    <div className="vibe-grid">
                      {VIBES.map(v => (
                        <button key={v.key} className={`vibe-btn${style.vibe===v.key?" on":""}`} onClick={() => setStyle(s=>({...s,vibe:v.key}))}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Format</div>
                    <div className="fmt-row">
                      {Object.entries(FORMATS).map(([k, v]) => (
                        <button key={k} className={`fmt-btn${style.format===k?" on":""}`} onClick={() => setStyle(s=>({...s,format:k}))}>
                          <span className="fmt-ico">{v.icon}</span>
                          <span style={{fontSize:13,fontWeight:700}}>{k}</span>
                          <span className="fmt-label">{v.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Branding</div>
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <span className="toggle-title">Watermark</span>
                        <span className="toggle-sub">Add "Made with ReelCraft" to video</span>
                      </div>
                      <button className={`toggle${style.watermark?" on":""}`} onClick={() => setStyle(s=>({...s,watermark:!s.watermark}))}>
                        <div className="toggle-thumb" />
                      </button>
                    </div>
                  </div>
                  <div className="sec">
                    <div className="sec-label">Background Music</div>
                    <div className="music-info">
                      <div className="music-title">🎵 Add music after downloading</div>
                      <div className="music-desc">
                        Instagram, TikTok and CapCut all have built-in music libraries with thousands of trending tracks. Add yours there after downloading your video for the best results.
                      </div>
                      <div className="music-sources">
                        <span className="music-src">↗ Instagram: Add Audio when posting</span>
                        <span className="music-src">↗ TikTok: Sounds tab in editor</span>
                        <span className="music-src">↗ CapCut: Free royalty-free library</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>

            <div className="action-area">
              {error && <div className="err">⚠ {error}</div>}

              {!slides && !loading && (
                <button className="btn btn-primary" disabled={!canGenerate} onClick={generate}>
                  ✦ GENERATE VIDEO SLIDES
                </button>
              )}

              {loading && (
                <button className="btn btn-primary" disabled>
                  <span className="spin" /> GENERATING SLIDES…
                </button>
              )}

              {slides && !loading && !recording && !videoUrl && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <button className="btn btn-primary" onClick={() => { setSlides(null); setCaption(null); }}>
                    ✦ REGENERATE
                  </button>
                  <button className="btn btn-secondary" onClick={startRecording}>
                    ⏺ RENDER VIDEO ({(slides.length * SLIDE_MS / 1000).toFixed(0)}s · {fmt.w}×{fmt.h})
                  </button>
                </div>
              )}

              {recording && (
                <div className="prog-wrap">
                  <div className="prog-row">
                    <span className="prog-label"><span className="spin" />Rendering video…</span>
                    <span className="prog-pct">{recPct}%</span>
                  </div>
                  <div className="prog-track"><div className="prog-fill" style={{ width:`${recPct}%` }} /></div>
                </div>
              )}

              {videoUrl && !recording && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div className="status-ready">
                    <div className="status-dot" />
                    Ready · {(slides.length * SLIDE_MS / 1000).toFixed(0)}s · {fmt.w}×{fmt.h} · {videoMime.includes("mp4") ? "MP4" : "WebM"}
                  </div>
                  <button className="btn btn-green" onClick={download}>↓ DOWNLOAD VIDEO</button>
                  <div className="btn-row">
                    <button className="btn-sm" onClick={startRecording}>Re-render</button>
                    <button className="btn-sm" onClick={() => { setSlides(null); setVideoUrl(null); setCaption(null); }}>New video</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════ RIGHT PANEL ═══════ */}
          <div className="right">
            <div className="right-top">

              <div className="preview-label">
                {FORMATS[style.format].icon} {FORMATS[style.format].label} · {fmt.w}×{fmt.h}
              </div>

              <div className="preview-wrap">
                <div className={isStory ? "phone-frame" : "plain-frame"} style={{ width: previewW + (isStory ? 12 : 0), height: previewH + (isStory ? 12 : 0) }}>
                  {isStory && <div className="phone-notch" />}
                  <div className="canvas-container" style={{ width: previewW, height: previewH }}>
                    {!slides && !loading && (
                      <div className="canvas-empty" style={{ width: previewW, height: previewH, position:"absolute" }}>
                        <div className="empty-ico">📱</div>
                        <div className="empty-txt">Set up your brand & campaign,<br />then click Generate</div>
                      </div>
                    )}
                    {loading && (
                      <div className="canvas-empty" style={{ width: previewW, height: previewH, position:"absolute" }}>
                        <div style={{ fontSize:24 }}>✨</div>
                        <div className="empty-txt">Crafting your slides…</div>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      width={fmt.w}
                      height={fmt.h}
                      style={{ transform: `scale(${previewScale})`, display: slides ? "block" : "none" }}
                    />
                  </div>
                </div>

                {slides && !recording && (
                  <div className="nav-dots">
                    {slides.map((_, i) => (
                      <div
                        key={i}
                        className={`nav-dot${i === previewSi ? " on" : ""}`}
                        onClick={() => { setPreviewSi(i); setEditingIdx(editingIdx === i ? null : editingIdx); }}
                      />
                    ))}
                    <span className="nav-dot-label">
                      {editingIdx === null ? "Click dot to edit" : `Editing slide ${editingIdx + 1}`}
                    </span>
                  </div>
                )}

                {slides && editingIdx !== null && !recording && (
                  <div className="slide-editor" style={{ width: Math.max(previewW, 260) }}>
                    <div className="editor-header">
                      <span className="editor-title">Editing Slide {editingIdx + 1}</span>
                      <button className="editor-close" onClick={() => setEditingIdx(null)}>✕</button>
                    </div>
                    <div className="editor-field">
                      <span className="editor-label">Headline</span>
                      <input className="editor-input" value={slides[editingIdx].headline || ""} onChange={e => { updateSlide(editingIdx, "headline", e.target.value); setTimeout(refreshPreview, 50); }} />
                    </div>
                    <div className="editor-field">
                      <span className="editor-label">Body copy</span>
                      <textarea className="editor-input" rows={2} value={slides[editingIdx].sub || ""} onChange={e => { updateSlide(editingIdx, "sub", e.target.value); setTimeout(refreshPreview, 50); }} />
                    </div>
                    <div className="editor-field">
                      <span className="editor-label">Badge text (or leave blank)</span>
                      <input className="editor-input" value={slides[editingIdx].badge || ""} onChange={e => { updateSlide(editingIdx, "badge", e.target.value || null); setTimeout(refreshPreview, 50); }} placeholder="e.g. 50% OFF" />
                    </div>
                  </div>
                )}

                {slides && !recording && editingIdx === null && (
                  <div style={{ display:"flex", gap:6 }}>
                    {slides.map((_, i) => (
                      <button key={i} className="btn-sm" style={{ padding:"5px 10px", fontSize:10 }} onClick={() => { setPreviewSi(i); setEditingIdx(i); }}>
                        Edit {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {recording && (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, width: previewW }}>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.35)" }}>Recording canvas live…</div>
                  <div className="prog-track" style={{ width:"100%" }}>
                    <div className="prog-fill" style={{ width:`${recPct}%` }} />
                  </div>
                </div>
              )}

              {videoUrl && !recording && (
                <video src={videoUrl} controls loop playsInline className="video-preview" style={{ width: Math.min(previewW, 280) }} />
              )}

              {slides && !recording && (
                <div style={{ width: "100%", maxWidth: 400, padding: "0 0 8px" }}>
                  {!caption && !captionLoading && (
                    <button className="btn btn-secondary" style={{ width:"100%" }} onClick={generateCaption}>
                      ✍ GENERATE INSTAGRAM CAPTION
                    </button>
                  )}
                  {captionLoading && (
                    <button className="btn btn-secondary" disabled style={{ width:"100%" }}>
                      <span className="spin" /> Writing caption…
                    </button>
                  )}
                  {caption && !captionLoading && (
                    <div className="caption-box">
                      <div className="caption-header">
                        <span className="caption-title">📝 Caption + Hashtags</span>
                        <div style={{ display:"flex", gap:6 }}>
                          <button className="copy-btn" onClick={copyCaption}>{captionCopied ? "✓ Copied!" : "Copy"}</button>
                          <button className="copy-btn" onClick={generateCaption}>Redo</button>
                        </div>
                      </div>
                      <div className="caption-text">{caption}</div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
