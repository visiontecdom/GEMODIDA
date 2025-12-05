import { NextRequest, NextResponse } from 'next/server';
import { PromocioneService } from '@/services/PromocioneService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filtros: Record<string, any> = {};
    
    if (searchParams.get('estado')) filtros.estado = searchParams.get('estado');
    if (searchParams.get('tipo')) filtros.tipo = searchParams.get('tipo');
    
    const service = new PromocioneService();
    const result = await service.listarPromociones(filtros);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
