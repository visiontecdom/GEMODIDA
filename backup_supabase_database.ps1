# Script PowerShell para backup de base de datos Supabase
# Requiere PostgreSQL client tools instalados

param(
    [string]$OutputDir = "./backups",
    [switch]$IncludeSystemSchemas,
    [switch]$Verbose
)

# Configuración de conexión desde variables de entorno
$DB_HOST = $env:DB_HOST ?? "aws-0-us-west-2.pooler.supabase.com"
$DB_PORT = $env:DB_PORT ?? "5432"
$DB_NAME = $env:DB_NAME ?? "postgres"
$DB_USER = $env:DB_USER ?? "postgres.divxhluqybbcgfqozbjq"
$DB_PASSWORD = $env:DB_PASSWORD ?? "Millonario##01"

# Crear nombre de archivo con timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = $OutputDir
$backupFile = "$backupDir\supabase_backup_$timestamp.sql"
$backupFileCompressed = "$backupDir\supabase_backup_$timestamp.backup"

# Crear directorio si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "🚀 Iniciando backup de base de datos Supabase..." -ForegroundColor Green
Write-Host "📅 Fecha: $(Get-Date)" -ForegroundColor Cyan
Write-Host "📁 Archivo: $backupFile" -ForegroundColor Cyan
Write-Host ""

# Función para manejar errores
function Write-ErrorAndExit {
    param([string]$message)
    Write-Host "❌ Error: $message" -ForegroundColor Red
    exit 1
}

# Verificar que pg_dump esté disponible
try {
    $pgDumpVersion = & pg_dump --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorAndExit "pg_dump no está instalado. Instala PostgreSQL client tools desde https://www.postgresql.org/download/"
    }
    Write-Host "✅ pg_dump encontrado: $($pgDumpVersion -split "`n")[0]" -ForegroundColor Green
} catch {
    Write-ErrorAndExit "pg_dump no está disponible en PATH. Instala PostgreSQL client tools."
}

# Configurar variable de entorno para contraseña
$env:PGPASSWORD = $DB_PASSWORD

# Excluir schemas del sistema de Supabase (a menos que se especifique lo contrario)
$excludeSchemas = @()
if (!$IncludeSystemSchemas) {
    $excludeSchemas = @(
        "--exclude-schema=graphile_worker",
        "--exclude-schema=graphql",
        "--exclude-schema=graphql_public",
        "--exclude-schema=net",
        "--exclude-schema=realtime",
        "--exclude-schema=supabase_functions",
        "--exclude-schema=pgbouncer",
        "--exclude-schema=pg_stat_statements",
        "--exclude-schema=pgsodium",
        "--exclude-schema=vault"
    )
    Write-Host "📋 Excluyendo schemas del sistema de Supabase..." -ForegroundColor Yellow
}

# Crear backup comprimido
Write-Host "📤 Creando backup comprimido..." -ForegroundColor Yellow

$pgDumpArgsCompressed = @(
    "--host=$DB_HOST",
    "--port=$DB_PORT",
    "--username=$DB_USER",
    "--dbname=$DB_NAME",
    "--no-password",
    "--verbose",
    "--format=custom",
    "--compress=9",
    "--file=$backupFileCompressed",
    "--blobs",
    "--clean",
    "--create",
    "--if-exists",
    "--no-owner",
    "--no-privileges"
) + $excludeSchemas

if ($Verbose) {
    & pg_dump $pgDumpArgsCompressed
} else {
    & pg_dump $pgDumpArgsCompressed 2>$null
}

if ($LASTEXITCODE -ne 0) {
    Write-ErrorAndExit "Error al crear backup comprimido"
}

$compressedSize = (Get-Item $backupFileCompressed).Length / 1MB
Write-Host "✅ Backup comprimido creado: $backupFileCompressed ($("{0:N2}" -f $compressedSize) MB)" -ForegroundColor Green

# Crear backup en formato SQL plano
Write-Host "📄 Creando backup en formato SQL plano..." -ForegroundColor Yellow

$pgDumpArgsPlain = @(
    "--host=$DB_HOST",
    "--port=$DB_PORT",
    "--username=$DB_USER",
    "--dbname=$DB_NAME",
    "--no-password",
    "--format=plain",
    "--file=$backupFile",
    "--blobs",
    "--clean",
    "--create",
    "--if-exists",
    "--no-owner",
    "--no-privileges"
) + $excludeSchemas

if ($Verbose) {
    & pg_dump $pgDumpArgsPlain
} else {
    & pg_dump $pgDumpArgsPlain 2>$null
}

if ($LASTEXITCODE -ne 0) {
    Write-ErrorAndExit "Error al crear backup SQL plano"
}

$plainSize = (Get-Item $backupFile).Length / 1MB
Write-Host "✅ Backup SQL plano creado: $backupFile ($("{0:N2}" -f $plainSize) MB)" -ForegroundColor Green

# Limpiar variable de entorno
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

# Crear script de restauración para PowerShell
$restoreScript = "$backupDir\restore_backup.ps1"
$restoreContent = @"
# Script para restaurar backup de Supabase en PostgreSQL local
param(
    [Parameter(Mandatory=`$true)]
    [string]`$BackupFile,
    [string]`$LocalHost = "localhost",
    [string]`$LocalPort = "5432",
    [string]`$LocalDbName = "gemodida_local",
    [string]`$LocalUser = "postgres",
    [string]`$LocalPassword = "tu_password_local"
)

