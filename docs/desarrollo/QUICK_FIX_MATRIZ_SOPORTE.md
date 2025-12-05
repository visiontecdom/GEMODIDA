# Quick Fix Guide: Matriz de Soporte - Usuarios Loading Error

## Problem
Usuarios not loading in Matriz de Soporte page with error: `Error loading usuarios: {}`

## Quick Solution (2 Steps)

### Step 1: Execute SQL Script

**Via Supabase Dashboard:**
1. Open your Supabase project: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open file: `db/scripts_sql/verificar_y_crear_funciones_matriz.sql`
5. Copy ALL content and paste into SQL Editor
6. Click **Run** button (or press Ctrl+Enter)
7. Wait for success messages in output

**Expected Output:**
```
NOTICE: ✓ Función obtener_usuarios_completos creada correctamente
NOTICE: ✓ Función obtener_roles_todos creada correctamente
NOTICE: ✓ Función obtener_configuraciones_sistema creada correctamente
NOTICE: ✓ Función actualizar_usuario creada correctamente
NOTICE: ============================================================================
NOTICE: Script completado. Todas las funciones RPC para Matriz de Soporte están listas.
NOTICE: ============================================================================
```

### Step 2: Test the Page

1. Open your application
2. Navigate to **Matriz de Soporte** page
3. Open browser console (F12)
4. Click on **Usuarios** tab
5. Check console for success message:
   - `Usuarios loaded successfully via RPC: X` (where X is the number of users)

## What Was Fixed

### Code Changes
- ✅ Enhanced error handling with detailed logging
- ✅ Added 3-level fallback mechanism (RPC → Direct Query → Basic Query)
- ✅ Applied same pattern to Roles and Configuraciones

### Database Changes
- ✅ Created/verified RPC function: `obtener_usuarios_completos()`
- ✅ Created/verified RPC function: `obtener_roles_todos()`
- ✅ Created/verified RPC function: `obtener_configuraciones_sistema()`
- ✅ Created/verified RPC function: `actualizar_usuario()`
- ✅ Set proper permissions for authenticated users

## Verification Checklist

- [ ] SQL script executed without errors
- [ ] Browser console shows "Usuarios loaded successfully"
- [ ] Usuarios table displays data
- [ ] Roles tab loads correctly
- [ ] Configuración tab loads correctly
- [ ] No error messages in console

## If Still Not Working

### Check Console Messages

Look for these patterns in browser console:

**Pattern 1: RPC Success** ✅
```
Usuarios loaded successfully via RPC: 5
```

**Pattern 2: Fallback Success** ✅
```
Error loading usuarios with RPC: {...}
Falling back to direct query...
Usuarios loaded successfully via direct query: 5
```

**Pattern 3: Still Failing** ❌
```
Error loading usuarios with RPC: {...}
Falling back to direct query...
Error loading usuarios with direct query: {...}
Attempting basic query without joins...
Error loading basic usuarios: {...}
```

### If Pattern 3 Occurs:

1. **Check if `usuarios` table exists:**
   ```sql
   SELECT * FROM usuarios LIMIT 1;
   ```

2. **Check RLS policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'usuarios';
   ```

3. **Verify you're authenticated:**
   - Check if you're logged in
   - Try logging out and back in

4. **Check Supabase connection:**
   - Verify `.env.local` has correct credentials
   - Check Supabase project is active

## Files Modified

1. `src/app/matriz-soporte/page.tsx` - Enhanced loading functions
2. `db/scripts_sql/verificar_y_crear_funciones_matriz.sql` - NEW SQL script

## Documentation

Full details: [`docs/desarrollo/FIX_MATRIZ_SOPORTE_USUARIOS.md`](FIX_MATRIZ_SOPORTE_USUARIOS.md)

## Support

If issues persist after following this guide:
1. Check full documentation above
2. Review browser console for detailed error messages
3. Verify database schema is complete
4. Check Supabase logs in dashboard
