import { NextRequest, NextResponse } from 'next/server';
import { NotificacionService } from '@/services/NotificacionService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const service = new NotificacionService();
    const result = await service.enviarNotificacion(data);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
