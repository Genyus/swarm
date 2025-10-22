---
"@ingenyus/swarm": minor
"@ingenyus/swarm-wasp": minor
---

feat(swarm-wasp): improve create operations

- Handle default values and foreign keys in create operations
- Add getOptionalFields() helper to identify fields with non-DateTime defaults
- Update getOmitFields() to exclude fields with default values and foreign keys
- Modify create operation type generation to make optional fields truly optional
- Fields with defaults (except DateTime) are now properly optional in create types
- Foreign key fields are automatically excluded from create operations

Example: Task with 'isDone' boolean default(false) now generates:
Omit<Task, 'id' | 'userId' | 'isDone'> & { isDone?: boolean }
