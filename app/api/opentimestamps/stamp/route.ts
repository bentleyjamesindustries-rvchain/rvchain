import { NextRequest, NextResponse } from 'next/server';

const CALENDAR_SERVERS = [
  'https://alice.btc.calendar.opentimestamps.org/digest',
  'https://bob.btc.calendar.opentimestamps.org/digest',
  'https://finney.calendar.eternitywall.com/digest',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const hashHex = (body.hash as string)?.toLowerCase();

    if (!hashHex || !/^[a-f0-9]{64}$/.test(hashHex)) {
      return NextResponse.json({ error: 'Invalid SHA256 hash (64 hex chars required).' }, { status: 400 });
    }

    // hashHex is the SHA256 of spot data — submit raw 32-byte digest to OpenTimestamps
    const digestBuffer = Buffer.from(hashHex, 'hex');

    let otsBuffer: Buffer | null = null;
    let calendarUsed: string | null = null;

    for (const url of CALENDAR_SERVERS) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: digestBuffer,
        });
        if (res.ok) {
          otsBuffer = Buffer.from(await res.arrayBuffer());
          calendarUsed = url;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!otsBuffer) {
      return NextResponse.json({
        success: false,
        hash: hashHex,
        message: 'Calendar servers unavailable. Hash recorded; retry timestamp later.',
        proofUrl: `https://ots.summa.one/?hash=${hashHex}`,
      });
    }

    return NextResponse.json({
      success: true,
      hash: hashHex,
      otsBase64: otsBuffer.toString('base64'),
      calendarUsed,
      proofUrl: `https://ots.summa.one/?hash=${hashHex}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Timestamp failed' },
      { status: 500 }
    );
  }
}