/**
 * @ingenyus/swarm
 *
 * Core Swarm logic - CLI, MCP server, plugin system, generators, templates, utilities, and types for Wasp development
 */

// Export all utilities
export * from './common/index';

// Export configuration
export * from './config/index';

// Export all types
export * from './types/index';

// Export plugin system interfaces
export * from './contracts/index';

// Export CLI functionality
export * from './cli/index';

// Export MCP functionality
export * from './mcp/index';

// Export new plugin system interfaces
export * from './plugin/index';

// Export generator base classes
export * from './generator/index';

// Export templates (will be available at runtime)
export const TEMPLATES_DIR = './templates';
