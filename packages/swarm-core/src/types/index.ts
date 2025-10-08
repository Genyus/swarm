// Export all types
export * from './constants';
export * from './filesystem';
// export * from './generator';
export * from './interfaces';
export * from './logger';
// export * from './plugin';
export * from './prisma';

// Export new plugin system interfaces
export * from '../base-classes/base-generator';
export * from '../config/swarm-config';
export * from '../interfaces/field-metadata';
export * from '../interfaces/generator';
export * from '../interfaces/plugin';
export * from '../plugin/registry';
export * from '../utils/schema-builder';

// Re-export plugin interfaces with different names to avoid conflicts
export type {
  CommandResult,
  GenerationResult,
  SwarmGenerator as GeneratorInterface,
  MCPToolResult,
  ValidationResult,
} from '../interfaces/generator';
export type {
  PluginDependency as PluginDependencyInterface,
  SwarmPlugin as SwarmPluginInterface,
} from '../interfaces/plugin';

// Export plugin manager separately to avoid conflicts
export { PluginManager as SwarmPluginManager } from '../plugin/manager';
