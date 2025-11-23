import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient, TableRow } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { config_id } = await request.json();
    
    if (!config_id) {
      return NextResponse.json(
        { error: 'ID de configuración requerido' },
        { status: 400 }
      );
    }

    const supabase = createServerComponentClient();
    
    const { data: config, error: configError } = await supabase
      .from('configuracion_scraping')
      .select('*')
      .eq('id_config', config_id)
      .eq('esta_activa', true)
      .single();
    
    const typedConfig: any = config as any; // Temporarily cast to any due to missing type in database.types.ts

    if (configError || !typedConfig) {
      return NextResponse.json(
        { error: 'Configuración no encontrada o inactiva' },
        { status: 404 }
      );
    }
    
    const { data: keywords } = await supabase
      .from('palabras_clave')
      .select('*')
      .in('id_palabra', typedConfig.palabras_clave_activas);

    const { data: fuentes } = await supabase
      .from('fuentes')
      .select('*')
      .in('id_fuente', typedConfig.fuentes_activas)
      .eq('esta_activa', true);

    const resultados = [];
    for (const keyword of keywords || []) {
      for (const fuente of fuentes || []) {
        const resultado = {
          id_palabra: keyword.id_palabra,
          id_fuente: fuente.id_fuente,
          titulo: `Resultado para "${keyword.palabra}" en ${fuente.nombre}`,
          contenido: `Contenido simulado encontrado para la palabra clave "${keyword.palabra}"`,
          url_origen: `${fuente.url_base}/search?q=${encodeURIComponent(keyword.palabra)}`,
          autor: 'Usuario Simulado',
          fecha_publicacion: new Date().toISOString(),
          fecha_extraccion: new Date().toISOString(),
          sentimiento: ['positivo', 'negativo', 'neutro'][Math.floor(Math.random() * 3)],
          relevancia: Math.floor(Math.random() * 100) + 1,
          procesado: false
        };
        resultados.push(resultado);
      }
    }

    if (resultados.length > 0) {
      await supabase.from('resultados').insert(resultados);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping ejecutado exitosamente',
      resultados_count: resultados.length,
      config_name: typedConfig.nombre_configuracion
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
