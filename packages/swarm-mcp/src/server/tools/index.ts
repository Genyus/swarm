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

import {
  deleteFile,
  listDirectory,
  readFile,
  rollback,
  writeFile,
} from './filesystem.js';

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
} as const;
