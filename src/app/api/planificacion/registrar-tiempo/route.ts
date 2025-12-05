import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { tareaId, horas, descripcion } = await request.json();

    if (!tareaId || !horas) {
      return NextResponse.json(
        { error: 'Parámetros requeridos' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase
      .from('registro_tiempo')
      .insert([
        {
          tarea_id: tareaId,
          horas,
          descripcion,
          fecha: new Date().toISOString().split('T')[0],
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
