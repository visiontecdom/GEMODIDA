# ⚡ PRÓXIMA ACCIÓN - CRÍTICA

**Fecha:** 2025-11-19  
**Prioridad:** 🔴 ALTA  
**Tiempo estimado:** 5 minutos

---

## 🎯 OBJETIVO

Ejecutar script SQL en Supabase para completar la configuración de la base de datos.

---

## 📋 PASOS RÁPIDOS

### Paso 1: Acceder a Supabase
1. Ir a https://app.supabase.com
2. Iniciar sesión con tu cuenta
3. Seleccionar proyecto **GEMODIDA**

### Paso 2: Abrir SQL Editor
1. En el menú lateral, hacer clic en **SQL Editor**
2. Hacer clic en **New Query**

### Paso 3: Copiar Script
1. Abrir archivo: `db/Scripts_SQL/05_fix_functions_and_rls.sql`
2. Copiar TODO el contenido (Ctrl+A, Ctrl+C)

### Paso 4: Pegar en Supabase
1. En Supabase SQL Editor, pegar el contenido (Ctrl+V)
2. Verificar que el script está completo

### Paso 5: Ejecutar
1. Hacer clic en botón **Run** (o presionar Ctrl+Enter)
2. Esperar a que se complete (debe decir "Success")

### Paso 6: Validar
Ejecutar estas queries para verificar:

```sql
-- Verificar funciones RPC
SELECT COUNT(*) as total_funciones
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
);
-- Resultado esperado: 7

-- Verificar índices
SELECT COUNT(*) as total_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
-- Resultado esperado: 6

-- Verificar políticas RLS
SELECT COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public';
-- Resultado esperado: 11
```

---

## ✅ CHECKLIST

- [ ] Accedí a Supabase
- [ ] Abrí SQL Editor
- [ ] Copié el script
- [ ] Pegué en Supabase
- [ ] Ejecuté el script
- [ ] Verificué funciones (7)
- [ ] Verificué índices (6)
- [ ] Verificué políticas (11)

---

## ⚠️ SI ALGO FALLA

### Error: "Function already exists"
**Solución:** El script incluye `DROP IF EXISTS`. Ejecutar de nuevo.

### Error: "Permission denied"
**Solución:** Usar cuenta de administrador de Supabase.

### Error: "Table does not exist"
**Solución:** Las tablas base deben existir. Verificar que el esquema está creado.

### No aparece "Success"
**Solución:** Revisar la consola de errores. Copiar el error y buscar solución.

---

## 📞 DOCUMENTACIÓN

Para más detalles, revisar:
- `docs/desarrollo/INSTRUCCIONES_EJECUTAR_SCRIPT_SQL.md`
- `docs/desarrollo/FASE_2_BASE_DATOS.md`
- `docs/desarrollo/PLAN_ESTRATEGICO_COMPLETO.md`

---

## 🚀 DESPUÉS DE EJECUTAR

Una vez completado:

1. Probar la aplicación:
```bash
npm run dev
# Acceder a http://localhost:3003
```

2. Revisar documentación de FASE 3:
```
docs/desarrollo/FASE_3_PANELES_FORMULARIOS.md
```

3. Iniciar desarrollo del Panel de Administración

---

**¡Adelante! 🚀**
