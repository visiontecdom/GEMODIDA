import { NextRequest, NextResponse } from 'next/server';
import { PromocioneService } from '@/services/PromocioneService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const service = new PromocioneService();
    
    await service.validarReglas(data);
    const result = await service.crearPromocion(data);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
