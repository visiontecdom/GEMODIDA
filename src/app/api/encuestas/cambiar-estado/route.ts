import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { id_diseno, estado_nuevo, razon } = await request.json();

    if (!id_diseno || !estado_nuevo) {
      return NextResponse.json(
        { success: false, message: 'Parámetros requeridos faltantes' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase.rpc('cambiar_estado_encuesta', {
      p_id_diseno: id_diseno,
      p_estado_nuevo: estado_nuevo,
      p_razon: razon || null,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
