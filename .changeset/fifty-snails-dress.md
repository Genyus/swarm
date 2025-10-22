---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

fix: complete Hungarian notation removal and fix type issues

- Fixed remaining FileSystem import issues
- Removed duplicate base class files that weren't properly deleted
- Fixed FeatureDirectoryGenerator type from Generator<string> to SwarmGenerator<SchemaArgs>
- Updated entity-generator.base.ts to use correct type parameter
- Fixed test mock to match correct SwarmGenerator interface
- Removed IFeatureDirectoryGenerator export from package index
- All builds now passing

Part of Phase 1.3 completion.
