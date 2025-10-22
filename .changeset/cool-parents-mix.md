---
"@ingenyus/swarm": patch
---

fix: prevent full stack trace display for user-facing errors

Change error logging in handleGeneratorError from error.stack to error.message
to provide clean, user-friendly error output instead of verbose stack traces.

Previously when a generator failed (e.g., file already exists), users would see
the full stack trace with internal file paths and line numbers. Now they see
only the clean error message.

Before:
[Swarm] › ✖ error Failed to generate Action: Error: Operation file already exists
at ActionGenerator.checkExistence (file:///.../dist/index.js:1346:13)
at ActionGenerator.checkFileExists (file:///.../dist/index.js:1355:17)
... [many more lines]

After:
[Swarm] › ✖ error Failed to generate Action: Operation file already exists

Stack traces can still be shown when SWARM_DEBUG=1 is set via the error()
utility function in common/errors.ts.
