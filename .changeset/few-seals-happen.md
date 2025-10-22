---
"@ingenyus/swarm": minor
"@ingenyus/swarm-wasp": minor
---

feat(swarm-wasp): add optional custom name parameter to action and query generators

- Add optional 'name' parameter to action and query generator schemas
- Update ActionGenerator and QueryGenerator to extract and pass custom name
- Modify OperationGeneratorBase.getOperationName to accept customName parameter
- Preserve schema metadata when making name parameter optional using extend()
- Update ActionFlags and QueryFlags types to include name property
- Add test coverage for custom operation names

Resolves Task #44
