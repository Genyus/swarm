---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: improve types and fix test imports in utils and generators

- Added underscores to unused parameters in mock functions
- Added proper type annotations (FileSystem, string | Buffer, etc.)
- Fixed test imports to use renamed generator files (\*-generator.ts)
- Updated Generator<string> to SwarmGenerator<{ path: string }> in all tests
- Added template utility mocks to generator tests for getDefinition
- Added type cast for template processing (as string, String())
- Fixed importActual type annotation for @ingenyus/swarm-core

All generator unit tests now passing.
