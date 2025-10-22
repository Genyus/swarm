---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: restructure monorepo

- Merge base functionality from swarm-cli and swarm-mcp into swarm-core
- Implement metadata-driven generation for CLI commands and MCP tools
- Extract Wasp entity generators into new swarm-wasp package
