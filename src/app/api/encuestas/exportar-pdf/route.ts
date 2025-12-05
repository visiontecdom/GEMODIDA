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

    // Crear contenido HTML simple que se puede convertir a PDF
    const headers = Object.keys(resultados[0]);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resultados Encuesta ${id_diseno}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
        </style>
      </head>
      <body>
        <h1>Resultados de Encuesta</h1>
        <table>
          <thead>
            <tr>
              ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${resultados.map((row: any) => `
              <tr>
                ${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    
    return new NextResponse(blob, {
      headers: {
        'Content-Disposition': `attachment; filename="resultados_${id_diseno}.html"`,
        'Content-Type': 'text/html;charset=utf-8;',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
