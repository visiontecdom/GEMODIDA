import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient, TableRow } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { tipo, parametros, programado } = await request.json();
    const supabase = createServerComponentClient();

    if (programado) {
      const { data, error } = await supabase
        .from('configuraciones_sistema')
        .upsert({
          clave: `reporte_programado_${tipo}`,
          valor: JSON.stringify({
            tipo,
            parametros,
            frecuencia: parametros.frecuencia,
            destinatarios: parametros.destinatarios,
            canal_envio: parametros.canal_envio || 'email',
            activo: true
          }),
          tipo: 'json',
          descripcion: `Reporte programado: ${tipo}`
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Reporte programado exitosamente'
      });
    }

    let data;
    switch (tipo) {
      case 'actividades':
        const { data: actividades } = await supabase
          .from('actividad_matriz')
          .select(`
            *,
            sucursales(nombre_sucursal),
            usuarios(nombre_completo)
          `)
          .gte('fecha', parametros.fechaInicio)
          .lte('fecha', parametros.fechaFin);
        const typedActividades: any[] = (actividades as any[]) || []; // Temporarily cast to any[] due to missing type in database.types.ts
        data = typedActividades;
        break;
      
      case 'encuestas':
        const { data: encuestas } = await supabase
          .from('encuesta_uss')
          .select('*')
          .gte('fecha', parametros.fechaInicio)
          .lte('fecha', parametros.fechaFin);
        const typedEncuestas: any[] = (encuestas as any[]) || []; // Temporarily cast to any[] due to missing type in database.types.ts
        data = typedEncuestas;
        break;

      case 'scraping':
        const { data: resultados } = await supabase
          .from('resultados')
          .select(`
            *,
            palabras_clave(palabra),
            fuentes(nombre)
          `)
          .gte('fecha_extraccion', parametros.fechaInicio)
          .lte('fecha_extraccion', parametros.fechaFin);
        data = resultados;
        break;
      
      default:
        throw new Error('Tipo de reporte no válido');
    }

    const reporteId = `reporte_${tipo}_${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      reporteId,
      data,
      total: data?.length || 0,
      generado_en: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al generar reporte', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ejecutar = searchParams.get('ejecutar');
    const supabase = createServerComponentClient();
    
    if (ejecutar === 'programados') {
      const { data: configuraciones } = await supabase
        .from('configuraciones_sistema')
        .select('*')
        .like('clave', 'reporte_programado_%');

      return NextResponse.json({
        success: true,
        reportes_programados: configuraciones || []
      });
    }

    const { data: reportes } = await supabase
      .from('reportes')
      .select('*')
      .order('creado_en', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      reportes: reportes || []
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error en reportes' },
      { status: 500 }
    );
  }
}
