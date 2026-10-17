import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function readJson(text: string): { allowed?: boolean; reason?: string } {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < start) return {};
  return JSON.parse(text.slice(start, end + 1)) as { allowed?: boolean; reason?: string };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageDataUrl?: string; text?: string };
    const text = String(body.text ?? "").trim();
    const image = String(body.imageDataUrl ?? "");
    if (!text && !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "Nothing to review." }, { status: 400 });
    }
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Upload review is not available." }, { status: 400 });
    }

    const userContent: unknown[] = [];
    if (image.startsWith("data:image/")) {
      userContent.push({ type: "image_url", image_url: { url: image, detail: "low" } });
    }
    userContent.push({
      type: "text",
      text: text || "Review this photo for an RV Chain powersports parts listing.",
    });

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL ?? "grok-4.5",
        temperature: 0,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "You review uploads for RV Chain, a powersports parts board. Allow ordinary parts, dirt, crash damage, racecars, prices, and private-party wording. Block sexual content, nudity, anything sexual involving a minor, hate, threats, illegal drugs, weapons trafficking, and scam or stolen-goods pitches. A dirty used part is allowed. Return only JSON: {\"allowed\":true,\"reason\":\"\"} or {\"allowed\":false,\"reason\":\"short plain reason\"}.",
          },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Upload review failed. Nothing was posted." }, { status: 400 });
    }
    const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const parsed = readJson(raw);
    if (parsed.allowed === true) return NextResponse.json({ allowed: true });
    return NextResponse.json(
      { allowed: false, reason: parsed.reason || "This upload is not allowed on the board." },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ error: "Upload review failed. Nothing was posted." }, { status: 400 });
  }
}
