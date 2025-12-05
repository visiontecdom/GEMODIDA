import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { actividades, formato } = await request.json();

    if (!actividades || actividades.length === 0) {
      return NextResponse.json(
        { error: 'No hay actividades para exportar' },
        { status: 400 }
      );
    }

    if (formato === 'csv') {
      const headers = Object.keys(actividades[0]);
      const csv = [
        headers.join(','),
        ...actividades.map((a: any) =>
          headers.map((h) => `"${String(a[h] || '').replace(/"/g, '""')}"`)
            .join(',')
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Disposition': 'attachment; filename="actividades.csv"',
          'Content-Type': 'text/csv;charset=utf-8;',
        },
      });
    }

    if (formato === 'json') {
      return new NextResponse(JSON.stringify(actividades, null, 2), {
        headers: {
          'Content-Disposition': 'attachment; filename="actividades.json"',
          'Content-Type': 'application/json',
        },
      });
    }

    return NextResponse.json(
      { error: 'Formato no soportado' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
