$src = 'C:\empty_for_delete'
$dst = 'D:\Proyectos\Web\GEMODIDA\(dry-run)'

New-Item -ItemType Directory -Force -Path $src | Out-Null

Write-Host "Robocopy mirror: $src -> $dst"
Start-Process -FilePath robocopy -ArgumentList @($src, $dst, '/MIR') -Wait -NoNewWindow

# After mirroring an empty dir, try to remove the folder
if (Test-Path -LiteralPath $dst) {
    try { Remove-Item -LiteralPath $dst -Recurse -Force -ErrorAction Stop; Write-Host 'Removed (dry-run) via Remove-Item' } catch { Write-Host 'Final remove failed:' $_.Exception.Message }
} else { Write-Host 'Destination not found after robocopy' }

# Cleanup empty temp dir
Remove-Item -LiteralPath $src -Recurse -Force -ErrorAction SilentlyContinue
