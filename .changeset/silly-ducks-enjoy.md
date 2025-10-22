---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

chore: complete refactoring - knip ignore rules and final cleanup

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
