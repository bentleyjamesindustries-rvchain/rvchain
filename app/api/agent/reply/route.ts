import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { listingTitle?: string; buyerMessage?: string };
    const listingTitle = String(body.listingTitle ?? "").trim();
    const buyerMessage = String(body.buyerMessage ?? "").trim();
    if (!buyerMessage) {
      return NextResponse.json({ error: "Paste what the buyer said." }, { status: 400 });
    }
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI is not available in this environment" }, { status: 400 });
    }
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL ?? "grok-4.5",
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You draft a short private-party reply for an RV Chain seller. Powersports parts only. Plain sentences. No emoji. No hype. Do not invent a price, shipping, or a promise the seller did not make. If the buyer asks for a lower price, say the seller will answer that. 40 to 80 words.",
          },
          {
            role: "user",
            content: `Listing: ${listingTitle || "a powersports part"}\nBuyer said:\n${buyerMessage}`,
          },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json({ error: `xAI API error ${res.status}${detail ? `: ${detail.slice(0, 160)}` : ""}` }, { status: 400 });
    }
    const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) return NextResponse.json({ error: "Empty reply" }, { status: 400 });
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "The Clerk failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
