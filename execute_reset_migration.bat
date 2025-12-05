@echo off
echo 🚀 EJECUTANDO MIGRACIÓN DE RESET DE CONTRASEÑA
echo ===============================================
echo Proyecto: GEMODIDA
echo Fecha: %DATE% %TIME%
echo.

echo 📋 Ejecutando script SQL en Supabase...
npx supabase db execute db/Scripts_SQL/reset_password_functionality.sql --db-url "%SUPABASE_DB_URL%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ MIGRACIÓN COMPLETADA EXITOSAMENTE
    echo.
    echo 📋 PRÓXIMOS PASOS:
    echo 1. Descomentar el código en PasswordResetModal.tsx
    echo 2. Reiniciar el servidor de desarrollo
    echo 3. Probar la funcionalidad completa en http://localhost:3003/signin
) else (
    echo.
    echo ❌ ERROR EN LA MIGRACIÓN
    echo.
    echo 📋 INSTRUCCIONES MANUALES:
    echo 1. Ve a https://supabase.com/dashboard/project/divxhluqybbcgfqozbjq/sql
    echo 2. Crea un nuevo query
    echo 3. Copia y pega el contenido de db/Scripts_SQL/reset_password_functionality.sql
    echo 4. Ejecuta el query
)

echo.
pause