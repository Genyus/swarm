---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(wasp): reorganize directory structure

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
