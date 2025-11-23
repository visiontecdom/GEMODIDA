# GEMODIDA - Technology Stack

## Runtime & Build Environment

### Node.js & Package Management
- **Node.js**: Latest LTS version
- **Package Manager**: npm (v10+)
- **Build Tool**: Next.js 16 with Turbopack

### Core Framework Versions
- **Next.js**: 16.0.3
- **React**: 19.2.0
- **React DOM**: 19.2.0
- **TypeScript**: 5.9.3

## Frontend Technologies

### UI Framework & Components
- **Tailwind CSS**: 4.x (with PostCSS)
- **Radix UI**: Headless component library
  - @radix-ui/react-dialog: 1.1.15
  - @radix-ui/react-alert-dialog: 1.1.15
  - @radix-ui/react-label: 2.1.8
  - @radix-ui/react-slot: 1.2.4
  - @radix-ui/react-toast: 1.2.15
- **Headless UI**: 2.2.9
- **Heroicons**: 2.2.0 (Icon library)
- **Lucide React**: 0.553.0 (Additional icons)

### Form & Validation
- **React Hook Form**: 7.66.0
- **Zod**: 4.1.12 (Schema validation)
- **@hookform/resolvers**: 5.2.2

### Data Visualization
- **Recharts**: 3.4.1 (Charts and graphs)

### Utilities
- **date-fns**: 4.1.0 (Date manipulation)
- **clsx**: 2.1.1 (Class name utilities)
- **tailwind-merge**: 3.4.0 (Tailwind class merging)
- **class-variance-authority**: 0.7.1 (Component variants)

### Theme & Styling
- **next-themes**: 0.4.6 (Dark mode support)
- **Autoprefixer**: 10.4.22
- **PostCSS**: 8.5.6

### PWA & Offline Support
- **next-pwa**: 5.6.0
- **Service Worker**: Custom implementation
- **Workbox**: Configuration included

### Image Optimization
- **Sharp**: 0.34.5 (Image processing)

## Backend & Database

### Backend Framework
- **Next.js API Routes**: Serverless functions
- **Node.js Runtime**: Edge and Node.js compatible

### Database & Authentication
- **Supabase**: PostgreSQL database + Auth
  - @supabase/supabase-js: 2.81.1
  - @supabase/auth-helpers-nextjs: 0.10.0
  - @supabase/auth-ui-react: 0.4.7
  - @supabase/auth-ui-shared: 0.1.8
  - @supabase/ssr: 0.7.0

### Database Drivers
- **pg**: 8.16.3 (PostgreSQL client)
- **postgres**: 3.4.7 (Alternative PostgreSQL driver)

### Custom Packages
- **@GEMODIDA/supabase-utils**: Local package for shared Supabase utilities

## Development Tools

### Linting & Code Quality
- **ESLint**: 9.x
- **eslint-config-next**: 16.0.3

