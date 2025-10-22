---
"@ingenyus/swarm": patch
---

refactor(core): consolidate schema introspection

- Add SchemaAnalyser utility class to centralise Zod schema handling
- Update CommandFactory and ToolFactory to use new class
- Replace use of deprecated private \_def property with public API (\_zod.def)
- Add tests
