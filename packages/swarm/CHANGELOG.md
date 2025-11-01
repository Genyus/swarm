# @ingenyus/swarm

## 0.5.0

### Minor Changes

- [`e4f996f`](https://github.com/Genyus/swarm/commit/e4f996fc47ec90e2e76e343c916230bb50c4dc6f) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! - Multiple changes:
  - restructure monorepo
  - migrate all Wasp references to swarm-wasp
  - merge swarm-config into swarm-wasp
  - refactor template handling
  - ensure parent features exist
  - rename logger export
  - remove Hungarian notation from interfaces
  - complete Hungarian notation removal and fix type issues
  - complete naming convention improvements
  - improve types and fix test imports in utils and generators
  - update imports to use barrel paths
  - resolve test failures after refactoring
  - renamed swarm-core to swarm
  - remove relation fields from metadata
  - improve operation code generation with consistent field helpers and type utilities
  - add comprehensive support for Prisma composite primary keys
  - prevent full stack trace display for user-facing errors
  - normalise error messages
  - improve api generator arguments
  - implement 'create' command

## 0.4.0

### Minor Changes

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - feat: simplify plugin API

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - feat: improve command output

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - feat: add package.json as config source

### Patch Changes

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): clean up exports

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor: rename Generator interface

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - docs: update docs to match latest changes

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: overhaul generator argument types

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - test(wasp): fix tests

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: prefix tool names for clarity

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - build: make binary file names clearer

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - revert: remove quotes from help text

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - chore: clean up import paths

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: overhaul plugin resolution

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rename file

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): simplify command/tool management

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor: remove custom metadata logic

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor (core): clean up package

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): replace hard-coded string

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: simplify Swarm configuration schema

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm): fix generator type constraints

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: remove hard-coded version numbers

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: fix server registration in Cursor

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - docs: update documentation

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: revert addOptionFromField logic

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: improve app generation command

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix: set uniform feature config file name

- [#19](https://github.com/Genyus/swarm/pull/19) [`0ab55fc`](https://github.com/Genyus/swarm/commit/0ab55fc3d7e009ec3a8caad69527c4687c7ba8da) Thanks [@Genyus](https://github.com/Genyus)! - fix(swarm): fix imports

## 0.3.0

### Minor Changes

- [`0d5ea96`](https://github.com/Genyus/swarm/commit/0d5ea964b12aa77c1fa28393bccd826435222c3c) Thanks [@github-actions[bot]](https://github.com/github-actions%5Bbot%5D)! feat: multiple changes

## 0.2.0

### Minor Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(cli): implement type safety for command arguments

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update templates to render swarm-config methods

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: implement 'create' command

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): enable custom API middleware

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(mcp): add support for custom middleware

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): add optional custom name parameter to action and query generators

  Resolves Task #44

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp-config): implement semicolon normalisation in config files

  Resolves issues where manually added semicolons would break
  subsequent config insertions by normalising semicolon usage
  consistently across all feature configuration files.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): implement alphabetical ordering for config sections

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): implement template overriding

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): auto-include datatype in entities array for actions and queries

  This eliminates the need to manually specify the dataType in the
  -e flag when generating actions and queries, as the generator already
  knows which model it's operating on from the -d flag.

  Resolves task #45

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): migrate code from swarm-mcp and swarm-cli

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: add comprehensive support for Prisma composite primary keys

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(config): create swarm-config package

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): improve config function insertion

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(wasp): add swarm-wasp package boilerplate

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update type params

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: remove relation fields from metadata

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(mcp): improve interface and tool naming

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat: improve api generator arguments

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(swarm-wasp): improve create operations

  Example: Task with 'isDone' boolean default(false) now generates:
  Omit<Task, 'id' | 'userId' | 'isDone'> & { isDone?: boolean }

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): add support for `getFiltered` queries

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): overhaul feature configuration templates

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - feat(core): update directory structure

