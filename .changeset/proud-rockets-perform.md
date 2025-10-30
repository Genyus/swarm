---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(swarm): fix generator type constraints

- Remove PluginGenerator interface and merge into Generator
- Make Generator interface generic with `S extends ExtendedSchema`
- Update all generators to use concrete schema types
- Add schema type parameter to all concrete generators (Action, Api, Crud, etc.)
- Update test mocks to use createMockFeatureGen with schema parameter
