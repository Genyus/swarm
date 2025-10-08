/**
 * @ingenyus/swarm-core
 *
 * Core Swarm logic - CLI, MCP server, plugin system, generators, templates, utilities, and types for Wasp development
 */

// Export all utilities
export * from './utils/index';

// Export all types
export * from './types/index';

// Export plugin system interfaces
export * from './interfaces/plugin-manifest';

// Export CLI functionality
export { CommandManager } from './cli/command-manager';
export * from './cli/index';

// Export MCP functionality
export * from './mcp/index';

// Export templates (will be available at runtime)
export const TEMPLATES_DIR = './templates';
