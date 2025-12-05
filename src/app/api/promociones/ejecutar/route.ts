import { NextRequest, NextResponse } from 'next/server';
import { PromocioneService } from '@/services/PromocioneService';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    const service = new PromocioneService();
    const result = await service.ejecutarPromocion(id);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
