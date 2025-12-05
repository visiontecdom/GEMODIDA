import { createClient } from '@supabase/supabase-js';

interface ResultadoScraping {
  titulo: string;
  contenido: string;
  url: string;
  fuente: string;
  sentimiento: string;
  palabras_encontradas: string[];
  fecha_publicacion: string;
}

export class ScrapingService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  async ejecutarScraping(configId: number): Promise<ResultadoScraping[]> {
    try {
      const { data: config, error: configError } = await this.supabase
        .from('scraping_config')
        .select('*')
        .eq('id', configId)
        .single();

      if (configError) throw configError;

      const resultados: ResultadoScraping[] = [];

      for (const palabra of config.palabras_clave) {
        const resultado = this.generarResultadoSimulado(palabra, config.fuente);
        resultados.push(resultado);
      }

      await this.almacenarResultados(configId, resultados);
      return resultados;
    } catch (error) {
      console.error('Error en scraping:', error);
      throw error;
    }
  }

  private generarResultadoSimulado(palabra: string, fuente: string): ResultadoScraping {
    const sentimientos = ['positivo', 'negativo', 'neutral'];
    const sentimiento = sentimientos[Math.floor(Math.random() * sentimientos.length)];

    return {
      titulo: `Resultado para "${palabra}" en ${fuente}`,
      contenido: `Contenido relacionado con ${palabra}`,
      url: `https://${fuente.toLowerCase()}.com/resultado/${palabra}`,
      fuente,
      sentimiento,
      palabras_encontradas: [palabra],
      fecha_publicacion: new Date().toISOString(),
    };
  }

  async almacenarResultados(configId: number, resultados: ResultadoScraping[]): Promise<void> {
    try {
      const datosInsert = resultados.map((r) => ({
        config_id: configId,
        titulo: r.titulo,
        contenido: r.contenido,
        url: r.url,
        fuente: r.fuente,
        sentimiento: r.sentimiento,
        palabras_encontradas: r.palabras_encontradas,
        fecha_publicacion: r.fecha_publicacion,
      }));

      const { error } = await this.supabase
        .from('scraping_resultados')
        .insert(datosInsert);

      if (error) throw error;
    } catch (error) {
      console.error('Error almacenando:', error);
      throw error;
    }
  }
}

export const scrapingService = new ScrapingService();
