import { SwarmPlugin } from '@ingenyus/swarm';
import { getPluginVersion } from '../common';
import {
  ActionGenerator,
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from '../generators';
import { PLUGIN_NAME } from '../types';

function createWaspPlugin(): SwarmPlugin {
  return {
    name: PLUGIN_NAME,
    version: getPluginVersion(),
    description: 'Wasp Plugin for Swarm',
    generators: [
      new ActionGenerator(),
      new ApiGenerator(),
      new ApiNamespaceGenerator(),
      new CrudGenerator(),
      new FeatureGenerator(),
      new JobGenerator(),
      new QueryGenerator(),
      new RouteGenerator(),
    ],
  };
}

// Lazy-load the plugin to avoid circular dependency issues
let plugin: SwarmPlugin | null = null;

function getWaspPlugin(): SwarmPlugin {
  if (!plugin) {
    plugin = createWaspPlugin();
  }

  return plugin;
}

export const wasp = getWaspPlugin;
