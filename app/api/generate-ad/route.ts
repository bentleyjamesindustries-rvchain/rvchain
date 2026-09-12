import { NextResponse } from "next/server";
import { runGenerateAd } from "@/lib/identify-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runGenerateAd(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ad: result.ad });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not write the listing";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
