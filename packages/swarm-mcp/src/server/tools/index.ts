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
  SwarmGenerateApiNamespaceParams,
  SwarmGenerateApiParams,
  SwarmGenerateCrudParams,
  SwarmGenerateFeatureParams,
  SwarmGenerateJobParams,
  SwarmGenerateOperationParams,
  SwarmGenerateRouteParams,
} from '../types/swarm.js';

import {
  deleteFile,
  listDirectory,
  readFile,
  rollback,
  writeFile,
} from './filesystem.js';

import {
  swarmGenerateApi,
  swarmGenerateApiNamespace,
  swarmGenerateCrud,
  swarmGenerateFeature,
  swarmGenerateJob,
  swarmGenerateOperation,
  swarmGenerateRoute,
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
  swarm_generate_api: swarmGenerateApi as (
    params: SwarmGenerateApiParams
  ) => Promise<GenerationResult>,
  swarm_generate_feature: swarmGenerateFeature as (
    params: SwarmGenerateFeatureParams
  ) => Promise<GenerationResult>,
  swarm_generate_crud: swarmGenerateCrud as (
    params: SwarmGenerateCrudParams
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
} as const;
