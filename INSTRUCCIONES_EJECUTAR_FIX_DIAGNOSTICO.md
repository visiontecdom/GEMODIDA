# 🚨 EJECUTAR FIX CRÍTICO - ERRORES DE DIAGNÓSTICO

## ⚡ ACCIÓN INMEDIATA REQUERIDA

El archivo `db/scripts_sql/fix_all_diagnostic_errors.sql` contiene un fix completo que resuelve TODOS los errores críticos identificados en el diagnóstico:

### ❌ **ERRORES A CORREGIR:**
1. **404 Error** - `obtener_permisos_usuario` función no existe
2. **500 Error** - `infinite recursion detected in policy for relation 'usuarios'` 
3. **500 Error** - `usuarios_roles` queries fallan
4. **500 Error** - `usuarios_grupos` queries fallan  
5. **500 Error** - `obtener_usuarios_completos` falla
6. **400 Error** - `usuarios` joins no funcionan (relación no encontrada)
7. **500 Error** - Problemas de RLS policies en múltiples tablas

### ✅ **SOLUCIÓN COMPLETA:**

## PASOS PARA EJECUTAR EL FIX:

### 1. **Abrir Supabase Dashboard**
```
Ir a: https://supabase.com/dashboard
Seleccionar tu proyecto GEMODIDA
```

### 2. **Acceder al SQL Editor**
```
En el sidebar izquierdo, hacer clic en "SQL Editor"
Hacer clic en "New Query" (Nueva consulta)
```

### 3. **Copiar y Ejecutar el Script**
```
Abrir archivo: db/scripts_sql/fix_all_diagnostic_errors.sql
Copiar TODO el contenido del archivo
Pegar en el SQL Editor de Supabase
Hacer clic en "Run" (Ejecutar) o presionar Ctrl+Enter
```

### 4. **Verificar Ejecución Exitosa**
Buscar estos mensajes de éxito:
```
✓ obtener_permisos_usuario function exists
✓ usuarios table has RLS policies
✓ usuarios table has foreign key constraints  
✓ obtener_usuarios_completos function works
✓ sucursales table has esta_activo column
🎉 ALL FIXES APPLIED SUCCESSFULLY!
```

### 5. **Probar la Aplicación**
```
Abrir: http://localhost:3003/matriz-soporte
Verificar que NO aparezcan errores 404, 400, o 500 en consola
Confirmar que la página carga correctamente
```

## 🔧 **QUÉ HACE EL SCRIPT:**

### **Crea Funciones RPC Faltantes:**
- `obtener_permisos_usuario(uuid)` - Soluciona error 404

### **Corrige Políticas RLS (Row Level Security):**
- Elimina recursión infinita en tabla `usuarios`
- Corrige políticas en `usuarios_roles` 
- Corrige políticas en `usuarios_grupos`
- Crea políticas simples sin dependencias circulares

### **Establece Relaciones de Foreign Key:**
- `usuarios.id_rol → usuarios_roles.id_rol`
- `usuarios.id_suc → sucursales.id_suc`

### **Estandariza Schema:**
- Añade columna `esta_activo` a tabla `sucursales`
- Migra datos de `estado` a `esta_activo`
- Actualiza signatures de funciones para consistencia

### **Mejora Funciones Existentes:**
- Actualiza `obtener_usuarios_completos` con mejor manejo de errores
- Añade permisos de ejecución apropiados

## 🚨 **IMPORTANTE:**
- **DEBES** ejecutar este script para que la aplicación funcione
- El script incluye verificación automática de que todo se aplicó correctamente
- Después de ejecutar, la página Matriz de Soporte debe cargar sin errores
- Si hay errores en la ejecución, revisa los logs de Supabase

## 📞 **SOPORTE:**
Si encuentras problemas durante la ejecución:
1. Verifica que estés en el proyecto correcto de Supabase
2. Revisa que el script se copió completo
3. Revisa los logs de error en Supabase
4. Asegúrate de tener permisos de administrador

---

**⏰ TIEMPO ESTIMADO:** 2-3 minutos  
**🎯 RESULTADO:** Todos los errores de diagnóstico resueltos  
**✅ VERIFICACIÓN:** Aplicación funcionando sin errores 404/400/500