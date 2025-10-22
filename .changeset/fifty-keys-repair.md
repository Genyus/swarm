---
"@ingenyus/swarm": minor
"@ingenyus/swarm-wasp": minor
---

feat(wasp-config): implement semicolon normalisation in config files

- Add normaliseSemicolons() method to handle user-added semicolons
- Remove semicolons from all method calls in app chain
- Automatically add semicolon to the last method call
- Preserve semicolons outside the method chain
- Add comprehensive test coverage for semicolon handling

Resolves issues where manually added semicolons would break
subsequent config insertions by normalising semicolon usage
consistently across all feature configuration files.
