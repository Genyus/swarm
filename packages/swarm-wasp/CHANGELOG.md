# @ingenyus/swarm-wasp

## 0.3.0

### Minor Changes

- [`0d5ea96`](https://github.com/Genyus/swarm/commit/0d5ea964b12aa77c1fa28393bccd826435222c3c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - Multiple changes:
  - add swarm-wasp package boilerplate
  - rename base classes to use Base suffix
  - reorganize directory structure
  - Phase 3 - eliminate duplication and reduce complexity
  - split operation generator into action and query generators
  - improve create operations
  - Fix insertion ordering
  - extend optional field support
  - fix route configuration format
  - auto-include datatype in entities array for actions and queries
  - add optional custom name parameter to action and query generators
  - simplify feature command
  - fix CRUD generator command

### Patch Changes

- Updated dependencies [[`0d5ea96`](https://github.com/Genyus/swarm/commit/0d5ea964b12aa77c1fa28393bccd826435222c3c)]:
  - @ingenyus/swarm@0.3.0

## 0.2.0

### Minor Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): add optional custom name parameter to action and query generators
  - Add optional 'name' parameter to action and query generator schemas
  - Update ActionGenerator and QueryGenerator to extract and pass custom name
  - Modify OperationGeneratorBase.getOperationName to accept customName parameter
  - Preserve schema metadata when making name parameter optional using extend()
  - Update ActionFlags and QueryFlags types to include name property
  - Add test coverage for custom operation names

  Resolves Task #44

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp-config): implement semicolon normalisation in config files
  - Add normaliseSemicolons() method to handle user-added semicolons
  - Remove semicolons from all method calls in app chain
  - Automatically add semicolon to the last method call
  - Preserve semicolons outside the method chain
  - Add comprehensive test coverage for semicolon handling

  Resolves issues where manually added semicolons would break
  subsequent config insertions by normalising semicolon usage
  consistently across all feature configuration files.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): implement template overriding
  - Enable overriding built-in templates
  - Set .swarm/templates as default custom template location

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): auto-include datatype in entities array for actions and queries
  - Automatically add dataType to entities array if not already present
  - Place dataType first in the array using unshift()
  - Maintain backward compatibility with explicit entity specification
  - Prevent duplicate dataType entries with includes() check
  - Add test scaffolding for new behavior (tests partially complete)

  This eliminates the need to manually specify the dataType in the
  -e flag when generating actions and queries, as the generator already
  knows which model it's operating on from the -d flag.

  Resolves task #45

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): migrate code from swarm-mcp and swarm-cli

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: add comprehensive support for Prisma composite primary keys

  Add full support for models using @@id([field1, field2]) composite keys:

  **Schema Parsing:**
  - Parse @@id attribute to detect composite primary keys
  - Extract field names from composite key definition
  - Mark all composite key fields with isId: true in metadata

  **Field Helper Functions:**
  - Update getIdFields to return all ID fields as array (single or composite)
  - Exclude ID fields from getRequiredFields (they may not be auto-generated)

  **Operation Code Generation:**
  - Detect composite keys and generate appropriate where clauses
  - Single key: where: { id }
  - Composite key: where: { userId_projectId: { userId, projectId } }
  - Update function parameters to destructure all ID fields
  - Support for get, delete, update operations with composite keys

  **Template Updates:**
  - Update get.eta to use idFieldParams and whereClause
  - Update delete.eta to use idFieldParams and whereClause
  - Maintain backward compatibility with single primary keys

  **Tests:**
  - Add mockCompositeKeyModel with userId/projectId composite key
  - Test getIdFields returns multiple fields for composite keys
  - Test getRequiredFields excludes composite key fields
  - Test generatePickType handles composite key fields
  - All 23 prisma.test.ts tests passing

  Verified with UserProject model: @@id([userId, projectId])
  - create: Pick<UserProject, "userId" | "projectId">
  - get/delete: where: { userId_projectId: { userId, projectId } }

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): add swarm-wasp package boilerplate

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: remove relation fields from metadata
  - Filter out array and relation fields to match Wasp entities

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: improve api generator arguments
  - Add custom middleware metadata

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): improve create operations
  - Handle default values and foreign keys in create operations
  - Add getOptionalFields() helper to identify fields with non-DateTime defaults
  - Update getOmitFields() to exclude fields with default values and foreign keys
  - Modify create operation type generation to make optional fields truly optional
  - Fields with defaults (except DateTime) are now properly optional in create types
  - Foreign key fields are automatically excluded from create operations

  Example: Task with 'isDone' boolean default(false) now generates:
  Omit<Task, 'id' | 'userId' | 'isDone'> & { isDone?: boolean }

