# Swarm MCP Server Usage Examples

This document provides practical examples and common workflows for using the Swarm MCP Server with AI development agents.

## 🚀 Getting Started Examples

### Basic Server Setup

```typescript
// Start the MCP server
const server = new SwarmMCPServer({
  logging: {
    level: 'info',
    format: 'json',
    serviceName: 'swarm-mcp'
  }
});

await server.start();
```

### Simple File Operations

```typescript
// Read a configuration file
const config = await mcp.readFile({
  uri: 'wasp.config.ts',
  projectPath: '/path/to/project'
});

// Write a new component
const result = await mcp.writeFile({
  uri: 'src/components/NewComponent.tsx',
  contents: `
import React from 'react';

export const NewComponent: React.FC = () => {
  return <div>Hello from NewComponent!</div>;
};
  `,
  backup: true
});

// List project structure
const entries = await mcp.listDirectory({
  uri: 'src',
  projectPath: '/path/to/project'
});
```

## 🏗️ Complete Application Workflows

### 1. User Management System

Generate a complete user management system with features, CRUD operations, API endpoints, and routes.

```typescript
// Step 1: Generate the User feature
const userFeature = await mcp.swarm_generate_feature({
  name: 'UserManagement',
  dataType: 'User',
  components: ['UserList', 'UserForm', 'UserDetail', 'UserProfile'],
  withTests: true,
  force: false
});

// Step 2: Generate CRUD operations
const userCRUD = await mcp.swarm_generate_crud({
  entity: 'User',
  dataType: 'User',
  publicFields: ['id', 'name', 'email', 'avatar'],
  excludeFields: ['password', 'resetToken'],
  force: false
});

// Step 3: Generate API endpoints
const userAPI = await mcp.swarm_generate_api({
  name: 'UserAPI',
  method: 'ALL',
  route: '/api/users',
  entities: ['User'],
  auth: true,
  force: false
});

// Step 4: Generate page routes
const userRoutes = await mcp.swarm_generate_route({
  name: 'UsersPage',
  path: '/users',
  auth: true,
  force: false
});

const userDetailRoute = await mcp.swarm_generate_route({
  name: 'UserDetailPage',
  path: '/users/:id',
  auth: true,
  force: false
});

// Step 5: Generate operations
const getUserQuery = await mcp.swarm_generate_operation({
  operation: 'query',
  name: 'getUser',
  dataType: 'User',
  entities: ['User'],
  force: false
});

const createUserAction = await mcp.swarm_generate_operation({
  operation: 'action',
  name: 'createUser',
  dataType: 'User',
  entities: ['User'],
  force: false
});
```

### 2. Blog System with Posts and Comments

Create a blog system with related entities and operations.

```typescript
// Step 1: Generate Post feature
const postFeature = await mcp.swarm_generate_feature({
  name: 'BlogPosts',
  dataType: 'Post',
  components: ['PostList', 'PostDetail', 'PostEditor', 'PostCard'],
  withTests: true,
  force: false
});

// Step 2: Generate Comment feature
const commentFeature = await mcp.swarm_generate_feature({
  name: 'Comments',
  dataType: 'Comment',
  components: ['CommentList', 'CommentForm', 'CommentItem'],
  withTests: false,
  force: false
});

// Step 3: Generate CRUD for both entities
const postCRUD = await mcp.swarm_generate_crud({
  entity: 'Post',
  dataType: 'Post',
  publicFields: ['id', 'title', 'content', 'author', 'publishedAt'],
  excludeFields: ['draft'],
  force: false
});

const commentCRUD = await mcp.swarm_generate_crud({
  entity: 'Comment',
  dataType: 'Comment',
  publicFields: ['id', 'content', 'author', 'createdAt'],
  excludeFields: ['moderated'],
  force: false
});

// Step 4: Generate API namespace and endpoints
const blogNamespace = await mcp.swarm_generate_apinamespace({
  name: 'blog',
  path: '/api/blog',
  force: false
});

const postsAPI = await mcp.swarm_generate_api({
  name: 'PostsAPI',
  method: 'ALL',
  route: '/api/blog/posts',
  entities: ['Post', 'Comment'],
  auth: true,
  force: false
});

const commentsAPI = await mcp.swarm_generate_api({
  name: 'CommentsAPI',
  method: 'GET',
  route: '/api/blog/posts/:postId/comments',
  entities: ['Comment'],
  auth: false,
  force: false
});

// Step 5: Generate routes
const blogRoutes = [
  { name: 'BlogHome', path: '/blog', auth: false },
  { name: 'PostDetail', path: '/blog/posts/:id', auth: false },
  { name: 'PostEditor', path: '/blog/posts/new', auth: true },
  { name: 'PostEdit', path: '/blog/posts/:id/edit', auth: true }
];

for (const route of blogRoutes) {
  await mcp.swarm_generate_route({
    name: route.name,
    path: route.path,
    auth: route.auth,
    force: false
  });
}
```

### 3. E-commerce Product Catalog

Build a product catalog with categories, products, and inventory management.

