import { SwarmPluginInterface } from '@ingenyus/swarm';
import {
  ActionGenerator,
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureDirectoryGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '.';
import { getPluginVersion } from './common';
import { PLUGIN_NAME } from './types';

export function createWaspPlugin(): SwarmPluginInterface {
  return {
    name: PLUGIN_NAME,
    version: getPluginVersion(),
    description: 'Wasp Plugin for Swarm',
    swarmVersion: '0.1.0',
    generators: [
      new ActionGenerator(),
      new ApiGenerator(),
      new ApiNamespaceGenerator(),
      new CrudGenerator(),
      new FeatureDirectoryGenerator(),
      new JobGenerator(),
      new QueryGenerator(),
      new RouteGenerator(),
    ],
  };
}

// Lazy-load the plugin to avoid circular dependency issues
let _apiPlugin: SwarmPluginInterface | null = null;

function getWaspPlugin(): SwarmPluginInterface {
  if (!_apiPlugin) {
    _apiPlugin = createWaspPlugin();
  }

  return _apiPlugin;
}

// Export for plugin resolver system
export const wasp = getWaspPlugin;
