import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Las variables de entorno de Supabase no están configuradas correctamente.');
  console.log('Asegúrate de tener un archivo .env.local con las siguientes variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima');
  process.exit(1);
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Intentar obtener información del usuario actual (si hay sesión)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error al verificar la sesión:', sessionError.message);
      return;
    }

    if (session) {
      console.log('✅ Sesión activa encontrada para el usuario:', session.user.email);
    } else {
      console.log('ℹ️ No hay sesión activa. Probando autenticación anónima...');
    }

    // Intentar listar tablas (solo lectura)
    console.log('\n📋 Listando tablas disponibles...');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (tablesError) {
      console.warn('⚠️ No se pudieron listar las tablas (esto puede ser normal sin permisos):', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Tablas disponibles:');
      tables.forEach((table: { tablename: string }) => {
        console.log(`- ${table.tablename}`);
      });
    } else {
      console.log('ℹ️ No se encontraron tablas en el esquema público.');
    }

    // Probar una consulta simple a una tabla de ejemplo (si existe)
    console.log('\n🧪 Probando consulta a la tabla "profiles"...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);

    if (profilesError) {
      console.warn('⚠️ No se pudo consultar la tabla "profiles":', profilesError.message);
      console.log('Esto es normal si la tabla no existe o no tienes permisos.');
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Datos de ejemplo de la tabla "profiles":', JSON.stringify(profiles, null, 2));
    } else {
      console.log('ℹ️ La tabla "profiles" está vacía o no existe.');
    }

    console.log('\n✅ Prueba de conexión completada con éxito!');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Ejecutar la prueba
testConnection().catch(console.error);
