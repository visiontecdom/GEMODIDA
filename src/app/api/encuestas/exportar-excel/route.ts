import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { id_diseno, resultados } = await request.json();

    if (!resultados || resultados.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No hay resultados para exportar' },
        { status: 400 }
      );
    }

    const headers = Object.keys(resultados[0]);
    const csvContent = [
      headers.join(','),
      ...resultados.map((row: any) =>
        headers.map((header) => `"${String(row[header] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="resultados_${id_diseno}.csv"`,
        'Content-Type': 'text/csv;charset=utf-8;',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
