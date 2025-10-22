---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(core): reorganize directory structure

- Renamed base-classes/ to generator/
- Created contracts/ directory for API boundaries
- Moved interface files to contracts/
- Renamed utils/ to common/
- Renamed plugin files for clarity (manager.ts -> plugin-manager.ts, etc.)
- Moved generator-interface-manager.ts to plugin/
- Updated all imports across packages
- Removed leftover interfaces/ directory

Part of Phase 2.1 - swarm-core directory reorganization.
