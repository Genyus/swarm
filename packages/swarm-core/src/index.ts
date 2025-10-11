/**
 * @ingenyus/swarm-core
 *
 * Core Swarm logic - CLI, MCP server, plugin system, generators, templates, utilities, and types for Wasp development
 */

// Export all utilities
export * from './common/index';

// Export all types
export * from './types/index';

// Export plugin system interfaces
export * from './contracts/plugin-manifest';

// Export CLI functionality
export { CommandManager } from './cli/command-manager';
export * from './cli/index';

// Export MCP functionality
export * from './mcp/index';

// Export templates (will be available at runtime)
export const TEMPLATES_DIR = './templates';
