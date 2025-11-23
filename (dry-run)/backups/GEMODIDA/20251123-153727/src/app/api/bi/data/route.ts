import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient, TableRow } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'general';
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');
    const sucursalId = searchParams.get('sucursal_id');
    
    const supabase = createServerComponentClient();
    
    let data: any = {}; // Use 'any' for now, can refine later if needed
    
    switch (tipo) {
      case 'actividades':
        const { data: actividades } = await supabase
          .from('actividad_matriz')
          .select(`
            *,
            sucursales(nombre_sucursal, provincia),
            usuarios(nombre_completo)
          `);
        
        const typedActividades: any[] = (actividades as any[]) || [];

        data = {
          actividades: typedActividades,
          resumen: {
            total: typedActividades.length || 0,
            completadas: typedActividades.filter((a: any) => a.estado_actividad === 'completada').length || 0,
            en_progreso: typedActividades.filter((a: any) => a.estado_actividad === 'en_progreso').length || 0
          }
        };
        break;
        
      case 'encuestas':
        const { data: encuestasUSS } = await supabase
          .from('encuesta_uss')
          .select('*')
          .gte('fecha', fechaInicio || '2024-01-01')
          .lte('fecha', fechaFin || new Date().toISOString().split('T')[0]);
          
        const { data: encuestasPSS } = await supabase
          .from('encuesta_pss')
          .select('*')
          .gte('fecha', fechaInicio || '2024-01-01')
          .lte('fecha', fechaFin || new Date().toISOString().split('T')[0]);
        
        const typedEncuestasUSS: any[] = (encuestasUSS as any[]) || [];
        const typedEncuestasPSS: any[] = (encuestasPSS as any[]) || [];

        data = {
          encuestas_uss: typedEncuestasUSS,
          encuestas_pss: typedEncuestasPSS,
          resumen: {
            total_uss: typedEncuestasUSS.length || 0,
            total_pss: typedEncuestasPSS.length || 0
          }
        };
        break;
        
      case 'scraping':
        const { data: resultados } = await supabase
          .from('resultados')
          .select(`
            *,
            palabras_clave(palabra),
            fuentes(nombre, tipo_fuente)
          `);
        
        const typedResultados: any[] = (resultados as any[]) || [];

        data = {
          resultados: typedResultados,
          resumen: {
            total: typedResultados.length || 0,
            positivos: typedResultados.filter((r: any) => r.sentimiento === 'positivo').length || 0,
            negativos: typedResultados.filter((r: any) => r.sentimiento === 'negativo').length || 0
          }
        };
        break;
        
      default:
        const { data: usuarios } = await supabase
          .from('usuarios')
          .select('id_usuario, nombre_completo, correo, esta_activo');
        const { data: sucursales } = await supabase
          .from('sucursales')
          .select('*')
          .eq('estado', 'Activo');
        
        const typedUsuarios: any[] = (usuarios as any[]) || [];
        const typedSucursales: any[] = (sucursales as any[]) || [];

        data = {
          usuarios: typedUsuarios,
          sucursales: typedSucursales,
          timestamp: new Date().toISOString()
        };
    }
    
    return NextResponse.json({
      success: true,
      data,
      metadata: {
        tipo,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        sucursal_id: sucursalId,
        generado_en: new Date().toISOString()
      }
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos para BI',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, configuracion } = body;
    
    const supabase = createServerComponentClient();
    await supabase
      .from('configuraciones_sistema')
      .upsert({
        clave: `bi_integration_${tipo}`,
        valor: JSON.stringify(configuracion),
        tipo: 'json',
        descripcion: `Configuración de integración con ${tipo}`,
        es_sensible: true
      });
    
    return NextResponse.json({
      success: true,
      message: `Configuración de ${tipo} guardada exitosamente`
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al configurar integración BI'
      },
      { status: 500 }
    );
  }
}
