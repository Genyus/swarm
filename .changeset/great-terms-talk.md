---
"@ingenyus/swarm": patch
---

fix(mcp): propagate generator errors to MCP clients

- Return appropriate status when generator methods fail
- Refactor SwarmTools to eliminate code duplication
