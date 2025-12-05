import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, fecha_inicio, fecha_fin, presupuesto } = await request.json();

    if (!nombre || !fecha_inicio || !fecha_fin) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase
      .from('planificaciones')
      .insert([
        {
          nombre,
          descripcion,
          fecha_inicio,
          fecha_fin,
          presupuesto,
          estado: 'planificada',
          progreso: 0,
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
