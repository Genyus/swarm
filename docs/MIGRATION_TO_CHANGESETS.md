# Migration to Changesets

This document outlines the migration from semantic-release to changesets for the Swarm monorepo.

## Why Changesets?

We're switching to changesets for the following reasons:

1. **Monorepo-first design**: Changesets is purpose-built for monorepos
2. **Better contributor experience**: More intuitive workflow than strict commit conventions
3. **Coordinated releases**: Easier to manage releases across multiple packages
4. **Flexible versioning**: Manual control when automation isn't enough
5. **Excellent pnpm integration**: Native support for pnpm workspaces

## What's Changed

### Repository Structure
- GitHub Actions workflow moved from `packages/swarm-cli/.github/` to root `.github/workflows/`
- Added root-level `package.json` (ESM) and `pnpm-workspace.yaml`
- Added `.changeset/` directory for configuration and auto-generation scripts
- All scripts use ESM modules (`.js` extension, enabled by `"type": "module"`)
- Shared utilities in `.changeset/utils.js` to follow DRY principles

### Release Process
**Before (semantic-release):**
- Automatic versioning based on commit messages
- Strict conventional commit format required
- Immediate release on push to main

**After (changesets + conventional commits):**
- Automatic changeset generation from conventional commit messages
- Maintains conventional commit benefits
- Two-step release process (version PR → merge → publish)
- Manual changeset creation still available when needed

## New Workflow

### For Contributors

**Option 1: Automatic (Recommended)**
1. **Make your changes** to the codebase
2. **Commit using conventional commit format**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix(swarm-cli): resolve template generation issue"
   # or  
   git commit -m "feat!: breaking change to API"
   ```
3. **Changesets are automatically generated** from your commit messages during CI

**Option 2: Manual**
1. **Make your changes** to the codebase
2. **Create a changeset manually**:
   ```bash
   pnpm changeset
   ```
3. **Commit both your changes and the changeset file**:
   ```bash
   git add .
   git commit -m "feat: add new feature with manual changeset"
   ```

### For Maintainers

The CI process now works as follows:

1. **Pull Request merged** to main with conventional commits
2. **CI automatically generates changesets** from commit messages
3. **Changesets action** creates a "Version Packages" PR
4. **Review and merge** the version PR
5. **Packages are automatically published** to npm

## Conventional Commit Patterns

The auto-generation script recognizes these conventional commit patterns:

### Version Bumps
- **Patch** (`fix`, `perf`, `refactor`):
  ```bash
  git commit -m "fix: resolve template generation issue"
  git commit -m "fix(cli): handle edge case in file parsing"
  git commit -m "fix(swarm-cli): handle edge case in file parsing"
  git commit -m "perf: optimize template rendering"
  git commit -m "refactor: simplify command structure"
  ```

- **Minor** (`feat`):
  ```bash
  git commit -m "feat: add new template type"
  git commit -m "feat(cli): support custom template directories"
  git commit -m "feat(swarm-cli): support custom template directories"
  ```

- **Major** (breaking changes):
  ```bash
  git commit -m "feat!: change CLI argument structure"
  git commit -m "fix!: remove deprecated command options"
  git commit -m "BREAKING CHANGE: restructure configuration format"
  git commit -m "BREAKING CHANGE(cli): change default behavior"
  ```

### Scopes
- **Dynamic discovery** - Scopes are automatically detected from `packages/` directory
- **Prefix mapping** - Both `cli` and `swarm-cli` map to the same package
- **No scope** - Defaults to the first package found (usually `swarm-cli`)
- **Auto-expansion** - New packages are automatically recognized

Examples:
- `feat(cli): add command` → affects `@ingenyus/swarm-cli`
- `feat(swarm-cli): add command` → affects `@ingenyus/swarm-cli`
- `feat: add command` → affects default package

### Non-Release Commits
These commit types don't trigger releases:
- `docs:` - Documentation changes
- `test:` - Test additions/modifications  
- `ci:` - CI/CD changes
- `chore:` - Maintenance tasks
- `style:` - Code formatting

## Architecture

The changeset auto-generation system follows a modular architecture:

### Core Files
- **`.changeset/utils.js`** - Shared utilities and functions
  - `getValidScopes()` - Dynamically discovers packages from `packages/` directory
  - `mapScopeToPackage()` - Maps scope names to package directories (handles prefix variations)
  - `parseCommitMessage()` - Parses conventional commit messages
  - `createChangesetFile()` - Creates changeset files
  - `getCommitsSinceLastRelease()` - Retrieves commits for batch processing
  - `consolidateChanges()` - Groups and prioritizes changes by package
  - `printValidPatterns()` - Shows help for valid commit patterns with dynamic scopes

### Scripts
- **`.changeset/changeset-autogenerate.js`** - Single commit processing
- **`.changeset/changeset-autogenerate-batch.js`** - Batch commit processing
- **`.github/changeset-version.js`** - Version update script for CI

### Benefits of This Architecture
- **DRY Principle** - No code duplication between scripts
- **Maintainability** - Single source of truth for commit parsing logic
- **Extensibility** - Automatically discovers new packages, easy to add commit patterns
- **Testability** - Utilities can be easily unit tested

## Commands Reference

```bash
# Create a new changeset manually
pnpm changeset

# Generate changesets from recent commit (single)
pnpm changeset:autogenerate

# Generate changesets from all commits since last release (batch)
pnpm changeset:autogenerate-batch

# Preview what would be released
pnpm changeset status

# Version packages (usually done by CI)
pnpm version-packages

# Publish packages (usually done by CI)
pnpm release

# Build all packages
pnpm build

# Test all packages
pnpm test

# Lint all packages
pnpm lint
```

## Key Benefits

1. **Best of both worlds**: Conventional commits + changeset flexibility
2. **Automatic changeset generation**: No manual changeset creation needed
3. **Coordinated releases**: Multiple packages can be released together
4. **Better changelogs**: Focused on user-facing changes from commit messages
5. **Gradual releases**: Some packages can be held back while others release
6. **Pre-release support**: Easy alpha/beta releases when needed
7. **Conventional commit benefits**: Consistent commit history and automated tooling

## Migration Checklist

- [x] Create root `package.json` and `pnpm-workspace.yaml` with ESM support
- [x] Move GitHub Actions to root `.github/workflows/`
- [x] Remove semantic-release from package dependencies
- [x] Configure changesets in `.changeset/config.json`
- [x] Update CI workflow to use changesets action
- [x] Create auto-generation scripts for conventional commits
- [ ] Install dependencies: `pnpm install`
- [ ] Test the new workflow with a sample changeset
- [ ] Update contribution guidelines in README

## Troubleshooting

### "No packages to release"
- Ensure you've created changesets for your changes
- Check if packages have been properly configured

### Permission issues in CI
- Ensure `GITHUB_TOKEN` and `NPM_TOKEN` are properly configured
- Check repository permissions for Actions

### Build failures
- All packages must build successfully before release
- Run `pnpm build` locally to test 