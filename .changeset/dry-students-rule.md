---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor(swarm-wasp): split operation generator into action and query generators

- Refactor OperationGenerator into ActionGenerator and QueryGenerator
- ActionGenerator handles create, update, delete operations
- QueryGenerator handles get, getAll, getFiltered operations
- Extract common logic to OperationGeneratorBase
- Update all tests to use new generators
- Fix template path resolution for config templates
- Minimize code duplication while maintaining clear separation of concerns
