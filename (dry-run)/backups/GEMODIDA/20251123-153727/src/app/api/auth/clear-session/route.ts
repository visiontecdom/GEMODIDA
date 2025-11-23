import { NextResponse } from 'next/server';

export async function POST() {
  const cookie = `GEMODIDA-auth-token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', cookie);
  return res;
}
