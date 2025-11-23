import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { table, format, filters } = await request.json();

    if (!table || !format) {
      return NextResponse.json(
        { error: 'table y format son requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos de la tabla
    let query = supabase.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No hay datos para exportar' },
        { status: 404 }
      );
    }

    let content: string;
    let mimeType: string;
    let filename: string;

    if (format === 'csv') {
      content = Papa.unparse(data);
      mimeType = 'text/csv';
      filename = `${table}-${Date.now()}.csv`;
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename = `${table}-${Date.now()}.json`;
    } else {
      return NextResponse.json(
        { error: 'Formato no soportado' },
        { status: 400 }
      );
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error al exportar datos:', error);
    return NextResponse.json(
      { error: 'Error al exportar datos' },
      { status: 500 }
    );
  }
}
