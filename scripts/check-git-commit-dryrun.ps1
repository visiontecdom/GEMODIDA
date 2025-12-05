# Quick check harness — runs `git-commit-GEMODIDA.ps1 -DryRun` and inspects output (does not execute actions).
# This file is a convenience to run locally and validate there are no copy operations printed.

param(
    [string]$ScriptPath = '..\git-commit-GEMODIDA.ps1'
)

Write-Host "Running DryRun check for $ScriptPath" -ForegroundColor Cyan

# Run the script in a subshell with DryRun and capture output
$psOutput = powershell -NoProfile -NoLogo -Command "& { .\$ScriptPath -DryRun }" 2>&1

# Print output for user
Write-Host "----- DRY RUN OUTPUT -----" -ForegroundColor Yellow
$psOutput
Write-Host "----- END OUTPUT -----" -ForegroundColor Yellow

# Simple checks
$foundCopy = $psOutput | Select-String -Pattern 'Copy-Item' -Quiet
if ($foundCopy) { Write-Host 'ERROR: detected Copy-Item references in dry-run output — investigate' -ForegroundColor Red; exit 2 }

$foundGit = $psOutput | Select-String -Pattern '^DRY RUN: git' -Quiet
if (-not $foundGit) { Write-Host 'WARN: No git commands were printed in dry-run; verify inputs and environment' -ForegroundColor Yellow; exit 1 }

Write-Host 'DryRun check passed (no Copy-Item printed; git commands detected).' -ForegroundColor Green
exit 0
