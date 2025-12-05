# 🏗️ ARQUITECTURA DE GEMODIDA

## Visión General

GEMODIDA es una aplicación web de scraping y gestión de datos construida con Next.js, React y Supabase.

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente (Browser)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React 19 + TypeScript + Tailwind CSS + Radix UI    │   │
│  │  - Componentes reutilizables                        │   │
│  │  - Hooks personalizados                             │   │
│  │  - State management con useState/useRef             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 16 (App Router)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Páginas (SSR/SSG)                                  │   │
│  │  - /admin/* (Panel de administración)               │   │
│  │  - /keywords (Gestión de palabras clave)            │   │
│  │  - /results (Resultados de scraping)                │   │
│  │  - /reports (Reportes)                              │   │
│  │  - /surveys (Encuestas)                             │   │
│  │  - /activities (Actividades)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes                                         │   │
│  │  - /api/scraping/* (Scraping simulado)              │   │
│  │  - /api/notifications/* (Notificaciones)            │   │
│  │  - /api/reports/* (Generación de reportes)          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                │   │
│  │  - usuarios (Usuarios del sistema)                  │   │
│  │  - roles (Roles y permisos)                         │   │
│  │  - keywords (Palabras clave)                        │   │
│  │  - resultados (Resultados de scraping)             │   │
│  │  - surveys (Encuestas)                              │   │
│  │  - activities (Actividades)                         │   │
│  │  - reportes (Reportes generados)                    │   │
│  │  - logs (Logs del sistema)                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RPC Functions                                      │   │
│  │  - obtener_estadisticas_dashboard()                 │   │
│  │  - obtener_usuarios_activos()                       │   │
│  │  - obtener_palabras_clave_recientes()               │   │
│  │  - obtener_resultados_recientes()                   │   │
│  │  - obtener_reportes_pendientes()                    │   │
│  │  - obtener_alertas_activas()                        │   │
│  │  - obtener_usuarios()                               │   │
│  │  - obtener_palabras_clave_todas()                   │   │
│  │  - obtener_resultados_todos()                       │   │
│  │  - obtener_reportes_todos()                         │   │
│  │  - obtener_logs_todos()                             │   │
│  │  - contar_registros()                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Row Level Security (RLS)                           │   │
│  │  - Políticas de acceso por usuario                  │   │
│  │  - Políticas de acceso por rol                      │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication                                     │   │
│  │  - Email/Password                                   │   │
│  │  - OAuth (Google, GitHub)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Estructura de Carpetas

```
src/
├── app/                    # Páginas y rutas
│   ├── admin/             # Panel de administración
│   ├── keywords/          # Gestión de palabras clave
│   ├── results/           # Resultados
│   ├── reports/           # Reportes
│   ├── surveys/           # Encuestas
│   ├── activities/        # Actividades
│   ├── api/               # API routes
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React
│   ├── admin/            # Componentes admin
│   ├── auth/             # Componentes de autenticación
│   ├── keywords/         # Componentes de palabras clave
│   ├── shared/           # Componentes reutilizables
│   └── ui/               # Componentes UI (Radix)
├── hooks/                # Hooks personalizados
│   ├── useAuth.tsx       # Autenticación
│   ├── useKeywords.ts    # Palabras clave
│   ├── useResults.ts     # Resultados
│   ├── useReports.ts     # Reportes
│   ├── useSurveys.ts     # Encuestas
│   ├── useActivities.ts  # Actividades
│   ├── useUsers.ts       # Usuarios
│   ├── useRoles.ts       # Roles
│   ├── useLogs.ts        # Logs
│   ├── useCache.ts       # Caché
│   └── usePagination.ts  # Paginación
├── lib/                  # Utilidades
│   ├── supabase/         # Cliente Supabase
│   ├── utils/            # Funciones utilitarias
│   │   ├── permissions.ts    # Permisos
│   │   ├── validation.ts     # Validación
│   │   ├── error-handler.ts  # Manejo de errores
│   │   └── circuit-breaker.ts # Circuit breaker
│   └── middleware/       # Middleware
│       └── auth.ts       # Autenticación
├── providers/            # Providers de contexto
└── types/               # Tipos TypeScript
```

## Flujo de Datos

### Autenticación

```
Usuario → Página de Login → Supabase Auth → JWT Token → LocalStorage
                                    ↓
                            useAuth Hook
                                    ↓
                            Componentes Protegidos
```

### Obtención de Datos

```
Componente → Hook (useKeywords, etc.) → Supabase RPC → Cache → Estado Local
                                              ↓
                                        Row Level Security
                                              ↓
                                        Datos Filtrados
```

### Creación/Actualización de Datos

```
Formulario → Validación (Zod) → API Route → Supabase → RLS Check → BD
                                    ↓
                            Respuesta al Cliente
                                    ↓
                            Actualizar Estado Local
```

## Patrones de Diseño

### 1. Custom Hooks
Encapsulan lógica de negocio y estado.

```typescript
const { keywords, loading, addKeyword } = useKeywords();
```

### 2. Componentes Reutilizables
Componentes genéricos que se usan en múltiples lugares.

```typescript
<DataTable columns={columns} data={data} loading={loading} />
```

### 3. Validación con Zod
Esquemas de validación tipados.

```typescript
const schema = z.object({ email: z.string().email() });
```

### 4. Protección de Rutas
Componentes que verifican autenticación y autorización.

```typescript
<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### 5. Caché de Datos
Hook para cachear datos con TTL.

```typescript
const { data } = useCache('key', fetcher, 5 * 60 * 1000);
```

## Seguridad

### Autenticación
- Supabase Auth con JWT
- Tokens almacenados en localStorage
- Refresh automático de tokens

### Autorización
- Row Level Security (RLS) en BD
- Validación de permisos en cliente
- Validación de permisos en servidor

### Validación
- Validación en cliente con Zod
- Validación en servidor en API routes
- Sanitización de inputs

### Protección de API
- Middleware de autenticación
- Validación de permisos
- Rate limiting (futuro)

## Performance

### Optimizaciones
- Caché de datos con TTL
- Paginación de resultados
- Lazy loading de componentes
- Code splitting automático
- Compresión de assets

### Monitoreo
- Logs de errores
- Métricas de performance
- Diagnóstico de problemas

## Escalabilidad

### Horizontal
- Stateless API routes
- Caché distribuido (futuro)
- CDN para assets estáticos

### Vertical
- Índices en BD
- Optimización de queries
- Caché de resultados

## Mantenibilidad

### Código
- TypeScript para type safety
- ESLint para code quality
- Componentes pequeños y enfocados
- Documentación inline

### Testing
- Tests unitarios
- Tests de integración
- Tests e2e (futuro)

## Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t GEMODIDA .
docker run -p 3000:3000 GEMODIDA
```

## Monitoreo y Logging

### Logs
- Logs de aplicación
- Logs de BD
- Logs de API

### Métricas
- Tiempo de respuesta
- Tasa de errores
- Uso de recursos

## Futuras Mejoras

1. Implementar WebSockets para actualizaciones en tiempo real
2. Agregar caché distribuido (Redis)
3. Implementar rate limiting
4. Agregar tests e2e
5. Implementar CI/CD
6. Agregar monitoreo avanzado
7. Implementar backup automático
8. Agregar versionado de API
