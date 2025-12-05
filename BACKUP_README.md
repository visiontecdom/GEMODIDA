Aqu赤 tienes la versi車n corregida del texto, completamente en espa?ol:

# Gu赤a de Backup de Base de Datos Supabase

Esta gu赤a explica c車mo crear backups de tu base de datos Supabase y restaurarlos localmente para desarrollo.

## Scripts Disponibles

### 1. `backup_supabase_database.sh` (Bash - Linux/Mac)
Script principal que usa `pg_dump` para crear backups comprimidos y en formato SQL plano.

### 2. `backup_supabase_database.ps1` (PowerShell - Windows)
Versi車n para Windows del script principal usando PowerShell.

### 3. `backup_supabase_nodejs.js` (Node.js - Multiplataforma)
Script alternativo que no requiere `pg_dump` instalado, usa la librer赤a `pg` directamente.

## C車mo Ejecutar los Backups

### Opci車n 1: Script Bash (Linux/Mac)
```bash
chmod +x backup_supabase_database.sh
./backup_supabase_database.sh
```

### Opci車n 2: Script PowerShell (Windows)
```powershell
.\backup_supabase_database.ps1
```

### Opci車n 3: Script Node.js (Multiplataforma)
```bash
node backup_supabase_nodejs.js
```

## Archivos Generados

Despu谷s de ejecutar cualquier script, se crear芍n los siguientes archivos en la carpeta `backups/`:

- `supabase_backup_YYYYMMDD_HHMMSS.sql` - Backup en formato SQL plano
- `supabase_backup_YYYYMMDD_HHMMSS.backup` - Backup comprimido (solo en scripts Bash/PowerShell)
- `restore_backup.sh` / `restore_backup.ps1` / `restore_backup_YYYYMMDD_HHMMSS.js` - Script de restauraci車n

## Restauraci車n Local

### Paso 1: Instalar PostgreSQL Local
- **Windows**: Descarga desde https://www.postgresql.org/download/windows/
- **Linux**: `sudo apt install postgresql postgresql-contrib`
- **Mac**: `brew install postgresql`

### Paso 2: Crear Base de Datos Local
```sql
CREATE DATABASE gemodida_local;
```

### Paso 3: Ejecutar Script de Restauraci車n

#### Para Bash:
```bash
chmod +x backups/restore_backup.sh
./backups/restore_backup.sh
```

#### Para PowerShell:
```powershell
.\backups\restore_backup.ps1 -BackupFile "backups\supabase_backup_YYYYMMDD_HHMMSS.sql"
```

#### Para Node.js:
```bash
node backups/restore_backup_YYYYMMDD_HHMMSS.js
```

### Paso 4: Actualizar Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```env
# Base de datos local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gemodida_local
DB_USER=postgres
DB_PASSWORD=tu_password_local

# Desactiva SSL para desarrollo local
DB_SSL=false
```

### Paso 5: Ejecutar la Aplicaci車n
```bash
npm run dev
```

## Configuraci車n Personalizada

### Variables de Entorno para Scripts
Los scripts usan credenciales hardcodeadas, pero puedes modificarlos para usar variables de entorno:

```bash
# Para scripts Bash
export SUPABASE_DB_HOST="tu_host"
export SUPABASE_DB_PASSWORD="tu_password"
./backup_supabase_database.sh
```

### Opciones del Script PowerShell
```powershell
# Backup con opciones personalizadas
.\backup_supabase_database.ps1 -OutputDir "./mi_backup" -IncludeSystemSchemas -Verbose
```

### Opciones del Script Node.js
El script Node.js se puede modificar directamente en el c車digo para cambiar la configuraci車n.

## Lo que se Incluye en el Backup

### Datos Incluidos
- Todas las tablas de usuario (excluyendo schemas del sistema)
- Datos de todas las tablas
- Funciones personalizadas
- 赤ndices y constraints
- Secuencias

### Datos Excluidos
- Schemas del sistema de Supabase:
  - `graphile_worker`
  - `graphql`, `graphql_public`
  - `net`
  - `realtime`
  - `supabase_functions`
  - `pgbouncer`
  - `pg_stat_statements`
  - `pgsodium`
  - `vault`

## Consideraciones de Seguridad

- **Nunca subas los archivos de backup a repositorios p迆blicos**
- Los archivos contienen datos sensibles, incluyendo contrase?as hasheadas
- Mant谷n los backups en lugares seguros y encriptados
- Considera usar herramientas de backup en la nube con encriptaci車n

## Soluci車n de Problemas

### Error: "pg_dump no encontrado"
- Instala PostgreSQL client tools
- En Ubuntu/Debian: `sudo apt install postgresql-client`
- En macOS: `brew install postgresql`
- En Windows: Incluye en PATH durante instalaci車n

### Error: "Conexi車n rechazada"
- Verifica las credenciales en el script
- Aseg迆rate de que las IPs est谷n permitidas en Supabase
- Revisa la conexi車n a internet

### Error: "Base de datos no existe" (al restaurar)
- Crea la base de datos manualmente: `createdb gemodida_local`
- O el script de restauraci車n lo har芍 autom芍ticamente

### Error: "Permisos insuficientes"
- Aseg迆rate de tener permisos de escritura en la carpeta actual
- En Linux/Mac: `chmod 755 backup_supabase_database.sh`

## Automatizaci車n

### Cron Job (Linux/Mac)
```bash
# Backup diario a las 2 AM
0 2 * * * /ruta/a/tu/proyecto/backup_supabase_database.sh
```

### Programador de Tareas (Windows)
1. Abre "Programador de Tareas"
2. Crea nueva tarea b芍sica
3. Programa para ejecutarse diariamente
4. Acci車n: Ejecutar programa
5. Programa: `powershell.exe`
6. Argumentos: `-File "D:\Proyectos\Web\GEMODIDA\backup_supabase_database.ps1"`

## Soporte

Si encuentras problemas:
1. Revisa los logs de error en la consola
2. Verifica la conexi車n a Supabase
3. Confirma que tienes permisos adecuados
4. Consulta la documentaci車n de Supabase sobre backups

---

**Nota**: Estos scripts est芍n configurados espec赤ficamente para el proyecto GEMODIDA. Modifica las credenciales y configuraci車n seg迆n tus necesidades.
