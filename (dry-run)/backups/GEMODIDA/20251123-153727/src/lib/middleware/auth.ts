import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { diagLog } from '@/lib/diagnostic';

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  diagLog('info', 'verifyAuth called', 'Middleware', { authHeader });

  if (!authHeader?.startsWith('Bearer ')) {
    diagLog('warn', 'Missing or invalid auth header', 'Middleware', { authHeader });
    return { error: 'No autorizado', status: 401 };
  }

  const token = authHeader.slice(7);
  diagLog('info', 'Extracted token', 'Middleware', { token });

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.auth.getUser(token);
    diagLog('info', 'Supabase auth.getUser result', 'Middleware', { data, error });

    if (error || !data.user) {
      diagLog('warn', 'Invalid token or no user found', 'Middleware', { error });
      return { error: 'Token inválido', status: 401 };
    }

    return { user: data.user, status: 200 };
  } catch (error) {
    diagLog('error', 'Authentication error', 'Middleware', { error });
    return { error: 'Error de autenticación', status: 500 };
  }
}

export function withAuth(handler: Function) {
  return async (request: NextRequest) => {
    diagLog('info', 'withAuth middleware invoked', 'Middleware', { url: request.url });
    const auth = await verifyAuth(request);

    if (auth.error) {
      diagLog('warn', 'Authorization failed', 'Middleware', { error: auth.error });
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    diagLog('info', 'Authorization succeeded', 'Middleware', { user: auth.user });
    return handler(request, auth.user);
  };
}
