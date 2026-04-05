# Branch Push Handoff Notes

Owner: Team Lead (Ayush)
Version: 1.0.0

This file captures documentation for branch files that do not support native comments/docstrings.

## server/package.json
Purpose:
- defines backend runtime/development dependencies and scripts

Why this matters to team:
- ffprobe-static is required for video metadata validation checks
- script commands are the operational entry points for local and CI execution

Team checks:
- confirm ffprobe-static remains in dependencies
- confirm start/dev scripts are valid for the current deployment process

## server/package-lock.json
Purpose:
- lockfile for deterministic dependency resolution

Why this matters to team:
- keeps team and CI builds reproducible
- captures exact version tree for security scanning

Team checks:
- avoid manual edits
- regenerate only through package manager operations
- review lockfile changes when dependency updates are introduced
