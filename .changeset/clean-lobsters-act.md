---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

test: fix api-generator test after refactoring

- Updated import to use './api-generator' instead of './generator'
- Changed type from Generator<string> to SwarmGenerator<{ path: string }>
- Removed access to protected class properties (path, checkConfigExists)
- Simplified template mocking to not access internal implementation
- Properly mock config template to return valid config definition
- Added resolveTemplatePath mock to templateUtility for second test
- All tests now passing

Fixes linter errors and test failures after generator file renaming.
