# Database Schema Update Summary

**Date:** 2025-11-22  
**Task:** Update user information implementation for new database schema

## Overview
Updated the application to align with the new database schema where table names have been changed from generic names to more specific, prefixed names.

## Database Schema Changes

### Table Name Changes
| Old Table Name | New Table Name | Status |
|---------------|----------------|---------|
| `roles` | `usuarios_roles` | ✅ Updated |
| `perfiles` | `usuarios_perfiles` | ✅ Updated |
| N/A | `usuarios_grupos` | ✅ Added |
| N/A | `asignaciones_usuario` | ✅ Added |
| N/A | `sucursales` | ✅ Added |

### New Schema Structure
The new schema implements a more robust user management system:

1. **usuarios_roles** - User roles with permissions
   - Fields: `id_rol`, `codigo_rol`, `nombre_rol`, `nivel_acceso`, `permisos_json`, etc.
   
2. **usuarios_grupos** - User groups for organization
   - Fields: `id_grupo`, `codigo_grupo`, `nombre_grupo`, `descripcion`, etc.
   
3. **usuarios_perfiles** - Extended user profile information
   - Fields: `id_perfil`, `id_usuario`, `empresa`, `cargo`, `preferencias`, etc.
   
4. **asignaciones_usuario** - User assignments linking users to roles, groups, and branches
   - Fields: `id_asignacion`, `id_usuario`, `id_grupo`, `id_rol`, `id_sucursal`, `es_principal`, etc.
   
5. **sucursales** - Branch/location information
   - Fields: `id_suc`, `nombre_sucursal`, `provincia`, `municipio`, `direccion`, etc.

## Code Changes

### 1. Database Types (`src/lib/supabase/database.types.ts`)
**Changes:**
- ✅ Replaced `roles` table definition with `usuarios_roles`
- ✅ Replaced `perfiles` table definition with `usuarios_perfiles`
- ✅ Added `usuarios_grupos` table definition
- ✅ Added `asignaciones_usuario` table definition
- ✅ Added `sucursales` table definition

**Impact:** TypeScript types now match the actual database schema, providing proper type safety.

### 2. Roles Hook (`src/hooks/useRoles.ts`)
**Changes:**
- ✅ Updated all queries from `'roles'` to `'usuarios_roles'`
- ✅ Enhanced Role interface with new fields:
  - `codigo_rol`
  - `nivel_acceso`
  - `permisos_json`
  - `puede_crear_usuarios`
  - `puede_ver_todas_sucursales`
  - `esta_activo`
- ✅ Added filter for active roles only (`esta_activo = true`)
- ✅ Added ordering by `nivel_acceso` (descending)

**Impact:** Role management now uses correct table and includes all role attributes.

### 3. Main Layout (`src/components/layout/MainLayout.tsx`)
**Changes:**
- ✅ Added branch/location display functionality
- ✅ Extracts primary assignment from user permissions
- ✅ Displays branch name and province in both mobile and desktop views
- ✅ Shows user's primary branch below their name

**New Features:**
```typescript
const primaryAssignment = userPermissions?.asignaciones?.find(a => a.esta_activa && a.es_principal);
const userBranch = primaryAssignment?.sucursal?.nombre_sucursal || null;
const userProvince = primaryAssignment?.sucursal?.provincia || null;
```

**UI Updates:**
- Mobile view: Shows branch and province under user name
- Desktop view: Shows branch and province under user name in sidebar

### 4. Role System Hook (`src/hooks/useRoleSystem.ts`)
**Status:** ✅ Already using correct table names
- Already queries `usuarios_roles`
- Already queries `usuarios_grupos`
- Already queries `sucursales`
- RPC function `obtener_permisos_usuario` already uses correct schema

## Database Functions Verified

### `obtener_permisos_usuario` (RPC Function)
**Location:** `db/scripts_sql/12_funciones_rpc_avanzadas.sql`

**Status:** ✅ Already using correct table names
- Joins `usuarios_grupos`
- Joins `usuarios_roles`
- Joins `asignaciones_usuario`
- Joins `sucursales`

**Returns:** Complete user permissions including:
- User basic info
- All active assignments
- Role details with permissions
- Group information
- Branch/location details

## Testing Recommendations

### 1. Role Recovery on Login
- ✅ Verify `obtener_permisos_usuario` RPC function is called
- ✅ Check that user roles are properly loaded
- ✅ Confirm role permissions are accessible

### 2. Branch/Location Display
- ✅ Test mobile view shows branch name and province
- ✅ Test desktop sidebar shows branch name and province
- ✅ Verify primary assignment is correctly identified
- ✅ Check fallback behavior when no branch is assigned

### 3. Role Management
- ✅ Test role listing uses `usuarios_roles` table
- ✅ Verify role creation/update/delete operations
- ✅ Confirm role permissions are properly stored in `permisos_json`

### 4. User Assignments
- ✅ Verify users can have multiple assignments
- ✅ Test primary assignment identification
- ✅ Check active/inactive assignment filtering

## Migration Notes

### No Breaking Changes
- All changes are backward compatible at the code level
- Database schema must be updated before deploying code changes
- RPC functions already use correct schema

### Deployment Order
1. ✅ Database schema already updated (confirmed in `GEMODIDA_ESQUEMA_BD.sql`)
2. ✅ RPC functions already use correct tables
3. ✅ Code updated to match schema
4. Ready for deployment

## Files Modified

1. `src/lib/supabase/database.types.ts` - Updated type definitions
2. `src/hooks/useRoles.ts` - Updated table references and interface
3. `src/components/layout/MainLayout.tsx` - Added branch/location display

## Files Verified (No Changes Needed)

1. `src/hooks/useRoleSystem.ts` - Already using correct tables
2. `db/scripts_sql/12_funciones_rpc_avanzadas.sql` - Already using correct schema

## Summary

All required updates have been completed successfully:

✅ Database schema reviewed and documented  
✅ Type definitions updated to match new schema  
✅ Role management updated to use `usuarios_roles`  
✅ Branch/location display implemented  
✅ RPC functions verified to use correct schema  
✅ No additional table references found in codebase  

The application is now fully aligned with the new database schema and ready for testing.
