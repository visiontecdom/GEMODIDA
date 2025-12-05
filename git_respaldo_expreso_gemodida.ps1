# Script de respaldo expreso para GEMODIDA
# Ejecuta: git add ., git commit con timestamp, git push

Write-Host "🚀 Iniciando respaldo expreso de GEMODIDA..." -ForegroundColor Green

# Obtener timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Cyan

# Verificar si hay cambios
$status = git status --porcelain
if ($status -eq "") {
    Write-Host "✅ No hay cambios para respaldar" -ForegroundColor Yellow
    exit 0
}

# Agregar todos los cambios
Write-Host "📁 Agregando archivos..." -ForegroundColor Blue
git add .

# Hacer commit
$message = "Respaldo expreso - $timestamp"
Write-Host "💾 Creando commit: $message" -ForegroundColor Blue
git commit -m "$message"

# Hacer push
Write-Host "⬆️  Subiendo a GitHub..." -ForegroundColor Blue
git push origin main

Write-Host "✅ Respaldo completado exitosamente" -ForegroundColor Green