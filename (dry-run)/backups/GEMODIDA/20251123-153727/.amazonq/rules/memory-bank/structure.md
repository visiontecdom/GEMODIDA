# GEMODIDA - Project Structure

## Directory Organization

```
GEMODIDA/
├── src/
│   ├── app/                    # Next.js App Router pages and layouts
│   │   ├── activities/         # Activity tracking page
│   │   ├── admin/              # Admin panel with sub-routes
│   │   │   ├── logs/           # System logs page
│   │   │   ├── roles/          # Role management page
│   │   │   ├── settings/       # System settings page
│   │   │   ├── users/          # User management page
│   │   │   ├── layout.tsx      # Admin layout wrapper
│   │   │   └── page.tsx        # Admin dashboard
│   │   ├── api/                # API routes
│   │   │   ├── notifications/  # Notification endpoints
│   │   │   ├── reports/        # Report generation endpoints
│   │   │   └── scraping/       # Scraping operation endpoints
│   │   ├── dashboard/          # Main dashboard
│   │   ├── keywords/           # Keyword management
│   │   ├── reports/            # Reports page
│   │   ├── results/            # Results browsing
│   │   ├── signin/             # Login page
│   │   ├── signup/             # Registration page
│   │   ├── surveys/            # Survey management
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   │
│   ├── components/             # Reusable React components
│   │   ├── admin/              # Admin-specific components
│   │   │   └── DataTable.tsx   # Generic data table
│   │   ├── auth/               # Authentication components
│   │   │   ├── AuthForm.tsx    # Login/signup form
│   │   │   └── ProtectedRoute.tsx # Route protection
│   │   ├── keywords/           # Keyword management components
│   │   │   ├── KeywordForm.tsx # Keyword form
│   │   │   └── KeywordsList.tsx # Keywords list
│   │   ├── layout/             # Layout components
│   │   │   ├── MainLayout.tsx  # Main app layout
│   │   │   └── Navbar.tsx      # Navigation bar
│   │   ├── shared/             # Shared reusable components
│   │   │   ├── ChartCard.tsx   # Chart wrapper
│   │   │   ├── ConfirmDialog.tsx # Confirmation dialog
│   │   │   ├── DataTable.tsx   # Data table component
│   │   │   ├── FilterBar.tsx   # Filter controls
│   │   │   ├── FormDialog.tsx  # Form dialog wrapper
│   │   │   └── StatCard.tsx    # Statistics card
│   │   ├── ui/                 # Radix UI primitives
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── table.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── use-toast.ts    # Toast hook
│   │   ├── DiagnosticLogger.tsx # Debug logging component
│   │   ├── InstallPWA.jsx      # PWA installation
│   │   ├── PWAHead.jsx         # PWA metadata
│   │   └── ServiceWorker.jsx   # Service worker setup
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useActivities.ts    # Activity data fetching
│   │   ├── useAuth.tsx         # Authentication state
│   │   ├── useDashboardStats.ts # Dashboard statistics
│   │   ├── useKeywords.ts      # Keyword operations
│   │   ├── useLogs.ts          # System logs
│   │   ├── useReports.ts       # Report generation
│   │   ├── useResults.ts       # Results data
│   │   ├── useRoles.ts         # Role management
│   │   ├── useSurveys.ts       # Survey operations
│   │   └── useUsers.ts         # User management
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase integration
│   │   │   ├── client.ts       # Client-side Supabase
│   │   │   ├── config.ts       # Configuration
│   │   │   ├── database.types.ts # Generated types
│   │   │   ├── server.ts       # Server-side Supabase
│   │   │   └── singleton.ts    # Singleton instance
│   │   ├── utils/              # Utility functions
│   │   │   └── circuit-breaker.ts # Circuit breaker pattern
│   │   └── utils.ts            # General utilities
│   │
│   ├── providers/              # React context providers
│   │   └── theme-provider.tsx  # Theme context
│   │
│   ├── scripts/                # Utility scripts
│   │   ├── test-auth.ts        # Auth testing
│   │   └── test-supabase-connection.ts # DB testing
│   │
│   └── types/                  # TypeScript type definitions
│       └── next-themes.d.ts    # Theme types
│
├── packages/                   # Monorepo packages
│   └── supabase-utils/         # Shared Supabase utilities
│       └── src/
│
├── db/                         # Database files
│   ├── esquema/                # Database schema definitions
│   │   ├── GEMODIDA_ESQUEMA_BD.sql
│   │   ├── GEMODIDA_FUNCIONES_PUB.sql
│   │   ├── GEMODIDA_POLITICAS_RLS.sql
│   │   └── GEMODIDA_DATOS_TABLAS.json
│   └── scripts_sql/            # SQL migration scripts
│       ├── 01_initial_schema.sql
│       ├── 02_functions.sql
│       ├── 05_fix_functions_and_rls.sql
│       ├── 06_funciones_rpc_datos_reales.sql
│       ├── 07_tablas_faltantes.sql
│       ├── 08_funciones_rpc_surveys.sql
│       └── 09_funciones_rpc_activities.sql
│
├── public/                     # Static assets
│   ├── icons/                  # PWA icons
│   ├── imgs/                   # Logo and images
│   ├── manifest/               # PWA manifest
│   ├── favicon.ico
│   └── sw.js                   # Service worker
│
├── docs/                       # Documentation
│   ├── desarrollo/             # Development docs
│   │   ├── FASE_1_COMPILACION_COMPLETADA.md
│   │   ├── FASE_2_BASE_DATOS.md
│   │   ├── FASE_3_PANELES_FORMULARIOS.md
│   │   ├── PLAN_ESTRATEGICO_COMPLETO.md
│   │   └── PLAN_IMPLEMENTACION_COMPLETO.md
│   └── Historial_Desarrollo_GEMODIDA.md
│
├── scripts/                    # Utility scripts
│   ├── create-supabase-user.js
│   ├── find-user-in-db.js
│   ├── generate-pwa-assets.js
│   └── test-supabase-admin.js
│
├── temp-tests/                 # Temporary test files
│   ├── test-auth.js
│   ├── test-db-connection.js
│   ├── test-supabase-connection.js
│   └── setup-auth.js
│
├── Errores/                    # Error logs and diagnostics
│
├── Configuration Files
│   ├── package.json            # Dependencies and scripts
│   ├── tsconfig.json           # TypeScript configuration
│   ├── next.config.ts          # Next.js configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   ├── postcss.config.mjs      # PostCSS config
│   ├── eslint.config.mjs       # ESLint configuration
│   └── .env.local              # Environment variables
│
└── Documentation Files
    ├── README.md               # Project README
    ├── PROGRESO_IMPLEMENTACION.md # Implementation progress
    ├── PLAN_IMPLEMENTACION_PASO_A_PASO.md
    └── POLITICAS_DESARROLLO_GEMODIDA.md
```