```typescript
// Step 1: Generate core features
const features = [
  { name: 'ProductCatalog', dataType: 'Product', components: ['ProductGrid', 'ProductCard', 'ProductDetail'] },
  { name: 'CategoryManagement', dataType: 'Category', components: ['CategoryList', 'CategoryForm'] },
  { name: 'Inventory', dataType: 'Inventory', components: ['InventoryStatus', 'StockAlert'] }
];

for (const feature of features) {
  await mcp.swarm_generate_feature({
    name: feature.name,
    dataType: feature.dataType,
    components: feature.components,
    withTests: true,
    force: false
  });
}

// Step 2: Generate CRUD operations
const entities = [
  { entity: 'Product', dataType: 'Product', publicFields: ['id', 'name', 'description', 'price', 'category'], excludeFields: ['cost', 'supplier'] },
  { entity: 'Category', dataType: 'Category', publicFields: ['id', 'name', 'description'], excludeFields: ['internal'] },
  { entity: 'Inventory', dataType: 'Inventory', publicFields: ['id', 'productId', 'quantity', 'status'], excludeFields: ['reorderPoint'] }
];

for (const entity of entities) {
  await mcp.swarm_generate_crud({
    entity: entity.entity,
    dataType: entity.dataType,
    publicFields: entity.publicFields,
    excludeFields: entity.excludeFields,
    force: false
  });
}

// Step 3: Generate API structure
const apiNamespace = await mcp.swarm_generate_apinamespace({
  name: 'v1',
  path: '/api/v1',
  force: false
});

const catalogAPI = await mcp.swarm_generate_api({
  name: 'CatalogAPI',
  method: 'GET',
  route: '/api/v1/catalog',
  entities: ['Product', 'Category'],
  auth: false,
  force: false
});

const adminAPI = await mcp.swarm_generate_api({
  name: 'AdminAPI',
  method: 'ALL',
  route: '/api/v1/admin',
  entities: ['Product', 'Category', 'Inventory'],
  auth: true,
  force: false
});

// Step 4: Generate background jobs
const jobs = [
  { name: 'InventoryCheck', schedule: '0 */6 * * *', entities: ['Inventory'] }, // Every 6 hours
  { name: 'LowStockAlert', schedule: '0 9 * * *', entities: ['Inventory'] },   // Daily at 9 AM
  { name: 'PriceUpdate', schedule: '0 2 * * 0', entities: ['Product'] }         // Weekly on Sunday at 2 AM
];

for (const job of jobs) {
  await mcp.swarm_generate_job({
    name: job.name,
    schedule: job.schedule,
    entities: job.entities,
    force: false
  });
}
```

## 🔄 File Management Patterns

### Safe File Operations with Rollback

```typescript
async function safeFileOperation() {
  const rollbackTokens: string[] = [];
  
  try {
    // Create multiple files with backup
    const files = [
      { uri: 'src/components/ComponentA.tsx', content: 'export const ComponentA = () => <div>A</div>;' },
      { uri: 'src/components/ComponentB.tsx', content: 'export const ComponentB = () => <div>B</div>;' },
      { uri: 'src/components/ComponentC.tsx', content: 'export const ComponentC = () => <div>C</div>;' }
    ];
    
    for (const file of files) {
      const result = await mcp.writeFile({
        uri: file.uri,
        contents: file.content,
        backup: true
      });
      
      if (result.success && result.rollbackToken) {
        rollbackTokens.push(result.rollbackToken);
      }
    }
    
    // Validate the generated files
    const validationResult = await validateGeneratedFiles();
    if (!validationResult.success) {
      throw new Error('Generated files failed validation');
    }
    
    console.log('All files created successfully!');
    
  } catch (error) {
    console.error('Error during file operation, rolling back...');
    
    // Rollback all operations in reverse order
    for (const token of rollbackTokens.reverse()) {
      try {
        await mcp.rollback({ token });
      } catch (rollbackError) {
        console.error('Rollback failed for token:', token, rollbackError);
      }
    }
    
    throw error;
  }
}
```

### Batch File Generation

```typescript
async function generateFeatureFiles(featureName: string, components: string[]) {
  const results = [];
  
  // Generate main feature file
  const featureResult = await mcp.swarm_generate_feature({
    name: featureName,
    components,
    withTests: true,
    force: false
  });
  results.push(featureResult);
  
  // Generate individual component files if needed
  for (const component of components) {
    const componentResult = await mcp.writeFile({
      uri: `src/features/${featureName}/${component}.tsx`,
      contents: generateComponentContent(component, featureName),
      backup: true
    });
    results.push(componentResult);
  }
  
  // Generate index file
  const indexResult = await mcp.writeFile({
    uri: `src/features/${featureName}/index.ts`,
    contents: generateIndexContent(components),
    backup: true
  });
  results.push(indexResult);
  
  return results;
}
```

## 🧪 Testing and Validation

### Project Structure Validation

