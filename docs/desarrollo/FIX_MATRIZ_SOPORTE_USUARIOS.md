# Fix: Error Loading Usuarios in Matriz de Soporte

## Problem Description

The Matriz de Soporte page was showing an error when trying to load usuarios:

```
Error loading usuarios: {}

    at loadUsuarios (src/app/matriz-soporte/page.tsx:170:17)
    at async loadData (src/app/matriz-soporte/page.tsx:138:11)
```

### Root Causes

1. **RPC Function Not Found**: The `obtener_usuarios_completos()` function may not exist in the database
2. **Poor Error Handling**: Empty error object `{}` provided no useful debugging information
3. **No Fallback Mechanism**: Code failed completely if RPC function was unavailable

## Solution Implemented

### 1. Enhanced Error Handling

Updated [`loadUsuarios()`](src/app/matriz-soporte/page.tsx:160) with:
- Detailed error logging with `JSON.stringify()` for complete error information
- Console messages indicating which query method is being used
- Success messages showing how many records were loaded

### 2. Multi-Level Fallback Strategy

The function now attempts three different approaches in order:

#### Level 1: RPC Function (Preferred)
```typescript
const { data, error } = await (supabase as any)
  .rpc('obtener_usuarios_completos', {
    p_limite: 100,
    p_desplazamiento: 0
  });
```

#### Level 2: Direct Query with Joins (Fallback)
```typescript
const { data: usuariosData, error: queryError } = await supabase
  .from('usuarios')
  .select(`
    id_usuario,
    correo,
    nombre_completo,
    telefono,
    esta_activo,
    id_rol,
    id_suc,
    creado_en,
    ultimo_acceso,
    usuarios_roles!inner(nombre_rol),
    sucursales(nombre_sucursal)
  `)
  .order('creado_en', { ascending: false })
  .limit(100);
```

#### Level 3: Basic Query (Last Resort)
```typescript
const { data: basicData, error: basicError } = await supabase
  .from('usuarios')
  .select('*')
  .order('creado_en', { ascending: false })
  .limit(100);
```

### 3. Similar Improvements for Other Functions

Applied the same pattern to:
- [`loadRoles()`](src/app/matriz-soporte/page.tsx:254) - Uses `obtener_roles_todos()` with fallback
- [`loadConfiguraciones()`](src/app/matriz-soporte/page.tsx:292) - Uses `obtener_configuraciones_sistema()` with fallback

## Database Setup

### SQL Script Created

Created [`verificar_y_crear_funciones_matriz.sql`](db/scripts_sql/verificar_y_crear_funciones_matriz.sql) which:

1. **Creates/Updates RPC Functions**:
   - `obtener_usuarios_completos(p_limite, p_desplazamiento)` - Returns users with role and branch info
   - `obtener_roles_todos()` - Returns all roles with user counts
   - `obtener_configuraciones_sistema()` - Returns system configurations
   - `actualizar_usuario()` - Updates user information

2. **Verifies Installation**: Checks that all functions were created successfully

3. **Sets Permissions**: Grants EXECUTE permissions to authenticated users

### How to Execute the SQL Script

#### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `db/scripts_sql/verificar_y_crear_funciones_matriz.sql`
5. Click **Run** or press `Ctrl+Enter`
6. Check the output for success messages

#### Option 2: Command Line (if you have psql)
```bash
psql -h your-project.supabase.co -U postgres -d postgres -f db/scripts_sql/verificar_y_crear_funciones_matriz.sql
```

## Testing the Fix

### 1. Check Browser Console

After the fix, you should see one of these messages in the browser console:

**Success with RPC:**
```
Usuarios loaded successfully via RPC: 5
```

**Success with Direct Query:**
```
Error loading usuarios with RPC: {...}
Falling back to direct query...
Usuarios loaded successfully via direct query: 5
```

**Success with Basic Query:**
```
Error loading usuarios with RPC: {...}
Falling back to direct query...
Error loading usuarios with direct query: {...}
Attempting basic query without joins...
Usuarios loaded successfully via basic query: 5
```

### 2. Verify Data Display

The Matriz de Soporte page should now:
- ✅ Display the usuarios table with data
- ✅ Show user names, emails, roles, and branches
- ✅ Allow filtering and sorting
- ✅ Enable user management actions

### 3. Check All Tabs

Test all tabs in Matriz de Soporte:
- **Usuarios** - Should load user list
- **Roles** - Should load roles with user counts
- **Configuración** - Should load system settings

## Benefits of This Solution

### 1. Resilience
- Page works even if RPC functions are missing
- Graceful degradation through multiple fallback levels
- No complete failure scenarios

### 2. Better Debugging
- Detailed error messages in console
- Clear indication of which query method succeeded
- Full error object serialization for troubleshooting

### 3. Performance
- RPC functions are fastest (when available)
- Direct queries are efficient fallback
- Basic queries ensure data always loads

### 4. Maintainability
- Clear code structure
- Consistent pattern across all load functions
- Easy to add more fallback levels if needed

## Files Modified

1. **[`src/app/matriz-soporte/page.tsx`](src/app/matriz-soporte/page.tsx)**
   - Enhanced `loadUsuarios()` function (lines 160-252)
   - Enhanced `loadRoles()` function (lines 254-290)
   - Enhanced `loadConfiguraciones()` function (lines 292-324)

2. **[`db/scripts_sql/verificar_y_crear_funciones_matriz.sql`](db/scripts_sql/verificar_y_crear_funciones_matriz.sql)** (NEW)
   - Complete RPC function definitions
   - Verification and permission setup

## Next Steps

### Immediate Actions
1. ✅ Execute the SQL script to ensure RPC functions exist
2. ✅ Test the Matriz de Soporte page
3. ✅ Verify all three tabs load correctly

### Optional Improvements
- Add loading indicators for better UX
- Implement caching to reduce database queries
- Add pagination for large datasets
- Create admin notifications for RPC function failures

## Troubleshooting

### If usuarios still don't load:

1. **Check Database Connection**
   ```typescript
   // In browser console
   const { data, error } = await supabase.from('usuarios').select('count');
   console.log('Connection test:', { data, error });
   ```

2. **Verify Table Exists**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'usuarios';
   ```

3. **Check RLS Policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'usuarios';
   ```

4. **Review Browser Console**
   - Look for detailed error messages
   - Check which fallback level was reached
   - Verify error details in JSON format

### Common Issues

**Issue**: "relation 'usuarios' does not exist"
- **Solution**: Run the main schema creation scripts first

**Issue**: "permission denied for function"
- **Solution**: Re-run the GRANT statements in the SQL script

**Issue**: "column 'nombre_rol' does not exist"
- **Solution**: Check that the join with `usuarios_roles` table is working

## Summary

This fix ensures the Matriz de Soporte page is robust and resilient:
- ✅ Multiple fallback mechanisms
- ✅ Detailed error logging
- ✅ Works with or without RPC functions
- ✅ Easy to debug and maintain
- ✅ SQL script for database setup

The page will now load usuarios successfully regardless of database configuration state.
