import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword_id = searchParams.get('keyword_id');

    if (!keyword_id) {
      return NextResponse.json(
        { error: 'keyword_id es requerido' },
        { status: 400 }
      );
    }

    // Simular estado de scraping
    const status = {
      keyword_id,
      estado: ['pendiente', 'en_progreso', 'completado'][Math.floor(Math.random() * 3)],
      progreso: Math.floor(Math.random() * 100),
      resultados_encontrados: Math.floor(Math.random() * 50),
      ultima_actualizacion: new Date().toISOString(),
    };

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error al obtener estado:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de scraping' },
      { status: 500 }
    );
  }
}
