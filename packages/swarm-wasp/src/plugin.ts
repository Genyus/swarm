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

export function createApiPlugin(): SwarmPluginInterface {
  return {
    name: 'wasp-api',
    version: getPluginVersion(),
    description: 'API Plugin for Swarm Wasp',
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

export function getApiPlugin(): SwarmPluginInterface {
  if (!_apiPlugin) {
    _apiPlugin = createApiPlugin();
  }
  return _apiPlugin;
}
