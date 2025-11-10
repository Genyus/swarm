import { defineGeneratorProvider, SwarmPlugin } from '@ingenyus/swarm';
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
import { schema as actionSchema } from '../generators/action/schema';
import { schema as apiNamespaceSchema } from '../generators/api-namespace/schema';
import { schema as apiSchema } from '../generators/api/schema';
import { schema as crudSchema } from '../generators/crud/schema';
import { schema as featureSchema } from '../generators/feature/schema';
import { schema as jobSchema } from '../generators/job/schema';
import { schema as querySchema } from '../generators/query/schema';
import { schema as routeSchema } from '../generators/route/schema';
import { PLUGIN_NAME } from '../types';

export const wasp: SwarmPlugin = {
  name: PLUGIN_NAME,
  generators: [
    defineGeneratorProvider({
      schema: actionSchema,
      create: (services) => new ActionGenerator(services),
    }),
    defineGeneratorProvider({
      schema: apiSchema,
      create: (services) => new ApiGenerator(services),
    }),
    defineGeneratorProvider({
      schema: apiNamespaceSchema,
      create: (services) => new ApiNamespaceGenerator(services),
    }),
    defineGeneratorProvider({
      schema: crudSchema,
      create: (services) => new CrudGenerator(services),
    }),
    defineGeneratorProvider({
      schema: featureSchema,
      create: (services) => new FeatureGenerator(services),
    }),
    defineGeneratorProvider({
      schema: jobSchema,
      create: (services) => new JobGenerator(services),
    }),
    defineGeneratorProvider({
      schema: querySchema,
      create: (services) => new QueryGenerator(services),
    }),
    defineGeneratorProvider({
      schema: routeSchema,
      create: (services) => new RouteGenerator(services),
    }),
  ],
};
