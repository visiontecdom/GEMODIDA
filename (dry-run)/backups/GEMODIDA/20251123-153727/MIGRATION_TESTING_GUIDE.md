# GEMODIDA Role ID Migration Testing Guide

## Pre-Migration Testing Checklist

### 1. Document Current State
- [ ] Test all user roles and verify they work correctly
- [ ] Document current permission behavior
- [ ] Verify UI access controls for each role
- [ ] Check dashboard panel access for each user type

### 2. Application Backup
- [ ] Create full database backup
- [ ] Backup application configuration files
- [ ] Document current user role assignments

### 3. System Health Check
- [ ] Verify all services are running
- [ ] Check application logs for errors
- [ ] Ensure database connectivity
- [ ] Test authentication system

## Migration Execution Steps

### Step 1: Execute Migration Script
```sql
-- Connect to database and execute migration
\i db/migration_scripts/role_id_migration.sql

-- Check migration log for success
SELECT * FROM public.ddl_migrations_log 
WHERE mensaje LIKE 'ROLE_ID_%'
ORDER BY ejecutado_en DESC;
```

### Step 2: Validate Database Changes
```sql
-- Verify role IDs are correct
SELECT id_rol, codigo_rol, nombre_rol 
FROM usuarios_roles 
WHERE id_rol BETWEEN 1 AND 9 
ORDER BY id_rol;

-- Check user assignments
SELECT u.nombre_completo, ur.codigo_rol, ur.id_rol
FROM usuarios u
JOIN usuarios_roles ur ON u.id_rol = ur.id_rol
ORDER BY ur.id_rol;

-- Verify foreign key constraints
SELECT COUNT(*) as users_with_roles FROM usuarios WHERE id_rol BETWEEN 1 AND 9;
SELECT COUNT(*) as assignments_with_roles FROM asignaciones_usuario WHERE id_rol BETWEEN 1 AND 9;
```

## Post-Migration Testing

### 1. Authentication Testing
- [ ] Test login with each role type
- [ ] Verify role assignment is correct after login
- [ ] Check user session persistence
- [ ] Test logout and re-login

### 2. Permission System Testing
- [ ] Test `hasRole()` function for each role code
- [ ] Verify `hasPermission()` checks work correctly
- [ ] Confirm permission-based UI elements display properly
- [ ] Test access to restricted features

### 3. Dashboard and UI Testing
- [ ] Verify dashboard loads correctly for each role
- [ ] Check panel access matches role permissions
- [ ] Test sidebar menu items based on permissions
- [ ] Confirm role badges display correctly

### 4. Role-Specific Testing

#### Super User (ID: 1)
- [ ] Full system access
- [ ] Can see all panels
- [ ] Administrative functions available
- [ ] User management access

#### Admin (ID: 2)
- [ ] Administrative access
- [ ] User management functions
- [ ] System configuration access
- [ ] Report generation capabilities

#### Gerente (ID: 3)
- [ ] Gerencia panel access
- [ ] Branch management functions
- [ ] Budget and planning access
- [ ] Staff oversight capabilities

#### Supervisor (ID: 4)
- [ ] Operational panel access
- [ ] Team coordination functions
- [ ] Progress monitoring
- [ ] Basic administrative tasks

#### Operador (ID: 5)
- [ ] Operations panel access
- [ ] Data entry functions
- [ ] Process execution
- [ ] Basic reporting

#### Encuestador (ID: 6)
- [ ] Survey panel access
- [ ] Data collection functions
- [ ] Survey design capabilities
- [ ] Results viewing

#### Seguridad (ID: 7)
- [ ] Security management access
- [ ] Permission administration
- [ ] User access controls
- [ ] System security functions

#### Invitado (ID: 8)
- [ ] Read-only access
- [ ] Report viewing
- [ ] Basic query capabilities
- [ ] Limited functionality

#### Desarrollo (ID: 9)
- [ ] Development panel access
- [ ] System configuration
- [ ] Debug and testing functions
- [ ] Development tools

## Error Detection and Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Failures
**Symptoms:** Users cannot log in after migration
**Solution:** Check role assignments in database
```sql
SELECT u.correo, ur.codigo_rol, ur.id_rol 
FROM usuarios u 
JOIN usuarios_roles ur ON u.id_rol = ur.id_rol 
WHERE u.esta_activo = true;
```

#### 2. Permission Errors
**Symptoms:** Users see access denied messages
**Solution:** Verify role codes match application expectations
```sql
SELECT codigo_rol, nombre_rol, permisos_json 
FROM usuarios_roles 
WHERE id_rol BETWEEN 1 AND 9 
ORDER BY id_rol;
```

#### 3. UI Display Issues
**Symptoms:** Menus or panels not displaying correctly
**Solution:** Check role-based panel assignments
```sql
-- Check dashboard panel access logic matches new role IDs
SELECT 'Check dashboard layout.tsx requiredRoles arrays'
```

### Rollback Procedure (if needed)
```sql
-- Execute rollback if migration fails
\i db/migration_scripts/role_id_rollback.sql

-- Verify rollback success
SELECT id_rol, codigo_rol, nombre_rol 
FROM usuarios_roles 
WHERE id_rol BETWEEN 28 AND 36 
ORDER BY id_rol;
```

## Success Validation

### Database Validation
- [ ] All 9 roles have correct new IDs (1-9)
- [ ] Foreign key constraints satisfied
- [ ] No orphaned records
- [ ] User assignments intact

### Application Validation
- [ ] All user logins working
- [ ] Role-based permissions functioning
- [ ] UI access controls operational
- [ ] Dashboard panels accessible
- [ ] No JavaScript errors in console

### Performance Validation
- [ ] Application performance unchanged
- [ ] Database queries executing normally
- [ ] No significant slowdowns
- [ ] Memory usage stable

## Post-Migration Activities

### 1. Monitoring
- [ ] Monitor application logs for 24-48 hours
- [ ] Check for any permission-related errors
- [ ] Verify user activity is normal
- [ ] Monitor database performance

### 2. Documentation Update
- [ ] Update system documentation with new role IDs
- [ ] Revise user manuals if they reference role IDs
- [ ] Update API documentation
- [ ] Create migration completion report

### 3. Cleanup
- [ ] Remove backup tables after successful validation period
- [ ] Archive migration scripts
- [ ] Update deployment procedures
- [ ] Schedule follow-up review

## Reporting

### Migration Completion Report
Document the following:
- Migration execution date and time
- Any issues encountered and resolved
- Test results summary
- Performance impact assessment
- User feedback (if any)
- Recommendations for future migrations

### Success Metrics
- Zero downtime achieved
- All functionality preserved
- No data loss
- User satisfaction maintained
- System performance stable