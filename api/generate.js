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
  return `Create a 5-slide Instagram promo video. Return ONLY a JSON array, no markdown, no explanation.

Brand: ${brand.name || "the brand"}
Sale/Offer: ${form.sale}
Extra detail: ${form.detail || "none"}
CTA: ${form.cta}
Vibe: ${VIBE_DESC[style.vibe] || VIBE_DESC.bold}
Canvas format: ${style.format} (${fmt.w}×${fmt.h})
Primary/accent color: ${brand.color1}
Background/base color: ${brand.color2}
Has product image: ${form.hasProductImage || false}

Each of the 5 slide objects must have exactly:
- "emoji": 1 relevant emoji string
- "headline": 2-5 words, punchy, uppercase-friendly
- "sub": 1-2 short engaging sentences
- "badge": short pill text like "50% OFF" / "FREE SHIPPING" / "LIMITED TIME" or null
- "gradientAngle": number 0-360, vary meaningfully per slide
- "gradientStops": 2-3 objects [{offset:0-1, color:"#hex"}], use brand colors creatively, vary per slide
- "textColor": light hex color that contrasts on the background
- "badgeStyle": {background: "hex or rgba string", color: "#hex"} or null

Slide arc: 1=bold attention grabber, 2=main offer, 3=key benefit or urgency, 4=secondary benefit, 5=clear CTA closer.`;
}

function buildCaptionPrompt({ brand, form, style }) {
  return `Write an Instagram caption for this promo post.

Brand: ${brand.name || "the brand"}
Offer: ${form.sale}
Details: ${form.detail || "none"}
CTA: ${form.cta}
Vibe: ${style.vibe}
Industry: ${form.industry || "general"}

Instructions:
- Write 2-3 natural, engaging sentences. Not overly salesy.
- Include the CTA naturally
- Leave one blank line after the copy
- Then write 15-18 relevant hashtags on a single line
- No quotes around the output, no explanations, just the caption + hashtags`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, brand, form, style } = req.body || {};

  if (!action || !["slides", "caption"].includes(action)) {
    return res.status(400).json({ error: "Invalid action. Use 'slides' or 'caption'." });
  }

  if (action === "slides" && !form?.sale?.trim()) {
    return res.status(400).json({ error: "Sale field is required." });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on this server." });
  }

  const prompt = action === "slides"
    ? buildSlidesPrompt({ brand, form, style })
    : buildCaptionPrompt({ brand, form, style });

  const maxTokens = action === "slides" ? 1400 : 350;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      console.error("Anthropic error:", txt);
      return res.status(502).json({ error: "AI generation failed. Please try again." });
    }

    const data = await response.json();
    const raw = data.content?.find(b => b.type === "text")?.text || "";

    if (action === "slides") {
      let slides;
      try {
        slides = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        console.error("Parse error:", raw);
        return res.status(500).json({ error: "Could not parse AI response. Please try again." });
      }
      return res.status(200).json({ slides });
    } else {
      return res.status(200).json({ caption: raw.trim() });
    }
  } catch (err) {
    console.error("Handler error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
