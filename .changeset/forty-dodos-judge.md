---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

fix: resolve test failures after refactoring

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
