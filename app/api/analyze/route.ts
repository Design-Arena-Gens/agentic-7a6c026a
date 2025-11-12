import { NextRequest, NextResponse } from 'next/server';
import { analyze } from '@/lib/analyzer';

export async function POST(req: NextRequest) {
  try {
    const { raw } = await req.json();
    if (!raw || typeof raw !== 'string' || raw.trim().length < 10) {
      return NextResponse.json({ error: 'Provide raw email text' }, { status: 400 });
    }
    const result = analyze(raw);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
