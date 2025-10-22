---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

revert(swarm-wasp): restore config update logic

- Restore previous insertion logic that agent over-simplified
- Add proper config file content to readFileSync mocks
- Update template mocks to match actual config template format (.addX chaining)
- Remove utf8 encoding parameter from test expectations (not used in actual code)
- All tests now passing with restored config update behavior
