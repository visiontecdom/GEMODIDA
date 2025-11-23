<#

	# git-commit-GEMODIDA.ps1
	#
	# Improvements:
	#  - Only performs commits when changes are present (no empty commits)
	#  - Accepts arguments: -Path, -Message, -Branch, -DryRun, -Force
	#  - Verifies git presence and that the current folder is a git repo
	#  - Supports creating/checking out backup branch (e.g. backups/YYYYMMDD-HHMM)
	#  - Clear exit codes and log messages

	Recommended usage:
		.\git-commit-GEMODIDA.ps1                       # stage all and commit/push on current branch
		.\git-commit-GEMODIDA.ps1 -Path .\backup -Message "db backup" -Branch backups/2025-11-23 -Force
		.\git-commit-GEMODIDA.ps1 -DryRun

#>

param(
	[string]$Path = '.',
	[string]$Message = '',
	[string]$Branch = '',
	[string[]]$Exclude = @('scripts','Errores','docs','db','backup'),
	[string]$RemoteUrl = '',
	[switch]$Init,
	[switch]$DryRun,
	[switch]$Force
)

# Examples:
#  .\git-commit-GEMODIDA.ps1 -Init -RemoteUrl https://github.com/youruser/yourrepo.git  # initialize, commit and push
#  .\git-commit-GEMODIDA.ps1 -Path .\backup -Message "db backup" -RemoteUrl https://github.com/you/repo.git

function Write-Log($msg, [string]$level = 'INFO') {
	$timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
	Write-Host "[$timestamp] [$level] $msg"
}

function Invoke-Git([string[]]$gitArgs) {
	# Use direct invocation to avoid Start-Process parsing issues
	$command = "git " + ($gitArgs -join ' ')
	if ($DryRun) {
		Write-Host "DRY RUN: $command"
		return @{ ExitCode = 0; Output = "(dry-run)" }
	}

	try {
		$output = & git @gitArgs 2>&1
		$exit = $LASTEXITCODE
		return @{ ExitCode = $exit; Output = $output }
	} catch {
		return @{ ExitCode = 1; Output = $_.Exception.Message }
	}
}

