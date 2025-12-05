$p = 'D:\Proyectos\Web\GEMODIDA\(dry-run)\backups\GEMODIDA\20251123-153727\node_modules\@tailwindcss\oxide-win32-x64-msvc\tailwindcss-oxide.win32-x64-msvc.node'
Write-Host "Target: $p"
if (-not (Test-Path -LiteralPath $p)) { Write-Host 'Not found'; exit 0 }

try {
    [System.IO.File]::SetAttributes($p, 'Normal')
    Write-Host 'Attributes set to Normal'
} catch { Write-Host "SetAttributes failed: $($_.Exception.Message)" }

try {
    Remove-Item -LiteralPath $p -Force -ErrorAction Stop
    Write-Host 'Removed'
} catch { Write-Host "Remove failed: $($_.Exception.Message)"; exit 1 }

exit 0
