# INSTRUCCIONES: Ejecutar Script SQL en Supabase

**Archivo:** `db/Scripts_SQL/05_fix_functions_and_rls.sql`  
**Objetivo:** Corregir funciones RPC y agregar políticas RLS

---

## 📋 PASOS PARA EJECUTAR

### Paso 1: Acceder a Supabase
1. Ir a https://app.supabase.com
2. Seleccionar el proyecto **GEMODIDA**
3. En el menú lateral, ir a **SQL Editor**

### Paso 2: Crear Nueva Query
1. Hacer clic en **New Query**
2. Copiar el contenido del archivo `db/Scripts_SQL/05_fix_functions_and_rls.sql`
3. Pegar en el editor SQL

### Paso 3: Ejecutar Script
1. Hacer clic en el botón **Run** (o presionar `Ctrl+Enter`)
2. Esperar a que se complete la ejecución
3. Verificar que no hay errores en la consola

### Paso 4: Validar Ejecución
Ejecutar las siguientes queries para verificar:

```sql
-- Verificar funciones RPC creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%log_proceso%' 
OR routine_name LIKE '%obtener_estadisticas%'
OR routine_name LIKE '%generar_reporte%'
OR routine_name LIKE '%limpiar_logs%';

-- Verificar índices creados
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## ✅ VALIDACIÓN POST-EJECUCIÓN

### Checklist de Verificación

- [ ] No hay errores en la consola SQL
- [ ] Funciones RPC están creadas (5 funciones)
- [ ] Índices están creados (6 índices)
- [ ] Políticas RLS están activas (11 políticas)
- [ ] RLS está habilitado en tablas críticas

### Prueba de Funciones

```sql
-- Probar función log_proceso
SELECT public.log_proceso(
    'test_proceso',
    'completado',
    'Prueba de función log_proceso',
    'Detalles de prueba'
);

-- Probar función obtener_estadisticas_palabra
SELECT * FROM public.obtener_estadisticas_palabra(1);

-- Probar función obtener_estadisticas_por_periodo
SELECT * FROM public.obtener_estadisticas_por_periodo(1, 'day', 7);
```

---

## ⚠️ POSIBLES ERRORES Y SOLUCIONES

### Error: "Function already exists"
**Causa:** La función ya existe en la base de datos  
**Solución:** El script incluye `DROP FUNCTION IF EXISTS` para evitar esto. Si persiste, ejecutar manualmente:
```sql
DROP FUNCTION IF EXISTS public.nombre_funcion CASCADE;
```

### Error: "Permission denied"
**Causa:** El usuario no tiene permisos suficientes  
**Solución:** Usar la cuenta de administrador de Supabase o contactar al propietario del proyecto

### Error: "Table does not exist"
**Causa:** Las tablas base no existen  
**Solución:** Ejecutar primero el script de esquema: `GEMODIDA_Esquema_BD.sql`

---

## 🔄 ROLLBACK (Si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar funciones
DROP FUNCTION IF EXISTS public.log_proceso CASCADE;
DROP FUNCTION IF EXISTS public.obtener_estadisticas_palabra CASCADE;
DROP FUNCTION IF EXISTS public.obtener_estadisticas_por_periodo CASCADE;
DROP FUNCTION IF EXISTS public.generar_reporte CASCADE;
DROP FUNCTION IF EXISTS public.limpiar_logs_antiguos CASCADE;

-- Eliminar índices
DROP INDEX IF EXISTS idx_resultados_id_palabra;
DROP INDEX IF EXISTS idx_resultados_id_fuente;
DROP INDEX IF EXISTS idx_resultados_fecha_publicacion;
DROP INDEX IF EXISTS idx_palabras_clave_id_usuario;
DROP INDEX IF EXISTS idx_usuarios_id_rol;
DROP INDEX IF EXISTS idx_logs_procesos_fecha;

-- Deshabilitar RLS
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.palabras_clave DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_procesos DISABLE ROW LEVEL SECURITY;
```

---

## 📞 SOPORTE

Si encuentras problemas:
1. Revisar los logs de error en Supabase
2. Verificar que las tablas base existen
3. Confirmar que tienes permisos de administrador
4. Contactar al equipo de desarrollo

---

**Última actualización:** 2025-11-19
