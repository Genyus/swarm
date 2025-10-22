---
"@ingenyus/swarm": minor
"@ingenyus/swarm-wasp": minor
---

feat: add comprehensive support for Prisma composite primary keys

Add full support for models using @@id([field1, field2]) composite keys:

**Schema Parsing:**

- Parse @@id attribute to detect composite primary keys
- Extract field names from composite key definition
- Mark all composite key fields with isId: true in metadata

**Field Helper Functions:**

- Update getIdFields to return all ID fields as array (single or composite)
- Exclude ID fields from getRequiredFields (they may not be auto-generated)

**Operation Code Generation:**

- Detect composite keys and generate appropriate where clauses
- Single key: where: { id }
- Composite key: where: { userId_projectId: { userId, projectId } }
- Update function parameters to destructure all ID fields
- Support for get, delete, update operations with composite keys

**Template Updates:**

- Update get.eta to use idFieldParams and whereClause
- Update delete.eta to use idFieldParams and whereClause
- Maintain backward compatibility with single primary keys

**Tests:**

- Add mockCompositeKeyModel with userId/projectId composite key
- Test getIdFields returns multiple fields for composite keys
- Test getRequiredFields excludes composite key fields
- Test generatePickType handles composite key fields
- All 23 prisma.test.ts tests passing

Verified with UserProject model: @@id([userId, projectId])

- create: Pick<UserProject, "userId" | "projectId">
- get/delete: where: { userId_projectId: { userId, projectId } }
