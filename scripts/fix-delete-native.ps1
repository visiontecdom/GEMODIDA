$path = 'D:\Proyectos\Web\GEMODIDA\(dry-run)\backups\GEMODIDA\20251123-153727\node_modules\@tailwindcss\oxide-win32-x64-msvc\tailwindcss-oxide.win32-x64-msvc.node'

Write-Host "Target: $path"
if (-not (Test-Path -LiteralPath $path)) { Write-Host 'Not found'; exit 0 }

try {
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    $user = $identity.Split('\\')[-1]
    Write-Host "Granting FullControl to user: $user"
    $acl = Get-Acl -LiteralPath $path
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule($user,'FullControl','Allow')
    $acl.SetAccessRule($rule)
    Set-Acl -LiteralPath $path -AclObject $acl
    Write-Host 'ACL set'
} catch {
    Write-Host "ACL error: $($_.Exception.Message)"
}

try {
    Write-Host 'Attempting Remove-Item...'
    Remove-Item -LiteralPath $path -Force -ErrorAction Stop
    Write-Host 'File removed'
} catch {
    Write-Host "Remove error: $($_.Exception.Message)"
    exit 1
}

exit 0
