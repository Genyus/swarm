import { realFileSystem } from '@ingenyus/swarm-cli/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import type {
  SwarmGenerateApiNamespaceParams,
  SwarmGenerateApiParams,
  SwarmGenerateCrudParams,
  SwarmGenerateFeatureParams,
  SwarmGenerateJobParams,
  SwarmGenerateOperationParams,
  SwarmGenerateRouteParams,
} from '../types/swarm.js';
import { SwarmTools } from './swarm.js';

const swarmTools = SwarmTools.create(realLogger, realFileSystem);

export * from './swarm.js';
export const tools = {
  swarm_generate_api: (params: SwarmGenerateApiParams) =>
    swarmTools.generateApi(params),
  swarm_generate_feature: (params: SwarmGenerateFeatureParams) =>
    swarmTools.generateFeature(params),
  swarm_generate_crud: (params: SwarmGenerateCrudParams) =>
    swarmTools.generateCrud(params),
  swarm_generate_job: (params: SwarmGenerateJobParams) =>
    swarmTools.generateJob(params),
  swarm_generate_operation: (params: SwarmGenerateOperationParams) =>
    swarmTools.generateOperation(params),
  swarm_generate_route: (params: SwarmGenerateRouteParams) =>
    swarmTools.generateRoute(params),
  swarm_generate_apinamespace: (params: SwarmGenerateApiNamespaceParams) =>
    swarmTools.generateApiNamespace(params),
} as const;
