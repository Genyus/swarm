import { realFileSystem } from '@ingenyus/swarm-core/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-core/dist/utils/logger.js';
import type {
  GenerateActionParams,
  GenerateApiNamespaceParams,
  GenerateApiParams,
  GenerateCrudParams,
  GenerateFeatureParams,
  GenerateJobParams,
  GenerateQueryParams,
  GenerateRouteParams,
} from '../types/swarm.js';
import { SwarmTools } from './swarm.js';

const swarmTools = SwarmTools.create(realLogger, realFileSystem);

export * from './swarm.js';
export const tools = {
  generate_wasp_api: (params: GenerateApiParams) =>
    swarmTools.generateApi(params),
  generate_wasp_feature: (params: GenerateFeatureParams) =>
    swarmTools.generateFeature(params),
  generate_wasp_crud: (params: GenerateCrudParams) =>
    swarmTools.generateCrud(params),
  generate_wasp_job: (params: GenerateJobParams) =>
    swarmTools.generateJob(params),
  generate_wasp_action: (params: GenerateActionParams) =>
    swarmTools.generateAction(params),
  generate_wasp_query: (params: GenerateQueryParams) =>
    swarmTools.generateQuery(params),
  generate_wasp_route: (params: GenerateRouteParams) =>
    swarmTools.generateRoute(params),
  generate_wasp_apinamespace: (params: GenerateApiNamespaceParams) =>
    swarmTools.generateApiNamespace(params),
} as const;
