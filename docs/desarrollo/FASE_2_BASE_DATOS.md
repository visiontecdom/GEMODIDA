# FASE 2: BASE DE DATOS - PLAN DETALLADO

**Fecha:** 2025-11-19  
**Estado:** PLANIFICACIÓN

---

## 📋 RESUMEN

Esta fase se enfoca en completar la configuración de la base de datos PostgreSQL en Supabase, incluyendo la corrección de funciones RPC, implementación de políticas RLS y creación de índices para optimización.

---

## 🎯 OBJETIVOS

1. ✅ Ejecutar script SQL consolidado en Supabase
2. ✅ Validar todas las funciones RPC
3. ✅ Habilitar y validar políticas RLS
4. ✅ Crear índices de optimización
5. ✅ Probar conexión y permisos

---

## 📊 ESTRUCTURA DE BASE DE DATOS

### Tablas Existentes (13 tablas)

| Tabla | Propósito | Columnas Clave |
|-------|-----------|----------------|
| `usuarios` | Gestión de usuarios | id_usuario, correo, id_rol |
| `roles` | Catálogo de roles | id_rol, nombre_rol, permisos |
| `palabras_clave` | Palabras a monitorear | id_palabra, palabra, id_usuario_creador |
| `fuentes` | Fuentes de datos | id_fuente, nombre, tipo_fuente |
| `categorias_fuentes` | Categorías de fuentes | id_categoria, nombre |
| `resultados` | Resultados de scraping | id_resultado, id_palabra, id_fuente, sentimiento |
| `estadisticas` | Estadísticas agregadas | id_estadistica, id_palabra, total_resultados |
| `reportes` | Reportes generados | id_reporte, titulo, estado |
| `logs_procesos` | Logs del sistema | id_log, tipo_proceso, estado |
| `perfiles_usuarios` | Perfiles extendidos | id_perfil, empresa, cargo |
| `perfiles` | Perfiles de auth | id_perfil, nombre_completo, rol |
| `configuraciones_sistema` | Configuraciones | clave, valor, tipo |

---

## 🔧 ACCIONES A REALIZAR

### Paso 1: Ejecutar Script SQL

**Archivo:** `db/Scripts_SQL/05_fix_functions_and_rls.sql`

**Contenido:**
- Corrección de función `log_proceso()`
- Creación de 6 índices
- Habilitación de RLS en 5 tablas
- Creación de 11 políticas RLS

**Instrucciones:**
1. Ir a Supabase SQL Editor
2. Crear nueva query
3. Copiar contenido del script
4. Ejecutar (Ctrl+Enter)

### Paso 2: Validar Funciones RPC

```sql
-- Verificar que todas las funciones existen
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'actualizar_estadisticas_palabra',
    'buscar_palabras_clave',
    'generar_reporte',
    'obtener_estadisticas_palabra',
    'obtener_estadisticas_por_periodo',
    'log_proceso',
    'actualizar_columna_actualizado_en'
)
ORDER BY routine_name;
```

**Resultado esperado:** 7 funciones

### Paso 3: Validar Índices

```sql
-- Verificar que todos los índices existen
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

**Resultado esperado:** 6 índices

### Paso 4: Validar Políticas RLS

```sql
-- Verificar que todas las políticas RLS existen
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Resultado esperado:** 11 políticas

### Paso 5: Verificar RLS Habilitado

```sql
-- Verificar que RLS está habilitado en tablas críticas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('usuarios', 'palabras_clave', 'reportes', 'resultados', 'logs_procesos')
ORDER BY tablename;
```

**Resultado esperado:** rowsecurity = true en todas

---

## 🔐 POLÍTICAS RLS IMPLEMENTADAS

### Tabla: `usuarios`
- `admin_manage_users` - Administradores pueden gestionar todos los usuarios
- `users_view_own_profile` - Usuarios ven su propio perfil

### Tabla: `palabras_clave`
- `users_delete_own_keywords` - Eliminar propias palabras clave
- `users_update_own_keywords` - Editar propias palabras clave
- `users_insert_keywords` - Crear palabras clave
- `users_select_keywords` - Ver propias o públicas

### Tabla: `reportes`
- `users_insert_reports` - Crear reportes
- `users_select_reports` - Ver propios reportes o ser admin

### Tabla: `resultados`
- `users_select_results` - Ver resultados de palabras clave propias o públicas

### Tabla: `logs_procesos`
- `admins_view_logs` - Solo administradores ven logs

---

## 📈 ÍNDICES CREADOS

| Índice | Tabla | Columna | Propósito |
|--------|-------|---------|-----------|
| `idx_resultados_id_palabra` | resultados | id_palabra | Búsquedas por palabra clave |
| `idx_resultados_id_fuente` | resultados | id_fuente | Búsquedas por fuente |
| `idx_resultados_fecha_publicacion` | resultados | fecha_publicacion | Búsquedas por fecha |
| `idx_palabras_clave_id_usuario` | palabras_clave | id_usuario_creador | Búsquedas por usuario |
| `idx_usuarios_id_rol` | usuarios | id_rol | Búsquedas por rol |
| `idx_logs_procesos_fecha` | logs_procesos | fecha_inicio | Búsquedas de logs antiguos |

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Script SQL ejecutado sin errores
- [ ] 7 funciones RPC verificadas
- [ ] 6 índices creados
- [ ] 11 políticas RLS activas
- [ ] RLS habilitado en 5 tablas
- [ ] Pruebas de funciones exitosas
- [ ] Conexión desde aplicación funciona
- [ ] Permisos RLS validados

---

## 🧪 PRUEBAS POST-EJECUCIÓN

### Prueba 1: Función log_proceso

```sql
SELECT public.log_proceso(
    'test_fase2',
    'completado',
    'Prueba de función log_proceso en FASE 2',
    'Validación de script SQL'
);
```

**Resultado esperado:** Retorna un bigint (id del log)

### Prueba 2: Función obtener_estadisticas_palabra

```sql
SELECT * FROM public.obtener_estadisticas_palabra(1);
```

**Resultado esperado:** Tabla con columnas (fecha, total_resultados, promedio_sentimiento, fuentes)

### Prueba 3: Función obtener_estadisticas_por_periodo

```sql
SELECT * FROM public.obtener_estadisticas_por_periodo(1, 'day', 7);
```

**Resultado esperado:** Tabla con estadísticas por período

### Prueba 4: Función buscar_palabras_clave

```sql
SELECT * FROM public.buscar_palabras_clave(NULL, NULL, 10, 0);
```

**Resultado esperado:** Tabla con palabras clave

---

## 🚀 PRÓXIMOS PASOS

Una vez completada esta fase:

1. **FASE 3:** Crear Panel de Administración
   - CRUD de usuarios
   - Gestión de roles
   - Configuración de plataforma

2. **FASE 4:** Crear Panel de Operaciones
   - Dashboard con gráficos
   - Formularios de encuestas
   - Formularios de actividades

3. **FASE 5:** Funcionalidades Avanzadas
   - Scraping simulado
   - Notificaciones
   - Reportes

---

## 📝 NOTAS IMPORTANTES

1. **Credenciales:** Las credenciales de Supabase están en `.env.local`
2. **RLS Activo:** Las políticas RLS están habilitadas. Asegurar que los usuarios tengan roles asignados
3. **Índices:** Mejorarán significativamente el rendimiento de consultas
4. **Rollback:** Si es necesario, usar script de rollback en `INSTRUCCIONES_EJECUTAR_SCRIPT_SQL.md`

---

**Generado por:** Amazon Q  
**Última actualización:** 2025-11-19