### Patch Changes

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(wasp): add sample config file

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): reorganize directory structure

  Part of Phase 2.2 - swarm-wasp directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): handle missing config file gracefully

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: renamed swarm-core to swarm

  Verification:
  ✅ both packages build successfully
  ✅ All tests passing (swarm: 185/185, swarm-wasp: 104/107)

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test: fix api-generator test after refactoring

  Fixes linter errors and test failures after generator file renaming.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): consolidate schema introspection

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): implement plugin resolution

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: prevent full stack trace display for user-facing errors

  Change error logging in handleGeneratorError from error.stack to error.message
  to provide clean, user-friendly error output instead of verbose stack traces.

  Previously when a generator failed (e.g., file already exists), users would see
  the full stack trace with internal file paths and line numbers. Now they see
  only the clean error message.

  Before:
  [Swarm] › ✖ error Failed to generate Action: Error: Operation file already exists
  at ActionGenerator.checkExistence (file:///.../dist/index.js:1346:13)
  at ActionGenerator.checkFileExists (file:///.../dist/index.js:1355:17)
  ... [many more lines]

  After:
  [Swarm] › ✖ error Failed to generate Action: Operation file already exists

  Stack traces can still be shown when SWARM_DEBUG=1 is set via the error()
  utility function in common/errors.ts.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(cli): update command documentation

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rename BaseGenerator to GeneratorBase and SwarmLogger to SignaleLogger

  Part of Phase 1.1 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style(core): minor template formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve types and fix test imports in utils and generators

  All generator unit tests now passing.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(cli): rename files for consistency

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): split operation generator into action and query generators

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(cli): define short arguments correctly

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): Fix insertion ordering

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): implement generator base class

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): switch to default Eta delimiters

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): fix config insertion bug

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - docs(cli): updates project structure

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build(mcp): fix tsconfig include/exclude rules

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: remove Knip script from sub-packages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: restructure monorepo

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(cli): fix casing bug in operation command

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: complete Hungarian notation removal and fix type issues

  Part of Phase 1.3 completion.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: ensure parent features exist

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install Knip

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(wasp): rename base classes to use Base suffix

  Part of Phase 1.2 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: resolve test failures after refactoring

  Fixed template path resolution issues:
  (generators/base/ instead of base-classes/)
  (removed extra 'generators' in path join)

  Fixed Prisma mock paths in tests:

  All 107 swarm-wasp tests now passing (3 skipped).

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: configure Knip and fix issues

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: refactor template handling

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: standardise scripts

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: centralise TS, ESLint and Prettier configs

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(mcp): propagate generator errors to MCP clients

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): remove obsolete method

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: update validate scripts to fix any issues

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(wasp): overhaul integration tests

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): remove entity suffixing

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style: apply Prettier formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): enable operation generation

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: complete naming convention improvements

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): rebuild Prisma utils on AST parsing

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: install rimraf locally

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(config): fix linting error

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): reorganize directory structure

  Part of Phase 2.1 - swarm-core directory reorganization.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(config): temporary import path fix

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(core): utilise partial mocking pattern

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: improve operation code generation with consistent field helpers and type utilities

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): prevent casing mis-match

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix route configuration format

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): improve logging output

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - style(core): apply Prettier formatting

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: update imports to use barrel paths

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: update dependencies

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: rename logger export

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(swarm-wasp): Phase 3 - eliminate duplication and reduce complexity

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): simplify route generation

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - revert: remove unintentionally restored packages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(mcp): replace local types with core ones

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): fix CRUD generator command

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): simplify feature command

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: clean up unused types

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test(core): enable test runner

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: complete refactoring - knip ignore rules and final cleanup

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(mcp): synchronise MCP tools with CLI commands

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): update template variables

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix: normalise error messages

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - revert(swarm-wasp): restore config update logic

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: remove Hungarian notation from interfaces

  Part of Phase 1.3 of code structure refactoring plan.

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): refactor generators

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(core): implement CRUD generation

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: migrate all Wasp references to swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - chore: add changesets for release [skip ci]

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): simplify generator API

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build(mcp): fix TS configuration

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - build: update compiler target to es2022

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(core): implement Eta templating

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor(config): improve template resolution

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - test: relocate test files

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - refactor: merge swarm-config into swarm-wasp

- [#16](https://github.com/Genyus/swarm/pull/16) [`6044ca5`](https://github.com/Genyus/swarm/commit/6044ca517a6b693cf979713e340d3ff788af96d0) Thanks [@Genyus](https://github.com/Genyus)! - fix(wasp): extend optional field support
