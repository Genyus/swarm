import { SwarmPluginInterface } from '@ingenyus/swarm-core';
import {
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  OperationGenerator,
  RouteGenerator,
} from '.';
import { getPluginVersion } from './utils/plugin';

export function createWaspPlugin(): SwarmPluginInterface {
  return {
    name: 'wasp',
    version: getPluginVersion(),
    description: 'Wasp Plugin for Swarm',
    swarmVersion: '0.1.0',
    generators: [
      new ApiGenerator(),
      new ApiNamespaceGenerator(),
      new CrudGenerator(),
      new FeatureDirectoryGenerator(),
      new JobGenerator(),
      new OperationGenerator(),
      new RouteGenerator(),
    ],
  };
}

// Lazy-load the plugin to avoid circular dependency issues
let _apiPlugin: SwarmPluginInterface | null = null;

export function getWaspPlugin(): SwarmPluginInterface {
  if (!_apiPlugin) {
    _apiPlugin = createWaspPlugin();
  }

  return _apiPlugin;
}

// Export for plugin resolver system
export const wasp = getWaspPlugin;
