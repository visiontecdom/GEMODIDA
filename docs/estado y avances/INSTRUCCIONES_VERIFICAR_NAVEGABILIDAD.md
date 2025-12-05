# INSTRUCCIONES PARA VERIFICAR NAVEGABILIDAD

**Fecha:** 2025-11-19  
**Objetivo:** Verificar que la navegabilidad funciona correctamente en el navegador

---

## 🚀 PASOS PARA VERIFICAR

### 1. Iniciar la aplicación en desarrollo

```bash
npm run dev
```

Acceder a: `http://localhost:3003`

---

### 2. Verificar navegación pública

#### Página de inicio (`/`)
- [ ] Cargar página de inicio
- [ ] Ver botones "Iniciar Sesión" y "Crear Cuenta"
- [ ] Hacer clic en "Iniciar Sesión" → Debe ir a `/signin`
- [ ] Hacer clic en "Crear Cuenta" → Debe ir a `/signup`

---

### 3. Crear cuenta de prueba

#### Página de registro (`/signup`)
- [ ] Ingresar email: `test@example.com`
- [ ] Ingresar contraseña: `Test123456`
- [ ] Hacer clic en "Crear Cuenta"
- [ ] Debe redirigir a `/dashboard`

---

### 4. Verificar navegación del panel de operaciones

#### Menú lateral (Desktop)
- [ ] Ver menú lateral con opciones
- [ ] Verificar que aparecen todas estas opciones:
  - [ ] Panel de Control
  - [ ] Palabras Clave
  - [ ] Resultados
  - [ ] Informes
  - [ ] Encuestas
  - [ ] Actividades

#### Menú móvil (Mobile)
- [ ] Hacer clic en icono de menú (hamburguesa)
- [ ] Verificar que aparecen todas las opciones
- [ ] Hacer clic en cada opción y verificar navegación

#### Navbar (Header)
- [ ] Verificar que aparecen todos los links:
  - [ ] Panel de Control
  - [ ] Palabras Clave
  - [ ] Resultados
  - [ ] Informes
  - [ ] Encuestas
  - [ ] Actividades

---

### 5. Verificar acceso a cada página

#### Dashboard (`/dashboard`)
- [ ] Hacer clic en "Panel de Control"
- [ ] Debe cargar `/dashboard`
- [ ] Debe mostrar gráficos y estadísticas

#### Palabras Clave (`/keywords`)
- [ ] Hacer clic en "Palabras Clave"
- [ ] Debe cargar `/keywords`
- [ ] Debe mostrar tabla de palabras clave

#### Resultados (`/results`)
- [ ] Hacer clic en "Resultados"
- [ ] Debe cargar `/results`
- [ ] Debe mostrar tabla de resultados

#### Informes (`/reports`)
- [ ] Hacer clic en "Informes"
- [ ] Debe cargar `/reports`
- [ ] Debe mostrar tabla de reportes

#### Encuestas (`/surveys`)
- [ ] Hacer clic en "Encuestas"
- [ ] Debe cargar `/surveys`
- [ ] Debe mostrar tabla de encuestas

#### Actividades (`/activities`)
- [ ] Hacer clic en "Actividades"
- [ ] Debe cargar `/activities`
- [ ] Debe mostrar tabla de actividades

---

### 6. Verificar acceso a Admin (si es admin)

#### Crear usuario admin (en Supabase)
1. Ir a Supabase → SQL Editor
2. Ejecutar:
```sql
UPDATE usuarios 
SET role = 'admin' 
WHERE correo = 'test@example.com';
```

#### Verificar acceso a Admin
- [ ] Recargar página
- [ ] Debe aparecer "Administración" en menú
- [ ] Hacer clic en "Administración"
- [ ] Debe cargar `/admin`

#### Panel de Administración (`/admin`)
- [ ] Debe mostrar dashboard admin
- [ ] Debe mostrar menú lateral con opciones:
  - [ ] Dashboard
  - [ ] Usuarios
  - [ ] Roles
  - [ ] Configuración
  - [ ] Logs

#### Gestión de Usuarios (`/admin/users`)
- [ ] Hacer clic en "Usuarios"
- [ ] Debe cargar `/admin/users`
- [ ] Debe mostrar tabla de usuarios

