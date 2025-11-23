import { NextResponse } from 'next/server';

function serializeCookie(name: string, value: string, opts: { path?: string; httpOnly?: boolean; sameSite?: 'Lax'|'Strict'|'None'; maxAge?: number } = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? '/'}'`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (typeof opts.maxAge === 'number') parts.push(`Max-Age=${Math.round(opts.maxAge)}`);
  return parts.join('; ');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = body?.session ?? null;

    if (!session) {
      return NextResponse.json({ ok: false, error: 'No session provided' }, { status: 400 });
    }

    // Determine maxAge from session.expires_at (seconds) if available
    let maxAge = 60 * 60 * 24 * 7; // default 7 days
    if (session.expires_at) {
      const nowSec = Math.floor(Date.now() / 1000);
      const expiresIn = Number(session.expires_at) - nowSec;
      if (!Number.isNaN(expiresIn) && expiresIn > 0) maxAge = expiresIn;
    }

    const cookieValue = JSON.stringify(session);
    const cookie = serializeCookie('GEMODIDA-auth-token', cookieValue, { path: '/', httpOnly: true, sameSite: 'Lax', maxAge });

    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', cookie);
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
