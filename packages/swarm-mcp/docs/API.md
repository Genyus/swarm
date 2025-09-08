# Swarm MCP Server API Reference

## Overview

The Swarm MCP Server provides programmatic access to Swarm CLI capabilities through the Model Context Protocol (MCP). This document describes all available tools, their parameters, and usage examples.

## Available Tools

### Swarm Generation Tools

#### `swarm_generate_api`
Generates API endpoints for Wasp applications.

**Parameters:**
```typescript
{
  feature: string;   // Feature name
  name: string;       // API name
  method: "GET" | "POST" | "PUT" | "DELETE" | "ALL";
  route: string;      // API route path
  entities: string[]; // Related entities
  auth: boolean;      // Require authentication
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_api({
  feature: "UserManagement",
  name: "UserAPI",
  method: "ALL",
  route: "/api/users",
  entities: ["User", "Post"],
  auth: true,
  force: false
});
```

#### `swarm_generate_feature`
Generates feature components for Wasp applications.

**Parameters:**
```typescript
{
  name: string;       // Feature name
  dataType?: string;  // Optional data type
  components: string[]; // Component names to generate
  withTests: boolean; // Generate test files
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_feature({
  name: "UserManagement",
  dataType: "User",
  components: ["UserList", "UserForm", "UserDetail"],
  withTests: true,
  force: false
});
```

#### `swarm_generate_crud`
Generates CRUD operations for entities.

**Parameters:**
```typescript
{
  feature: string;    // Feature name
  entity: string;     // Entity name
  dataType: string;   // Data type name
  publicFields?: string[]; // Public fields
  overrideFields?: string[]; // Override fields
  excludeFields?: string[]; // Exclude fields
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_crud({
  feature: "UserManagement",
  entity: "User",
  dataType: "User",
  publicFields: ["id", "name", "email"],
  excludeFields: ["password"],
  force: false
});
```

#### `swarm_generate_job`
Generates scheduled jobs for Wasp applications.

**Parameters:**
```typescript
{
  feature: string;    // Feature name
  name: string;       // Job name
  schedule?: string;  // Cron schedule expression
  args?: string[];    // Job arguments
  entities?: string[]; // Related entities
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_job({
  feature: "Maintenance",
  name: "CleanupJob",
  schedule: "0 2 * * *", // Daily at 2 AM
  entities: ["User", "Post"],
  force: false
});
```

#### `swarm_generate_operation`
Generates query and action operations.

**Parameters:**
```typescript
{
  operation: "query" | "action"; // Operation type
  name: string;       // Operation name
  dataType: string;   // Data type
  entities?: string[]; // Related entities
  feature?: string;   // Feature name
  subFeature?: string; // Sub-feature name
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_operation({
  operation: "query",
  name: "getUser",
  dataType: "User",
  entities: ["User"],
  force: false
});
```

#### `swarm_generate_route`
Generates page routes for Wasp applications.

**Parameters:**
```typescript
{
  feature: string;    // Feature name
  name: string;       // Route name
  path: string;       // Route path
  auth?: boolean;     // Require authentication
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_route({
  feature: "UserManagement",
  name: "UserProfile",
  path: "/profile/:id",
  auth: true,
  force: false
});
```

#### `swarm_generate_apinamespace`
Generates API namespace structures.

**Parameters:**
```typescript
{
  feature: string;    // Feature name
  name: string;       // Namespace name
  path: string;       // Namespace path
  force: boolean;     // Overwrite existing files
  projectPath?: string; // Optional project root path
}
```

**Returns:**
```typescript
{
  success: boolean;   // Generation success status
  output: string;     // Generation output
  generatedFiles: string[]; // List of generated files
  modifiedFiles: string[];  // List of modified files
  warnings: string[]; // Any warnings
}
```

**Example:**
```typescript
const result = await mcp.swarm_generate_apinamespace({
  feature: "ApiRoot",
  name: "v1",
  path: "/api/v1",
  force: false
});
```

## Error Handling

All tools return standardized error responses when operations fail:

```typescript
{
  success: false;
  error: string;      // Error message
  details?: string;   // Additional error details
}
```

Common error types:
- **ValidationError**: Invalid parameters or data
- **FileSystemError**: File operation failures
- **SwarmGenerationError**: Swarm CLI generation failures
- **PermissionDeniedError**: Insufficient permissions
- **ResourceNotFoundError**: File or resource not found

## Security Features

- **Path Validation**: All file operations validate paths to prevent directory traversal attacks
- **Project Isolation**: Operations are restricted to the specified project directory
- **Symlink Resolution**: Safe handling of symbolic links
- **File Size Limits**: Configurable limits on file operations
- **MIME Type Validation**: Automatic content type detection and validation

## Best Practices

1. **Always specify projectPath** for multi-project environments
2. **Use backup options** for critical file operations
3. **Handle rollback tokens** for error recovery
4. **Validate generated content** before committing
5. **Use force flag carefully** to avoid overwriting important files

## Integration Examples

### Complete Feature Generation Workflow

```typescript
// 1. Generate feature
const feature = await mcp.swarm_generate_feature({
  name: "UserManagement",
  dataType: "User",
  components: ["UserList", "UserForm"],
  withTests: true,
  force: false
});

// 2. Generate CRUD operations
const crud = await mcp.swarm_generate_crud({
  entity: "User",
  dataType: "User",
  publicFields: ["id", "name", "email"],
  excludeFields: ["password"],
  force: false
});

// 3. Generate API endpoints
const api = await mcp.swarm_generate_api({
  name: "UserAPI",
  method: "ALL",
  route: "/api/users",
  entities: ["User"],
  auth: true,
  force: false
});

// 4. Generate routes
const route = await mcp.swarm_generate_route({
  name: "UsersPage",
  path: "/users",
  auth: true,
  force: false
});
```

### File Management with Rollback

```typescript
// Write file with backup
const writeResult = await mcp.writeFile({
  uri: "src/components/NewComponent.tsx",
  contents: "export const NewComponent = () => <div>New</div>;",
  backup: true
});

if (writeResult.success && writeResult.rollbackToken) {
  // Store rollback token for potential recovery
  const rollbackToken = writeResult.rollbackToken;
  
  // If something goes wrong, rollback
  try {
    // ... other operations
  } catch (error) {
    await mcp.rollback({ token: rollbackToken });
  }
}
```
