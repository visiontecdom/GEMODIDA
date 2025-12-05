#!/bin/bash

# Script para hacer backup de la base de datos Supabase PostgreSQL
# y descargarla en formato SQL para uso local

# Configuración de conexión desde variables de entorno
DB_HOST="aws-0-us-west-2.pooler.supabase.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.divxhluqybbcgfqozbjq"
DB_PASSWORD="Millonario##01"

# Nombre del archivo de backup
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/supabase_backup_$(date +%Y%m%d_%H%M%S).sql"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "🚀 Iniciando backup de base de datos Supabase..."
echo "📅 Fecha: $(date)"
echo "📁 Archivo: $BACKUP_FILE"
echo ""

# Función para manejar errores
handle_error() {
    echo "❌ Error: $1"
    exit 1
}

# Verificar que pg_dump esté disponible
if ! command -v pg_dump &> /dev/null; then
    handle_error "pg_dump no está instalado. Instala PostgreSQL client tools."
fi

# Crear el backup usando pg_dump
echo "📤 Creando backup completo de la base de datos..."

PGPASSWORD="$DB_PASSWORD" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --no-password \
    --verbose \
    --format=custom \
    --compress=9 \
    --file="$BACKUP_FILE.backup" \
    --blobs \
    --clean \
    --create \
    --if-exists \
    --no-owner \
    --no-privileges \
    --exclude-schema="graphile_worker" \
    --exclude-schema="graphql" \
    --exclude-schema="graphql_public" \
    --exclude-schema="net" \
    --exclude-schema="realtime" \
    --exclude-schema="supabase_functions" \
    --exclude-schema="pgbouncer" \
    --exclude-schema="pg_stat_statements" \
    --exclude-schema="pgsodium" \
    --exclude-schema="vault" \
    2>&1 || handle_error "Error al crear backup comprimido"

echo "✅ Backup comprimido creado: $BACKUP_FILE.backup"

# También crear una versión en formato SQL plano para fácil inspección
echo "📄 Creando versión en formato SQL plano..."

PGPASSWORD="$DB_PASSWORD" pg_dump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --username="$DB_USER" \
    --dbname="$DB_NAME" \
    --no-password \
    --format=plain \
    --file="$BACKUP_FILE" \
    --blobs \
    --clean \
    --create \
    --if-exists \
    --no-owner \
    --no-privileges \
    --exclude-schema="graphile_worker" \
    --exclude-schema="graphql" \
    --exclude-schema="graphql_public" \
    --exclude-schema="net" \
    --exclude-schema="realtime" \
    --exclude-schema="supabase_functions" \
    --exclude-schema="pgbouncer" \
    --exclude-schema="pg_stat_statements" \
    --exclude-schema="pgsodium" \
    --exclude-schema="vault" \
    2>&1 || handle_error "Error al crear backup SQL plano"

echo "✅ Backup SQL plano creado: $BACKUP_FILE"

# Obtener información del backup
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.backup" | cut -f1)

echo ""
echo "📊 Información del backup:"
echo "   Tamaño SQL plano: $BACKUP_SIZE"
echo "   Tamaño comprimido: $COMPRESSED_SIZE"
echo "   Ubicación: $BACKUP_DIR"
echo ""

# Crear script de restauración
RESTORE_SCRIPT="$BACKUP_DIR/restore_backup.sh"
cat > "$RESTORE_SCRIPT" << 'EOF'
#!/bin/bash

# Script para restaurar backup de Supabase en PostgreSQL local
# Uso: ./restore_backup.sh [archivo_backup.sql]

set -e

# Configuración para PostgreSQL local (ajusta según tu configuración)
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="gemodida_local"
LOCAL_DB_USER="postgres"
LOCAL_DB_PASSWORD="tu_password_local"

# Archivo de backup
BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: Debes especificar el archivo de backup"
    echo "Uso: $0 <archivo_backup.sql>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Archivo de backup no encontrado: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restaurando backup en PostgreSQL local..."
echo "📁 Archivo: $BACKUP_FILE"
echo "🗄️  Base de datos: $LOCAL_DB_NAME"
echo ""

# Crear base de datos si no existe
echo "📦 Creando base de datos..."
PGPASSWORD="$LOCAL_DB_PASSWORD" createdb \
    --host="$LOCAL_DB_HOST" \
    --port="$LOCAL_DB_PORT" \
    --username="$LOCAL_DB_USER" \
    "$LOCAL_DB_NAME" 2>/dev/null || echo "⚠️  Base de datos ya existe"

# Restaurar el backup
echo "📤 Restaurando datos..."
PGPASSWORD="$LOCAL_DB_PASSWORD" psql \
    --host="$LOCAL_DB_HOST" \
    --port="$LOCAL_DB_PORT" \
    --username="$LOCAL_DB_USER" \
    --dbname="$LOCAL_DB_NAME" \
    --file="$BACKUP_FILE" \
    --echo-errors \
    --echo-queries \
    2>&1

echo ""
echo "✅ Restauración completada!"
echo "🗄️  Base de datos: $LOCAL_DB_NAME"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Actualiza tu archivo .env.local con las credenciales locales"
echo "   2. Ejecuta: npm run dev"
echo "   3. Verifica que la aplicación funcione correctamente"
EOF

chmod +x "$RESTORE_SCRIPT"

echo "📝 Script de restauración creado: $RESTORE_SCRIPT"
echo ""
echo "🎯 RESUMEN DEL BACKUP:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Backup comprimido: $BACKUP_FILE.backup ($COMPRESSED_SIZE)"
echo "✅ Backup SQL plano:   $BACKUP_FILE ($BACKUP_SIZE)"
echo "✅ Script restauración: $RESTORE_SCRIPT"
echo ""
echo "📋 INSTRUCCIONES PARA RESTAURAR LOCALMENTE:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Asegúrate de tener PostgreSQL instalado localmente"
echo "2. Crea una base de datos local (opcional, el script lo hace)"
echo "3. Ejecuta: ./backups/restore_backup.sh $BACKUP_FILE"
echo "4. Actualiza las variables de entorno en .env.local"
echo "5. Ejecuta: npm run dev"
echo ""
echo "🔒 NOTA DE SEGURIDAD:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "• Los archivos contienen datos sensibles"
echo "• No los subas a repositorios públicos"
echo "• Mantén backups en lugares seguros"
echo ""
echo "🎉 Backup completado exitosamente!"