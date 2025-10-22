---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

fix(core): handle missing config file gracefully

- Create default configuration object instead of throwing error when config file not found
- Replace hard-coded configuration directory and file paths with constants
