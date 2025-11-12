import { createPlugin } from '@ingenyus/swarm';
import { PLUGIN_NAME } from './common';
import {
  ActionGenerator,
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator,
} from './generators';

export const wasp = createPlugin(
  PLUGIN_NAME,
  ActionGenerator,
  ApiGenerator,
  ApiNamespaceGenerator,
  CrudGenerator,
  FeatureGenerator,
  JobGenerator,
  QueryGenerator,
  RouteGenerator
);
