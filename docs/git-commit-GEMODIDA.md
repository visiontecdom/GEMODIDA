git-commit-GEMODIDA.ps1 — simple, git-only uploader

Purpose:
- Stage and push files directly from the project folders to a git remote (origin).
- No local snapshots or filesystem copies — minimal disk usage.

Usage examples:
- Dry-run only (safe):
  powershell -File .\git-commit-GEMODIDA.ps1 -DryRun

- Initial full commit (generate backup branch automatically):
  powershell -File .\git-commit-GEMODIDA.ps1 -Init -RemoteUrl https://github.com/you/repo.git

- Commit only files under a path and set message:
  powershell -File .\git-commit-GEMODIDA.ps1 -Path .\src -Message "backup-src-2025-11-23"

Notes:
- Default excludes (node_modules, .next, .git, dist, build, vendor, venv, env, tmp, temp) are applied. Add more with -Exclude parameter.
- Use -DryRun to verify intended git commands. The script prints the commands and does not execute them in DryRun mode.

Safety:
- The script is intentionally conservative: it stages only modified/new files on normal runs and applies excludes.
- When running for the first time in a new repo (no commits present) it performs an initial add and removes excluded paths from the index to avoid committing large artifacts.

If you want, I can add a short `scripts/check-git-commit-dryrun.ps1` harness that runs the script with `-DryRun` and asserts no copy operations are present. (I won't run it for you.)