#### Gestión de Roles (`/admin/roles`)
- [ ] Hacer clic en "Roles"
- [ ] Debe cargar `/admin/roles`
- [ ] Debe mostrar tabla de roles

#### Configuración (`/admin/settings`)
- [ ] Hacer clic en "Configuración"
- [ ] Debe cargar `/admin/settings`
- [ ] Debe mostrar opciones de configuración

#### Visor de Logs (`/admin/logs`)
- [ ] Hacer clic en "Logs"
- [ ] Debe cargar `/admin/logs`
- [ ] Debe mostrar tabla de logs

---

### 7. Verificar acceso directo por URL

#### Acceso directo a páginas
- [ ] Escribir `http://localhost:3003/dashboard` → Debe cargar
- [ ] Escribir `http://localhost:3003/keywords` → Debe cargar
- [ ] Escribir `http://localhost:3003/results` → Debe cargar
- [ ] Escribir `http://localhost:3003/reports` → Debe cargar
- [ ] Escribir `http://localhost:3003/surveys` → Debe cargar
- [ ] Escribir `http://localhost:3003/activities` → Debe cargar
- [ ] Escribir `http://localhost:3003/admin` → Debe cargar (si es admin)

---

### 8. Verificar protección de rutas

#### Sin autenticación
- [ ] Cerrar sesión
- [ ] Intentar acceder a `/dashboard`
- [ ] Debe redirigir a `/signin`
- [ ] Intentar acceder a `/admin`
- [ ] Debe redirigir a `/signin`

#### Usuario regular accediendo a Admin
- [ ] Crear usuario regular (no admin)
- [ ] Iniciar sesión con usuario regular
- [ ] Intentar acceder a `/admin`
- [ ] Debe redirigir a `/dashboard`

---

### 9. Verificar navegación en mobile

#### Menú móvil
- [ ] Abrir en navegador móvil o emulador
- [ ] Hacer clic en icono de menú
- [ ] Verificar que aparecen todas las opciones
- [ ] Hacer clic en cada opción
- [ ] Verificar que navega correctamente

#### Navbar en mobile
- [ ] Verificar que navbar es responsive
- [ ] Verificar que links son accesibles

---

### 10. Verificar logout

#### Cerrar sesión
- [ ] Hacer clic en "Cerrar Sesión"
- [ ] Debe redirigir a `/`
- [ ] Debe limpiar sesión
- [ ] Intentar acceder a `/dashboard`
- [ ] Debe redirigir a `/signin`

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Navegación pública
- [ ] Home funciona
- [ ] Links a signin/signup funcionan
- [ ] Redirecciones correctas

### Navegación panel de operaciones
- [ ] Menú lateral completo
- [ ] Menú móvil completo
- [ ] Navbar completo
- [ ] Todos los links funcionan

### Acceso a páginas
- [ ] Dashboard accesible
- [ ] Keywords accesible
- [ ] Results accesible
- [ ] Reports accesible
- [ ] Surveys accesible
- [ ] Activities accesible

### Navegación admin
- [ ] Admin visible para admins
- [ ] Admin no visible para usuarios regulares
- [ ] Todas las páginas admin accesibles
- [ ] Protección de rutas funciona

### Protección de rutas
- [ ] Sin autenticación redirige a signin
- [ ] Usuario regular no puede acceder a admin
- [ ] Logout funciona correctamente

### Responsive
- [ ] Desktop funciona
- [ ] Mobile funciona
- [ ] Tablet funciona

---

## 🐛 PROBLEMAS COMUNES

### Problema: Menú no aparece
**Solución:** Recargar página (Ctrl+F5)

### Problema: Links no funcionan
**Solución:** Verificar que la aplicación está corriendo en `http://localhost:3003`

### Problema: Admin no aparece
**Solución:** Verificar que el usuario tiene rol `admin` en Supabase

### Problema: Redirige a signin
**Solución:** Verificar que la sesión está activa

---

## 📞 SOPORTE

Si encuentras problemas:

1. Verificar que la aplicación está compilada: `npm run build`
2. Verificar que no hay errores en consola
3. Verificar que Supabase está conectado
4. Revisar documentación en `docs/desarrollo/`

---

**Generado por:** Amazon Q  
**Última actualización:** 2025-11-19