```typescript
async function validateProjectStructure(projectPath: string) {
  const requiredDirs = ['src', 'src/components', 'src/features', 'src/operations'];
  const requiredFiles = ['main.wasp.ts', 'package.json'];
  
  const errors = [];
  
  // Check required directories
  for (const dir of requiredDirs) {
    try {
      const entries = await mcp.listDirectory({ uri: dir, projectPath });
      if (entries.entries.length === 0) {
        errors.push(`Directory ${dir} is empty`);
      }
    } catch (error) {
      errors.push(`Directory ${dir} not found or inaccessible`);
    }
  }
  
  // Check required files
  for (const file of requiredFiles) {
    try {
      await mcp.readFile({ uri: file, projectPath });
    } catch (error) {
      errors.push(`Required file ${file} not found`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors,
    message: errors.length === 0 ? 'Project structure is valid' : 'Project structure validation failed'
  };
}
```

### Generated Code Validation

```typescript
async function validateGeneratedCode(projectPath: string) {
  const validationResults = [];
  
  // Check for TypeScript compilation errors
  try {
    const tsConfig = await mcp.readFile({ uri: 'tsconfig.json', projectPath });
    // Parse and validate TypeScript configuration
    
    // Check for common issues
    const issues = await checkForCommonIssues(projectPath);
    validationResults.push(...issues);
    
  } catch (error) {
    validationResults.push('TypeScript configuration not found');
  }
  
  // Check for missing imports or dependencies
  const dependencyIssues = await checkDependencies(projectPath);
  validationResults.push(...dependencyIssues);
  
  return {
    success: validationResults.length === 0,
    issues: validationResults,
    message: validationResults.length === 0 ? 'Generated code is valid' : 'Generated code has issues'
  };
}
```

## 🔧 Configuration Management

### Dynamic Configuration Updates

```typescript
async function updateServerConfiguration(updates: any) {
  try {
    // Read current configuration
    const configPath = '.taskmaster/config.json';
    const currentConfig = await mcp.readFile({ uri: configPath });
    const config = JSON.parse(currentConfig.contents);
    
    // Apply updates
    const updatedConfig = { ...config, ...updates };
    
    // Write updated configuration
    const result = await mcp.writeFile({
      uri: configPath,
      contents: JSON.stringify(updatedConfig, null, 2),
      backup: true
    });
    
    if (result.success) {
      console.log('Configuration updated successfully');
      return { success: true, config: updatedConfig };
    } else {
      throw new Error('Failed to update configuration');
    }
    
  } catch (error) {
    console.error('Configuration update failed:', error);
    return { success: false, error: error.message };
  }
}
```

## 🚨 Error Handling Patterns

### Comprehensive Error Handling

```typescript
async function robustSwarmOperation(operation: any, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await operation();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || 'Operation failed');
      }
      
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        throw new Error(`Operation failed after ${retries} attempts: ${error.message}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

// Usage example
const result = await robustSwarmOperation(async () => {
  return await mcp.swarm_generate_feature({
    name: 'RetryFeature',
    components: ['Main'],
    withTests: false,
    force: false
  });
});
```

### Graceful Degradation

```typescript
async function generateFeatureWithFallback(featureName: string, components: string[]) {
  try {
    // Try to generate with full feature set
    const result = await mcp.swarm_generate_feature({
      name: featureName,
      components,
      withTests: true,
      force: false
    });
    
    return result;
    
  } catch (error) {
    console.warn('Full feature generation failed, trying minimal version:', error.message);
    
    try {
      // Fallback to minimal generation
      const fallbackResult = await mcp.swarm_generate_feature({
        name: featureName,
        components: ['Main'],
        withTests: false,
        force: false
      });
      
      return {
        ...fallbackResult,
        warnings: [...(fallbackResult.warnings || []), 'Generated minimal feature due to generation errors']
      };
      
    } catch (fallbackError) {
      throw new Error(`Feature generation failed completely: ${fallbackError.message}`);
    }
  }
}
```

## 📊 Monitoring and Logging

### Operation Tracking

```typescript
class OperationTracker {
  private operations: Map<string, any> = new Map();
  
  async trackOperation(operationId: string, operation: () => Promise<any>) {
    const startTime = Date.now();
    const operationInfo = {
      id: operationId,
      startTime,
      status: 'running'
    };
    
    this.operations.set(operationId, operationInfo);
    
    try {
      const result = await operation();
      
      this.operations.set(operationId, {
        ...operationInfo,
        status: 'completed',
        duration: Date.now() - startTime,
        result
      });
      
      return result;
      
    } catch (error) {
      this.operations.set(operationId, {
        ...operationInfo,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error.message
      });
      
      throw error;
    }
  }
  
  getOperationStatus(operationId: string) {
    return this.operations.get(operationId);
  }
  
  getAllOperations() {
    return Array.from(this.operations.values());
  }
}

// Usage
const tracker = new OperationTracker();

const result = await tracker.trackOperation('feature-generation', async () => {
  return await mcp.swarm_generate_feature({
    name: 'TrackedFeature',
    components: ['Main'],
    withTests: false,
    force: false
  });
});
```

These examples demonstrate the flexibility and power of the Swarm MCP Server for building complex applications with AI assistance. Each pattern can be adapted and combined to create sophisticated development workflows.
