# Copilot Instructions for GEMODIDA

## Project Overview
- GEMODIDA is a modern, responsive web application (Next.js/React/Node.js) with PWA features and dynamic pages.
- The workspace root is `D:/Proyectos/Web/GEMODIDA/`.
- Environment variables are set in `.env.local` and are essential for configuration.

## Architecture & Data Flow
- Database schema uses prefixed tables (e.g., `usuarios_roles`, `usuarios_grupos`, `usuarios_perfiles`, `asignaciones_usuario`, `sucursales`).
- TypeScript types for DB are defined in `src/lib/supabase/database.types.ts`.
- Role and permission logic is handled in `src/hooks/useRoles.ts`.
- Email provider management is implemented with flexible JSONB config in the `email_providers` table and managed via UI (`EmailProvidersManager.tsx`) and backend API (`/api/send-reset-email`).

## Developer Workflows
- **Development:**
  - Start with `npm run dev` (Next.js standard).
  - Edit main pages in `app/page.tsx`.
- **Database Migrations:**
  - Migration scripts are in `db/scripts_sql/` and `db/migration_scripts/`.
  - Always backup before running migrations (see `MIGRATION_EXECUTION_GUIDE.md`).
  - Use Supabase SQL Editor for manual execution or scripts for automation.
- **Testing:**
  - Test email providers with scripts like `test_email_providers.js`, `test_smtp_empresarial.js`, etc.
  - Migration testing steps are detailed in `MIGRATION_TESTING_GUIDE.md`.
- **Backup:**
  - Use provided scripts (`backup_supabase_database.ps1`, `.sh`, `.js`) for DB backups.

## Conventions & Patterns
- Always check for existing tables/functions before DB changes to avoid duplicates.
- Folder/file names may vary in case; ignore case sensitivity when searching.
- Document every change and compare with latest backups before major edits.
- UI and API changes should be validated visually and functionally after each step.
- Use small, controlled refactors and validate after each change.

## Integration Points
- Email system supports SMTP, Gmail OAuth2, SendGrid, etc. Configure via `.env.local` and DB.
- Only admins can manage email providers (RLS enabled).
- API endpoints and UI components are tightly coupled to DB config for dynamic provider selection.

## Key Files & Directories
- `src/lib/supabase/database.types.ts` — DB types
- `src/hooks/useRoles.ts` — Role logic
- `db/scripts_sql/`, `db/migration_scripts/` — Migration scripts
- `EMAIL_PROVIDERS_README.md`, `EMAIL_PROVIDERS_IMPLEMENTATION_SUMMARY.md` — Email system docs
- `MIGRATION_EXECUTION_GUIDE.md`, `MIGRATION_TESTING_GUIDE.md` — Migration workflow
- `.env.local` — Environment config

## Example: Adding a New Email Provider
1. Update `email_providers` table via migration script.
2. Add provider config in admin UI.
3. Test with `test_email_providers.js`.
4. Validate via `/api/send-reset-email` and check logs.

---
For further details, see referenced markdown guides and scripts. Ask for clarification if any workflow or pattern is unclear or missing.
