import { GeneratorArgs, PluginGenerator, SwarmPlugin } from '@ingenyus/swarm';
import {
  ActionGenerator,
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '.';
import { getPluginVersion } from './common';
import { PLUGIN_NAME } from './types';

export function createWaspPlugin(): SwarmPlugin {
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
      new FeatureGenerator(),
      new JobGenerator(),
      new QueryGenerator(),
      new RouteGenerator(),
    ].map((generator) => generator as PluginGenerator<GeneratorArgs>),
  };
}

// Lazy-load the plugin to avoid circular dependency issues
let _apiPlugin: SwarmPlugin | null = null;

function getWaspPlugin(): SwarmPlugin {
  if (!_apiPlugin) {
    _apiPlugin = createWaspPlugin();
  }

  return _apiPlugin;
}

// Export for plugin resolver system
export const wasp = getWaspPlugin;
