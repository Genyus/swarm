---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

fix(wasp): fix CRUD generator command

- Add missing dataType argument
- Stop optional arguments being treated as required
- Fix incorrect await usage with non-async getDefinition method
- Unify generators directory in core package
- Improve CRUD generation test suite