try {
	# Basic checks
	$gitVersion = Invoke-Git(@('version'))
	if ($gitVersion.ExitCode -ne 0) { Write-Log 'git not found in PATH, aborting' 'ERROR'; exit 2 }

	$inRepo = Invoke-Git(@('rev-parse','--is-inside-work-tree'))
	if ($inRepo.ExitCode -ne 0 -or $inRepo.Output.Trim() -ne 'true') {
		if ($Init) {
			Write-Log 'Not a git repo; -Init provided so repository will be initialized' 'INFO'
		} else {
			Write-Log 'This directory is not a git repository; run with -Init to initialize' 'ERROR'
			exit 3
		}
	}

	$resolvedPath = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
	if (-not $resolvedPath) { Write-Log "Path not found: $Path" 'ERROR'; exit 4 }

	# Prepare backup area
	# Determine project name (from package.json name or current folder)
	$projectName = ''
	if (Test-Path -Path 'package.json') {
		try { $pkg = Get-Content -Raw package.json | ConvertFrom-Json; $projectName = $pkg.name } catch { }
	}
	if ([string]::IsNullOrWhiteSpace($projectName)) { $projectName = Split-Path -Leaf (Get-Location) }

	$repoRootResult = Invoke-Git(@('rev-parse','--show-toplevel'))
	$repoRoot = if ($repoRootResult.ExitCode -eq 0) { $repoRootResult.Output.Trim() } else { (Get-Location).Path }

	$backupRoot = Join-Path -Path $repoRoot -ChildPath (Join-Path 'backups' $projectName)
	if (-not (Test-Path -Path $backupRoot)) { New-Item -Path $backupRoot -ItemType Directory -Force | Out-Null; Write-Log "Created backup root: $backupRoot" }

	$ts = Get-Date -Format 'yyyyMMdd-HHmmss'
	$backupFolder = Join-Path -Path $backupRoot -ChildPath $ts
	New-Item -Path $backupFolder -ItemType Directory -Force | Out-Null

	Write-Log "Copying snapshot from $Path into $backupFolder (excluding: $($Exclude -join ', '))"
	# Copy top-level entries excluding those listed
	$items = Get-ChildItem -LiteralPath $Path -Force
	foreach ($it in $items) {
		if ($Exclude -and $Exclude -contains $it.Name) { continue }
		$dest = Join-Path -Path $backupFolder -ChildPath $it.Name
		try {
			if ($it.PSIsContainer) { Copy-Item -LiteralPath $it.FullName -Destination $dest -Recurse -Force -ErrorAction Stop } else { Copy-Item -LiteralPath $it.FullName -Destination $dest -Force -ErrorAction Stop }
		} catch {
			Write-Log ("Error copying {0}: {1}" -f $it.FullName, $_.Exception.Message) 'WARN'
		}
	}

	# Stage the backup folder only
	$relBackup = $backupFolder.Substring($repoRoot.Length).TrimStart('\','/')
	Write-Log "Staging backup folder: $relBackup"
	$addResult = Invoke-Git(@('add', $relBackup))
	if ($addResult.ExitCode -ne 0) { Write-Log "git add failed: $($addResult.Output)" 'ERROR'; exit 5 }

	# Check for changes to commit
	$status = Invoke-Git(@('status','--porcelain'))
	if ($status.ExitCode -ne 0) { Write-Log "git status failed: $($status.Output)" 'ERROR'; exit 6 }

	if (-not $Force -and [string]::IsNullOrWhiteSpace($status.Output)) {
		Write-Log 'No changes to commit. Use -Force to force an empty commit.' 'WARN'
		exit 0
	}

	# Build commit message
	if ([string]::IsNullOrWhiteSpace($Message)) {
		$now = Get-Date -Format 'yyyyMMdd-HHmm'
		$Message = "BACKUP-GEMODIDA-$now"
	}

	if (-not $Branch) {
		$now = Get-Date -Format 'yyyyMMdd-HHmm'
		$Branch = "backups/$now"
		Write-Log "No branch provided - using generated branch: ${Branch}"
	}

	if ($Init) {
		# Initialize repo if requested
		Write-Log "Initializing git repository in $(Get-Location)"
		$initResult = Invoke-Git(@('init'))
		if ($initResult.ExitCode -ne 0) { Write-Log "Failed to init repo: $($initResult.Output)" 'ERROR'; exit 11 }
	}

	if ($Branch) {
		# If branch doesn't exist, create it.
		$branchesResult = Invoke-Git(@('rev-parse','--verify',$Branch))
		if ($branchesResult.ExitCode -ne 0) {
			Write-Log "Branch ${Branch} does not exist - creating and checking out" 'INFO'
			$checkout = Invoke-Git(@('checkout','-b',$Branch))
			if ($checkout.ExitCode -ne 0) { Write-Log "Could not create/checkout branch ${Branch}: $($checkout.Output)" 'ERROR'; exit 7 }
		} else {
			$checkout = Invoke-Git(@('checkout',$Branch))
			if ($checkout.ExitCode -ne 0) { Write-Log "Could not switch to branch ${Branch}: $($checkout.Output)" 'ERROR'; exit 8 }
		}
	}

	# Commit
	Write-Log "Committing: '$Message'"
	$commit = Invoke-Git(@('commit','-m',$Message))
	if ($commit.ExitCode -ne 0) {
		if ($commit.Output -match "nothing to commit") {
			Write-Log 'No changes recorded (nothing to commit).' 'WARN'
			exit 0
		}
		Write-Log "git commit failed: $($commit.Output)" 'ERROR'
		exit 9
	}

	# Validate remote and Push
	$remoteCheck = Invoke-Git(@('remote','get-url','origin'))
	if ($remoteCheck.ExitCode -ne 0) {
		if ($RemoteUrl) {
			Write-Log "No origin remote found - adding origin = $RemoteUrl"
			$addRemote = Invoke-Git(@('remote','add','origin',$RemoteUrl))
			if ($addRemote.ExitCode -ne 0) { Write-Log "Failed to add remote origin: $($addRemote.Output)" 'ERROR'; exit 12 }
			# re-check
			$remoteCheck = Invoke-Git(@('remote','get-url','origin'))
		} else {
			Write-Log "No 'origin' remote found - skipping push. Provide -RemoteUrl to add one." 'WARN'
			exit 0
		}
	}

	# Push
	if ($Branch) {
		Write-Log "Pushing branch ${Branch} to origin"
		$push = Invoke-Git(@('push','-u','origin',$Branch))
	} else {
		Write-Log "Pushing changes on current branch"
		$push = Invoke-Git(@('push'))
	}

	if ($push.ExitCode -ne 0) { Write-Log "git push failed: $($push.Output)" 'ERROR'; exit 10 }

	Write-Log 'Backup commit and push completed' 'OK'
	exit 0

} catch {
	$errMsg = $_.Exception.Message.ToString()
	Write-Log "Exception: $errMsg" 'ERROR'
	exit 99
}

