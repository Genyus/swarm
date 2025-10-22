---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: update imports to use barrel paths

swarm-core:

- Updated contracts imports to use '../contracts' barrel
- Updated common imports to use '../common' barrel
- Updated plugin imports to use '../plugin' barrel
- Fixed GeneratorInterfaceManager export (class, not type)

swarm-wasp:

- Updated base generator imports to use '../base' barrel
- Updated common imports to use '../../common' barrel
- Reverted WaspGeneratorBase to direct import to avoid circular resolution
- All schema files now import from common barrel

Benefits:

- Cleaner imports throughout the codebase
- Better encapsulation of module boundaries
- Easier to refactor internal structure without breaking imports
- More maintainable codebase

All tests passing.
