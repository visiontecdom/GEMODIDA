import { NextRequest, NextResponse } from 'next/server';
import { scrapingService } from '@/services/ScrapingService';

export async function POST(request: NextRequest) {
  try {
    const { configId } = await request.json();

    if (!configId) {
      return NextResponse.json(
        { error: 'configId requerido' },
        { status: 400 }
      );
    }

    const resultados = await scrapingService.ejecutarScraping(configId);

    return NextResponse.json({
      success: true,
      resultados,
      cantidad: resultados.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
