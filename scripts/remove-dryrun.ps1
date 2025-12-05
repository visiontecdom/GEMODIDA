param(
    [string]$Target = 'D:\Proyectos\Web\GEMODIDA\(dry-run)'
)

$unc = "\\\\?\\$Target"
Write-Host "Removing: $Target"
if (-not (Test-Path -LiteralPath $Target)) { Write-Host 'Target not found, skipping.'; exit 0 }

try {
    Write-Host 'Taking ownership (cmd takeown)...'
    Start-Process -FilePath 'cmd.exe' -ArgumentList "/c takeown /F `"$Target`" /R /D Y" -Wait -NoNewWindow
} catch { Write-Host 'takeown failed or skipped' }

try {
    Write-Host "Granting full control to current user: $env:USERNAME"
    Start-Process -FilePath 'cmd.exe' -ArgumentList "/c icacls `"$Target`" /grant `"$env:USERNAME`:F`" /T" -Wait -NoNewWindow
} catch { Write-Host 'icacls failed or skipped' }

try {
    Write-Host 'Attempting .NET directory delete with long path support'
    [System.IO.Directory]::Delete($unc, $true)
    Write-Host 'Directory deleted'
} catch {
    Write-Host 'Delete error: ' $_.Exception.Message
    exit 1
}

exit 0
