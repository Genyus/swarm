---
"@ingenyus/swarm": minor
"@ingenyus/swarm-wasp": minor
---

feat(wasp): auto-include datatype in entities array for actions and queries

- Automatically add dataType to entities array if not already present
- Place dataType first in the array using unshift()
- Maintain backward compatibility with explicit entity specification
- Prevent duplicate dataType entries with includes() check
- Add test scaffolding for new behavior (tests partially complete)

This eliminates the need to manually specify the dataType in the
-e flag when generating actions and queries, as the generator already
knows which model it's operating on from the -d flag.

Resolves task #45