### Patch Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(wasp): add sample config file

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): reorganize directory structure
  - Moved base-classes/ to generators/base/
  - Renamed utils/ to common/
  - Moved interface files:
    - generator-args.ts -> generators/args.types.ts
    - prisma.ts -> types/prisma.types.ts
    - wasp-config-generator.ts -> generators/config/config-generator.ts
  - Reorganized wasp-config structure (swapped stubs/wasp-config to wasp-config/stubs)
  - Moved app.ts and config-index.ts into wasp-config/
  - Moved test-setup.ts to tests/setup.ts
  - Updated vitest.config.ts to reference new test setup location
  - Updated all imports across package
  - Added tsconfig paths mapping for wasp-config module resolution
  - Added skipLibCheck to tsconfig.dts.json

  Part of Phase 2.2 - swarm-wasp directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): handle missing config file gracefully
  - Create default configuration object instead of throwing error when config file not found
  - Replace hard-coded configuration directory and file paths with constants

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: renamed swarm-core to swarm
  - Removed name property from root package.json to avoid conflict

  Verification:
  ✅ both packages build successfully
  ✅ All tests passing (swarm: 185/185, swarm-wasp: 104/107)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test: fix api-generator test after refactoring
  - Updated import to use './api-generator' instead of './generator'
  - Changed type from Generator<string> to SwarmGenerator<{ path: string }>
  - Removed access to protected class properties (path, checkConfigExists)
  - Simplified template mocking to not access internal implementation
  - Properly mock config template to return valid config definition
  - Added resolveTemplatePath mock to templateUtility for second test
  - All tests now passing

  Fixes linter errors and test failures after generator file renaming.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): implement plugin resolution
  - Add support for npm packages and local plugin resolution

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rename BaseGenerator to GeneratorBase and SwarmLogger to SignaleLogger
  - Renamed BaseGenerator class to GeneratorBase following naming convention
  - Renamed SwarmLogger class to SignaleLogger for clarity
  - Renamed base-generator.ts to generator.base.ts
  - Renamed logger.ts to signale-logger.ts
  - Updated all imports across swarm-core and swarm-wasp packages
  - Updated all references in MCP server files and test files

  Part of Phase 1.1 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve types and fix test imports in utils and generators
  - Added underscores to unused parameters in mock functions
  - Added proper type annotations (FileSystem, string | Buffer, etc.)
  - Fixed test imports to use renamed generator files (\*-generator.ts)
  - Updated Generator<string> to SwarmGenerator<{ path: string }> in all tests
  - Added template utility mocks to generator tests for getDefinition
  - Added type cast for template processing (as string, String())
  - Fixed importActual type annotation for @ingenyus/swarm-core

  All generator unit tests now passing.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): split operation generator into action and query generators
  - Refactor OperationGenerator into ActionGenerator and QueryGenerator
  - ActionGenerator handles create, update, delete operations
  - QueryGenerator handles get, getAll, getFiltered operations
  - Extract common logic to OperationGeneratorBase
  - Update all tests to use new generators
  - Fix template path resolution for config templates
  - Minimize code duplication while maintaining clear separation of concerns

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): Fix insertion ordering

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: remove Knip script from sub-packages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: restructure monorepo
  - Merge base functionality from swarm-cli and swarm-mcp into swarm-core
  - Implement metadata-driven generation for CLI commands and MCP tools
  - Extract Wasp entity generators into new swarm-wasp package

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: complete Hungarian notation removal and fix type issues
  - Fixed remaining FileSystem import issues
  - Removed duplicate base class files that weren't properly deleted
  - Fixed FeatureDirectoryGenerator type from Generator<string> to SwarmGenerator<SchemaArgs>
  - Updated entity-generator.base.ts to use correct type parameter
  - Fixed test mock to match correct SwarmGenerator interface
  - Removed IFeatureDirectoryGenerator export from package index
  - All builds now passing

  Part of Phase 1.3 completion.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: ensure parent features exist
  - Validates existence of current and any ancestor features
  - Fix feature directory generator param typing
  - Update tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install Knip

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): rename base classes to use Base suffix
  - Renamed BaseWaspGenerator to WaspGeneratorBase
  - Renamed BaseEntityGenerator to EntityGeneratorBase
  - Renamed BaseOperationGenerator to OperationGeneratorBase
  - Renamed files to use .base.ts suffix convention:
    - base-wasp-generator.ts → wasp-generator.base.ts
    - base-entity-generator.ts → entity-generator.base.ts
    - base-operation-generator.ts → operation-generator.base.ts
  - Updated all imports and class extensions across all generators

  Part of Phase 1.2 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: resolve test failures after refactoring

  Fixed template path resolution issues:
  - Updated TemplateUtility.resolveTemplatePath to account for new base class location
    (generators/base/ instead of base-classes/)
  - Fixed operation generator config template path construction
    (removed extra 'generators' in path join)

  Fixed Prisma mock paths in tests:
  - Updated all test files to mock '../src/common/prisma' instead of '../src/utils/prisma'
  - Affected files:
    - json-field-handling.test.ts
    - crud-generation.test.ts
    - error-handling.test.ts
    - complete-workflow.test.ts
    - edge-cases.test.ts
    - performance-stress.test.ts
    - operation-generation.test.ts
    - configuration-validation.test.ts

  All 107 swarm-wasp tests now passing (3 skipped).

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: configure Knip and fix issues

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: refactor template handling
  - Migrate template handling from swarm-core to swarm-wasp
  - Refactor tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(wasp): overhaul integration tests
  - Replace loose mocked tests with physical file generation and validation
  - Generate a minimal Wasp application to test against
  - Switch to single-fork execution to prevent test interference

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: complete naming convention improvements

  Naming Convention Updates:
  - Renamed all generator files to follow \*-generator.ts convention
    - api/generator.ts -> api/api-generator.ts
    - crud/generator.ts -> crud/crud-generator.ts
    - config/generator.ts -> config/wasp-config-generator.ts
    - feature-directory/generator.ts -> feature-directory/feature-directory-generator.ts
    - job/generator.ts -> job/job-generator.ts
    - operation/generator.ts -> operation/operation-generator.ts
    - route/generator.ts -> route/route-generator.ts
    - api-namespace/generator.ts -> api-namespace/api-namespace-generator.ts
  - Renamed mcp/server/utils/ to mcp/server/common/ for consistency

  New Index Files (Barrel Exports):
  - Added contracts/index.ts with explicit type exports
  - Added generator/index.ts exporting GeneratorBase
  - Added plugin/index.ts with proper type/value exports
  - Added generators/base/index.ts for base classes
  - Added generators/config/index.ts
  - Added types/index.ts with correct exports
  - Updated mcp/server/common/index.ts with explicit exports

  Export Improvements:
  - Converted high-level barrel exports to explicit named exports
  - Fixed types/index.ts to only export types that actually exist
  - Kept wildcard exports for utility directories (common/)
  - Used 'export type' for interfaces to satisfy isolatedModules

  All imports updated and builds passing successfully.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install rimraf locally

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): reorganize directory structure
  - Renamed base-classes/ to generator/
  - Created contracts/ directory for API boundaries
  - Moved interface files to contracts/
  - Renamed utils/ to common/
  - Renamed plugin files for clarity (manager.ts -> plugin-manager.ts, etc.)
  - Moved generator-interface-manager.ts to plugin/
  - Updated all imports across packages
  - Removed leftover interfaces/ directory

  Part of Phase 2.1 - swarm-core directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve operation code generation with consistent field helpers and type utilities
  - Rename getIdField to getIdFields returning string[] for consistency
  - Replace getOmitFields with getRequiredFields for clearer intent
  - Update getOptionalFields to return string[] instead of Record<string, string>
  - Add generatePickType helper for Pick type generation with optimisations
  - Add generateOmitType helper for Omit type generation with optimisations
  - Add generatePartialType helper for Partial type wrapping
  - Add generateIntersectionType helper for type intersection logic
  - Refactor generateOperationCode to use new helpers for cleaner type assembly
  - Update all test mocks to match new function signatures
  - Add comprehensive unit tests for new type generation helpers

  Operation-specific type parameters now use:
  - create: Pick<required> & Partial<Pick<optional>>
  - update: Pick<id> & Partial<Omit<id>>
  - get/delete: Pick<id>
  - getAll: void
  - getFiltered: Partial<Model>

  All tests passing (133 passed, 3 skipped)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix route configuration format

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: update imports to use barrel paths

  swarm-core:
  - Updated contracts imports to use '../contracts' barrel
  - Updated common imports to use '../common' barrel
  - Updated plugin imports to use '../plugin' barrel
  - Fixed GeneratorInterfaceManager export (class, not type)

  swarm-wasp:
  - Updated base generator imports to use '../base' barrel
  - Updated common imports to use '../../common' barrel
  - Reverted WaspGeneratorBase to direct import to avoid circular resolution
  - All schema files now import from common barrel

  Benefits:
  - Cleaner imports throughout the codebase
  - Better encapsulation of module boundaries
  - Easier to refactor internal structure without breaking imports
  - More maintainable codebase

  All tests passing.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: update dependencies
  - Remove eslint-plugin-prettier

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): Phase 3 - eliminate duplication and reduce complexity

  Code Optimization Changes:
  1. Consolidated Config Update Pattern
     - Added updateConfigWithCheck helper to EntityGeneratorBase
     - Refactored 6 generators (api, route, job, operation, crud, api-namespace)
     - Eliminated duplicate config update logic across all generators
  2. Consolidated Validation Logic
     - Added generic checkExistence method to WaspGeneratorBase
     - Refactored checkFileExists and checkConfigExists to use new helper
     - Reduced code duplication in validation patterns
  3. Removed Redundant Wrapper Methods
     - Removed getFeatureImportPath wrappers from both base classes
     - Updated ApiGenerator to use utility function directly
     - Cleaned up unused imports
  4. Verified MCP Error Handling
     - Audited MCP tools error handling patterns
     - Confirmed existing error-handler.ts consolidation is sufficient
     - No changes needed - already well-architected

  Results:
  ✅ -14 net lines of code
  ✅ Improved maintainability through reduced duplication
  ✅ All tests passing (swarm-core: 185/185, swarm-wasp: 104/107)
  ✅ Full validation suite passing (lint, typecheck, build, test)
  ✅ No functional changes introduced

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix CRUD generator command
  - Add missing dataType argument
  - Stop optional arguments being treated as required
  - Fix incorrect await usage with non-async getDefinition method
  - Unify generators directory in core package
  - Improve CRUD generation test suite

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): simplify feature command
  - Rename from 'feature-directory' to 'feature'

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: clean up unused types
  - Removed dead code

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: complete refactoring - knip ignore rules and final cleanup

  Added Knip ignore rules:
  - Ignore @commander-js/extra-typings (swarm-core CLI dependency)
  - Ignore wasp-config (swarm-wasp test stub)

  Additional cleanup in this commit:
  - Updated SwarmConfig references to SwarmConfigManager
  - Fixed remaining import paths after refactoring
  - Added missing barrel index.ts files for generator subdirectories
  - Removed accidentally created tests/index.ts
  - Updated all generator imports to use barrel paths

  Summary of complete refactoring:
  ✅ Phase 1: Naming conventions (Base suffix, .base.ts files)
  ✅ Phase 2: Directory structure (utils→common, interfaces→contracts, base-classes→generators/base)
  ✅ Phase 3: Barrel files (index.ts) with explicit exports
  ✅ Phase 4: Updated all imports to use barrel paths
  ✅ Phase 5: Fixed all test mocks and template paths
  ✅ Phase 6: Resolved Knip false positives

  All tests passing:
  - swarm-core: 185/185 tests ✓
  - swarm-wasp: 104/107 tests ✓ (3 skipped)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: normalise error messages
  - Align success and failure messages
  - Remove redundant messages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - revert(swarm-wasp): restore config update logic
  - Restore previous insertion logic that agent over-simplified
  - Add proper config file content to readFileSync mocks
  - Update template mocks to match actual config template format (.addX chaining)
  - Remove utf8 encoding parameter from test expectations (not used in actual code)
  - All tests now passing with restored config update behavior

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: remove Hungarian notation from interfaces
  - Renamed IFileSystem to FileSystem
  - Renamed IWaspConfigGenerator to ConfigGenerator
  - Removed IFeatureDirectoryGenerator interface entirely, replaced with Generator<string>
  - Updated all imports and references across both packages
  - Deleted feature-directory-generator.ts interface file

  Part of Phase 1.3 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: migrate all Wasp references to swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: merge swarm-config into swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): extend optional field support
  - Implement optional fields for update actions and getFiltered queries

- Updated dependencies [[`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0), [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0)]:
  - @ingenyus/swarm@0.2.0
