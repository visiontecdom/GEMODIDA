import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { nombre, fuente, url, palabras_clave, frecuencia } = await request.json();

    if (!nombre || !fuente || !palabras_clave || palabras_clave.length === 0) {
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
      .from('scraping_config')
      .insert([
        {
          nombre,
          fuente,
          url,
          palabras_clave: palabras_clave,
          frecuencia: frecuencia || 'diaria',
          activo: true,
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
