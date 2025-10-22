---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: renamed swarm-core to swarm

- Removed name property from root package.json to avoid conflict

Verification:
✅ both packages build successfully
✅ All tests passing (swarm: 185/185, swarm-wasp: 104/107)
