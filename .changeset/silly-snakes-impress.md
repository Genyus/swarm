---
"@ingenyus/swarm": patch
---

fix: fix server registration in Cursor

- Set correct working directory even when called from different location
- Prevent duplicate MCP server instances and method invocations
