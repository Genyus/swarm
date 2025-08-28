import type {
  DeleteFileParams,
  DeleteFileResult,
  ListDirectoryParams,
  ListDirectoryResult,
  ReadFileParams,
  ReadFileResult,
  RollbackParams,
  RollbackResult,
  WriteFileParams,
  WriteFileResult,
} from '../types/mcp.js';

import type {
  GenerationResult,
  SwarmAnalyzeProjectParams,
  SwarmAnalyzeProjectResult,
  SwarmGenerateApiNamespaceParams,
  SwarmGenerateAPIParams,
  SwarmGenerateCRUDParams,
  SwarmGenerateFeatureParams,
  SwarmGenerateJobParams,
  SwarmGenerateOperationParams,
  SwarmGenerateRouteParams,
  SwarmValidateConfigParams,
  SwarmValidateConfigResult,
} from '../types/swarm.js';

import {
  deleteFile,
  listDirectory,
  readFile,
  rollback,
  writeFile,
} from './filesystem.js';

import {
  swarmAnalyzeProject,
  swarmGenerateAPI,
  swarmGenerateApiNamespace,
  swarmGenerateCRUD,
  swarmGenerateFeature,
  swarmGenerateJob,
  swarmGenerateOperation,
  swarmGenerateRoute,
  swarmValidateConfig,
} from './swarm.js';

export * from './filesystem.js';
export * from './swarm.js';

export const tools = {
  readFile: readFile as (params: ReadFileParams) => Promise<ReadFileResult>,
  writeFile: writeFile as (params: WriteFileParams) => Promise<WriteFileResult>,
  listDirectory: listDirectory as (
    params: ListDirectoryParams
  ) => Promise<ListDirectoryResult>,
  deleteFile: deleteFile as (
    params: DeleteFileParams
  ) => Promise<DeleteFileResult>,
  rollback: rollback as (params: RollbackParams) => Promise<RollbackResult>,
  swarm_generate_api: swarmGenerateAPI as (
    params: SwarmGenerateAPIParams
  ) => Promise<GenerationResult>,
  swarm_generate_feature: swarmGenerateFeature as (
    params: SwarmGenerateFeatureParams
  ) => Promise<GenerationResult>,
  swarm_generate_crud: swarmGenerateCRUD as (
    params: SwarmGenerateCRUDParams
  ) => Promise<GenerationResult>,
  swarm_generate_job: swarmGenerateJob as (
    params: SwarmGenerateJobParams
  ) => Promise<GenerationResult>,
  swarm_generate_operation: swarmGenerateOperation as (
    params: SwarmGenerateOperationParams
  ) => Promise<GenerationResult>,
  swarm_generate_route: swarmGenerateRoute as (
    params: SwarmGenerateRouteParams
  ) => Promise<GenerationResult>,
  swarm_generate_apinamespace: swarmGenerateApiNamespace as (
    params: SwarmGenerateApiNamespaceParams
  ) => Promise<GenerationResult>,
  swarm_analyze_project: swarmAnalyzeProject as (
    params: SwarmAnalyzeProjectParams
  ) => Promise<SwarmAnalyzeProjectResult>,
  swarm_validate_config: swarmValidateConfig as (
    params: SwarmValidateConfigParams
  ) => Promise<SwarmValidateConfigResult>,
} as const;
