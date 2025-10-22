---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(core): rename BaseGenerator to GeneratorBase and SwarmLogger to SignaleLogger

- Renamed BaseGenerator class to GeneratorBase following naming convention
- Renamed SwarmLogger class to SignaleLogger for clarity
- Renamed base-generator.ts to generator.base.ts
- Renamed logger.ts to signale-logger.ts
- Updated all imports across swarm-core and swarm-wasp packages
- Updated all references in MCP server files and test files

Part of Phase 1.1 of code structure refactoring plan.
