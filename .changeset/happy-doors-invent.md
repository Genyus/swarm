---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

test(wasp): overhaul integration tests

- Replace loose mocked tests with physical file generation and validation
- Generate a minimal Wasp application to test against
- Switch to single-fork execution to prevent test interference
