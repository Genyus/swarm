// Export all types
export * from './filesystem';
export * from './logger';

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
