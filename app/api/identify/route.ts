import { NextResponse } from "next/server";
import { runIdentifyPart } from "@/lib/identify-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runIdentifyPart(body);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ identification: result.identification });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Identify failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
