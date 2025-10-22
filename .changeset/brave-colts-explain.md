---
"@ingenyus/swarm": minor
---

feat(cli): implement type safety for command arguments

- Add ambient module for Commander
- Introduce new CommandFactory class for creating type-safe CLI commands
- Replace previous command registration methods with new CommandBuilder class
- Add Zod schemas for consistent argument validation across commands
- Remove obsolete functions