## Core Components & Relationships

### Authentication Flow
```
AuthForm → useAuth hook → Supabase Auth → Protected Routes
```

### Data Flow
```
Pages → Custom Hooks (useKeywords, useResults, etc.) → Supabase Client → Database
```

### Component Hierarchy
```
RootLayout
├── ThemeProvider
├── MainLayout
│   ├── Navbar
│   └── Page Content
│       ├── Shared Components (DataTable, FormDialog, etc.)
│       └── Feature-Specific Components
```

### API Routes Structure
```
/api/
├── scraping/
│   ├── simulate/    → POST: Simulate scraping
│   └── status/      → GET: Check scraping status
├── reports/
│   └── generate/    → POST: Generate reports
└── notifications/
    └── send/        → POST: Send notifications
```

## Architectural Patterns

### 1. Custom Hooks Pattern
- Encapsulate data fetching and state management
- Reusable across components
- Examples: useKeywords, useResults, useAuth

### 2. Shared Component Pattern
- Generic, reusable UI components
- Located in `components/shared/`
- Examples: DataTable, FormDialog, StatCard

### 3. Layout Pattern
- Nested layouts for different sections
- Admin layout, Dashboard layout
- Consistent navigation and styling

### 4. API Route Pattern
- Modular API endpoints
- Organized by feature
- Server-side logic separation

### 5. Supabase Integration Pattern
- Client and server instances
- Singleton pattern for consistency
- Type-safe database operations

## Key Technologies & Integration Points

### Frontend Stack
- **Next.js 16**: App Router, SSR, API routes
- **React 19**: Component framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Accessible components

### Backend Stack
- **Supabase**: PostgreSQL database + Auth
- **Next.js API Routes**: Serverless functions
- **RLS Policies**: Row-level security

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PWA**: Progressive Web App support
- **Service Worker**: Offline capabilities

## Data Models

### Core Tables
- **usuarios**: User accounts
- **roles**: Role definitions
- **keywords**: Search keywords
- **results**: Scraped data
- **surveys**: Survey definitions
- **survey_responses**: Survey answers
- **activities**: Audit logs
- **reports**: Generated reports

### Relationships
- Users → Roles (many-to-one)
- Keywords → Results (one-to-many)
- Surveys → Responses (one-to-many)
- Users → Activities (one-to-many)
