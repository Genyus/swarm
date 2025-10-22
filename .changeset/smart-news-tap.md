---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: remove Hungarian notation from interfaces

- Renamed IFileSystem to FileSystem
- Renamed IWaspConfigGenerator to ConfigGenerator
- Removed IFeatureDirectoryGenerator interface entirely, replaced with Generator<string>
- Updated all imports and references across both packages
- Deleted feature-directory-generator.ts interface file

Part of Phase 1.3 of code structure refactoring plan.