### TypeScript Configuration
- **Target**: ES2017
- **Module**: ESNext
- **Strict Mode**: Enabled
- **Path Aliases**: @/* → ./src/*

### Build Configuration
- **Next.js Config**: next.config.ts (TypeScript)
- **Tailwind Config**: tailwind.config.js
- **PostCSS Config**: postcss.config.mjs
- **ESLint Config**: eslint.config.mjs

## Development Commands

### Available Scripts
```bash
npm run dev      # Start development server on port 3003
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Development Server
- **Port**: 3003 (custom configuration)
- **Hot Reload**: Enabled
- **Fast Refresh**: React Fast Refresh

## Environment Configuration

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
DATABASE_URL=<postgresql_connection_string>
```

### Configuration Files
- **.env.local**: Local environment variables
- **tsconfig.json**: TypeScript compiler options
- **next.config.ts**: Next.js configuration
- **tailwind.config.js**: Tailwind CSS configuration
- **postcss.config.mjs**: PostCSS plugins

## Database Schema

### PostgreSQL Features Used
- **Row-Level Security (RLS)**: Data protection
- **Custom Functions**: RPC endpoints
- **Triggers**: Automated data updates
- **Policies**: Access control

### Core Tables
- **usuarios**: User accounts
- **roles**: Role definitions with permissions
- **keywords**: Search keywords and configurations
- **results**: Scraped data and metadata
- **surveys**: Survey definitions
- **survey_responses**: Survey responses
- **activities**: Audit logs
- **reports**: Generated reports

### RPC Functions
- **get_user_data()**: Fetch user information
- **get_keywords()**: List keywords
- **create_keyword()**: Add new keyword
- **get_results()**: Fetch results
- **get_surveys()**: List surveys
- **get_activities()**: Fetch activity logs

## Performance Optimizations

### Built-in Next.js Features
- **Image Optimization**: Sharp integration
- **Code Splitting**: Automatic route-based splitting
- **CSS Optimization**: Tailwind purging
- **Font Optimization**: next/font support

### Caching Strategies
- **Circuit Breaker Pattern**: Implemented in utils
- **Database Query Optimization**: RLS policies
- **Client-side Caching**: React hooks state

## Security Features

### Authentication
- **Supabase Auth**: Email/password + OAuth
- **Session Management**: SSR-compatible
- **Protected Routes**: ProtectedRoute component

### Authorization
- **Row-Level Security**: PostgreSQL RLS
- **Role-Based Access Control**: Custom roles
- **API Route Protection**: Middleware validation

### Data Protection
- **HTTPS**: Required in production
- **Environment Variables**: Sensitive data isolation
- **Type Safety**: TypeScript strict mode

## Deployment Considerations

### Build Output
- **Next.js Standalone**: Optimized for deployment
- **Static Export**: Supported for static pages
- **API Routes**: Serverless-compatible

### Hosting Options
- **Vercel**: Native Next.js support
- **Docker**: Containerization ready
- **Node.js Servers**: Standard deployment

### Database Deployment
- **Supabase Cloud**: Managed PostgreSQL
- **Self-hosted PostgreSQL**: Custom deployment

## Development Workflow

### Code Organization
- **Modular Components**: Feature-based structure
- **Custom Hooks**: Reusable logic
- **Shared Utilities**: Common functions
- **Type Definitions**: Centralized types

### Testing Infrastructure
- **Test Files**: Located in temp-tests/
- **Manual Testing**: Scripts available
- **Integration Testing**: Supabase connection tests

### Version Control
- **Git**: Standard version control
- **Commit Scripts**: PowerShell automation available
- **Branch Strategy**: Feature-based development

## Monorepo Structure

### Packages
- **Main App**: GEMODIDA (Next.js application)
- **Shared Utils**: @GEMODIDA/supabase-utils
  - Location: packages/supabase-utils/
  - Shared Supabase utilities and helpers

### Package Dependencies
- Main app depends on @GEMODIDA/supabase-utils
- Shared utilities exported for reuse
- Local package resolution via file: protocol

## Tailwind CSS Configuration

### Plugins
- @tailwindcss/forms: Form styling
- @tailwindcss/typography: Typography utilities
- @tailwindcss/aspect-ratio: Aspect ratio utilities

### Features
- Dark mode support (via next-themes)
- Custom color schemes
- Responsive design utilities
- Animation and transition support

## TypeScript Configuration

### Compiler Options
- **Target**: ES2017
- **Lib**: DOM, DOM.iterable, ESNext
- **Module**: ESNext
- **Strict**: true
- **JSX**: react-jsx
- **Path Aliases**: @/* → ./src/*

### Type Definitions
- **Generated Types**: database.types.ts from Supabase
- **Custom Types**: next-themes.d.ts
- **Global Types**: Included in tsconfig

## Build & Deployment Pipeline

### Build Process
1. TypeScript compilation
2. ESLint validation
3. Next.js build optimization
4. Static asset generation
5. Standalone output creation

### Development Workflow
1. Start dev server: `npm run dev`
2. Edit files with hot reload
3. TypeScript type checking
4. ESLint validation
5. Browser preview on localhost:3003
