
# Función para matar todos los procesos de Node.js
function Kill-NodeProcesses {
    try {
        $result = taskkill /F /IM node.exe /T 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Procesos de Node.js terminados: $result" -ForegroundColor Green
        }
        else {
            Write-Host "No se encontraron procesos de Node.js o ya fueron terminados" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Error "Error al ejecutar el comando: $_"
    }
}

# Ejecutar la función
Kill-NodeProcesses