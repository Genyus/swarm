// Export all types
export * from './filesystem';
export * from './logger';

// Export new plugin system interfaces
export * from '../generator/generator.base';
export * from '../config/swarm-config';
export * from '../contracts/field-metadata';
export * from '../contracts/generator';
export * from '../contracts/plugin';
export * from '../plugin/plugin-registry';
export * from '../common/schema';

// Re-export plugin interfaces with different names to avoid conflicts
export type {
  CommandResult,
  GenerationResult,
  SwarmGenerator as GeneratorInterface,
  MCPToolResult,
  ValidationResult,
} from '../contracts/generator';
export type {
  PluginDependency as PluginDependencyInterface,
  SwarmPlugin as SwarmPluginInterface,
} from '../contracts/plugin';

// Export plugin manager separately to avoid conflicts
export { PluginManager as SwarmPluginManager } from '../plugin/plugin-manager';
