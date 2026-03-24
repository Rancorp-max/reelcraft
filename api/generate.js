const VIBE_DESC = {
  bold:    "bold, high-energy, loud typography, strong contrast, impactful",
  minimal: "clean, minimal, breathing room, refined and modern",
  luxury:  "luxurious, premium, sophisticated, aspirational",
  playful: "fun, playful, energetic, vibrant, cheerful",
  urgent:  "urgent, FOMO-driven, flash sale pressure, countdown energy",
  elegant: "elegant, soft, organic, flowing, high-end feel",
};

const FORMATS = {
  "9:16": { w: 540, h: 960 },
  "4:5":  { w: 540, h: 675 },
  "1:1":  { w: 540, h: 540 },
};

function buildSlidesPrompt({ brand, form, style }) {
  const fmt = FORMATS[style.format] || FORMATS["9:16"];
  return `Create a 5-slide Instagram Story promo. Return ONLY a JSON array, no markdown, no explanation.

Brand: ${brand.name || "the brand"}
Sale/Offer: ${form.sale}
Extra detail: ${form.detail || "none"}
CTA: ${form.cta}
Vibe: ${VIBE_DESC[style.vibe] || VIBE_DESC.bold}
Canvas format: ${style.format} (${fmt.w}x${fmt.h})
Primary/accent color: ${brand.color1}
Background/base color: ${brand.color2}
Has product image: ${form.hasProductImage || false}

Each of the 5 slide objects must have exactly:
- "emoji": 1 relevant emoji string
- "headline": 2-5 words, punchy, uppercase-friendly
- "sub": 1-2 short engaging sentences
- "badge": short pill text like "50% OFF" or null
- "gradientAngle": number 0-360, vary per slide
- "gradientStops": 2-3 objects [{offset:0-1, color:"#hex"}]
- "textColor": light hex like "#ffffff"
- "badgeStyle": {background:"hex or rgba", color:"#hex"} or null

Slide 1=attention opener, 2-4=offer details, 5=CTA closer.`;
}

function buildCaptionPrompt({ brand, form, style }) {
  return `Write an Instagram caption for this promo post.

Brand: ${brand.name || "the brand"}
Offer: ${form.sale}
Details: ${form.detail || "none"}
CTA: ${form.cta}
Vibe: ${style.vibe}
Industry: ${form.industry || "general"}

Write 2-3 engaging sentences, include the CTA, leave a blank line, then 15-18 hashtags on one line. No quotes or explanation.`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, brand, form, style } = req.body || {};

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set in environment variables." });
  }

  const prompt = action === "caption"
    ? buildCaptionPrompt({ brand, form, style })
    : buildSlidesPrompt({ brand, form, style });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: action === "caption" ? 350 : 1400,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Anthropic error:", txt);
      return res.status(502).json({ error: "AI request failed: " + txt });
    }

    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "";

    if (action === "caption") {
      return res.status(200).json({ caption: raw.trim() });
    }

    const slides = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return res.status(200).json({ slides });

  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