Write-Host "🔄 Restaurando backup en PostgreSQL local..." -ForegroundColor Green
Write-Host "📁 Archivo: `$BackupFile" -ForegroundColor Cyan
Write-Host "🗄️  Base de datos: `$LocalDbName" -ForegroundColor Cyan
Write-Host ""

# Verificar que el archivo existe
if (!(Test-Path `$BackupFile)) {
    Write-Host "❌ Error: Archivo de backup no encontrado: `$BackupFile" -ForegroundColor Red
    exit 1
}

# Configurar variable de entorno
`$env:PGPASSWORD = `$LocalPassword

try {
    # Crear base de datos si no existe
    Write-Host "📦 Creando base de datos..." -ForegroundColor Yellow
    & createdb --host=`$LocalHost --port=`$LocalPort --username=`$LocalUser `$LocalDbName 2>`$null
    if (`$LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de datos creada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Base de datos ya existe o error al crear" -ForegroundColor Yellow
    }

    # Restaurar el backup
    Write-Host "📤 Restaurando datos..." -ForegroundColor Yellow
    & psql --host=`$LocalHost --port=`$LocalPort --username=`$LocalUser --dbname=`$LocalDbName --file=`$BackupFile --echo-errors --echo-queries

    if (`$LASTEXITCODE -eq 0) {
        Write-Host "" -ForegroundColor Green
        Write-Host "✅ Restauración completada!" -ForegroundColor Green
        Write-Host "🗄️  Base de datos: `$LocalDbName" -ForegroundColor Cyan
        Write-Host "" -ForegroundColor Green
        Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
        Write-Host "   1. Actualiza tu archivo .env.local con las credenciales locales" -ForegroundColor White
        Write-Host "   2. Ejecuta: npm run dev" -ForegroundColor White
        Write-Host "   3. Verifica que la aplicación funcione correctamente" -ForegroundColor White
    } else {
        Write-Host "❌ Error durante la restauración" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: `$_" -ForegroundColor Red
} finally {
    # Limpiar variable de entorno
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
"@

$restoreContent | Out-File -FilePath $restoreScript -Encoding UTF8

Write-Host "📝 Script de restauración creado: $restoreScript" -ForegroundColor Green

Write-Host "" -ForegroundColor Green
Write-Host "🎯 RESUMEN DEL BACKUP:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Backup comprimido: $backupFileCompressed ($("{0:N2}" -f $compressedSize) MB)" -ForegroundColor Green
Write-Host "✅ Backup SQL plano:   $backupFile ($("{0:N2}" -f $plainSize) MB)" -ForegroundColor Green
Write-Host "✅ Script restauración: $restoreScript" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "📋 INSTRUCCIONES PARA RESTAURAR LOCALMENTE:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1. Asegúrate de tener PostgreSQL instalado localmente" -ForegroundColor White
Write-Host "2. Crea una base de datos local (opcional, el script lo hace)" -ForegroundColor White
Write-Host "3. Ejecuta: .\backups\restore_backup.ps1 -BackupFile $backupFile" -ForegroundColor White
Write-Host "4. Actualiza las variables de entorno en .env.local" -ForegroundColor White
Write-Host "5. Ejecuta: npm run dev" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "🔒 NOTA DE SEGURIDAD:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
Write-Host "• Los archivos contienen datos sensibles" -ForegroundColor White
Write-Host "• No los subas a repositorios públicos" -ForegroundColor White
Write-Host "• Mantén backups en lugares seguros" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "🎉 Backup completado exitosamente!" -ForegroundColor Green