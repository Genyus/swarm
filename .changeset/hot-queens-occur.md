---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: complete naming convention improvements

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
