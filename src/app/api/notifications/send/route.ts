import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notificationService } from '@/lib/integrations/notifications';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, titulo, mensaje, tipo, canal } = await request.json();

    if (!usuario_id || !titulo || !mensaje) {
      return NextResponse.json(
        { error: 'usuario_id, titulo y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Obtener datos del usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('correo, telefono')
      .eq('id_usuario', usuario_id)
      .single();

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let enviado = false;
    const canales = canal ? [canal] : ['email', 'whatsapp'];

    for (const ch of canales) {
      if (ch === 'email' && usuario.correo) {
        const template = notificationService.generateEmailTemplate(titulo, mensaje);
        enviado = await notificationService.sendEmail({
          to: usuario.correo,
          subject: titulo,
          html: template,
        });
      } else if (ch === 'whatsapp' && usuario.telefono) {
        enviado = await notificationService.sendWhatsApp({
          to: usuario.telefono,
          message: `${titulo}\n\n${mensaje}`,
        });
      }
    }

    // Guardar notificación en BD
    await supabase.from('notificaciones').insert({
      usuario_id,
      titulo,
      mensaje,
      tipo: tipo || 'info',
      canal: canal || 'email',
      leida: false,
    });

    return NextResponse.json({
      success: enviado,
      message: enviado ? 'Notificación enviada exitosamente' : 'No se pudo enviar la notificación',
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    return NextResponse.json(
      { error: 'Error al enviar notificación' },
      { status: 500 }
    );
  }
}
