---
"@ingenyus/swarm": patch
"@ingenyus/swarm-wasp": patch
---

refactor: improve operation code generation with consistent field helpers and type utilities

- Rename getIdField to getIdFields returning string[] for consistency
- Replace getOmitFields with getRequiredFields for clearer intent
- Update getOptionalFields to return string[] instead of Record<string, string>
- Add generatePickType helper for Pick type generation with optimisations
- Add generateOmitType helper for Omit type generation with optimisations
- Add generatePartialType helper for Partial type wrapping
- Add generateIntersectionType helper for type intersection logic
- Refactor generateOperationCode to use new helpers for cleaner type assembly
- Update all test mocks to match new function signatures
- Add comprehensive unit tests for new type generation helpers

Operation-specific type parameters now use:

- create: Pick<required> & Partial<Pick<optional>>
- update: Pick<id> & Partial<Omit<id>>
- get/delete: Pick<id>
- getAll: void
- getFiltered: Partial<Model>

All tests passing (133 passed, 3 skipped)
