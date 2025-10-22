---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(wasp): rename base classes to use Base suffix

- Renamed BaseWaspGenerator to WaspGeneratorBase
- Renamed BaseEntityGenerator to EntityGeneratorBase
- Renamed BaseOperationGenerator to OperationGeneratorBase
- Renamed files to use .base.ts suffix convention:
  - base-wasp-generator.ts → wasp-generator.base.ts
  - base-entity-generator.ts → entity-generator.base.ts
  - base-operation-generator.ts → operation-generator.base.ts
- Updated all imports and class extensions across all generators

Part of Phase 1.2 of code structure refactoring plan.
