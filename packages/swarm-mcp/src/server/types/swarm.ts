import {
  ActionOperation,
  CrudOperation,
  HttpMethod,
  QueryOperation,
} from '@ingenyus/swarm-core';
import { z } from 'zod';

export interface CliParams {
  projectPath?: string;
  options?: Record<string, unknown>;
}

export interface CliResult {
  success: boolean;
  output: string;
  error?: string;
  generatedFiles?: string[];
  modifiedFiles?: string[];
}

export interface GenerateApiParams extends CliParams {
  feature: string;
  name: string;
  method: HttpMethod;
  route: string;
  entities?: string[];
  auth?: boolean;
  force?: boolean;
  customMiddleware?: boolean;
}

export interface GenerateFeatureParams extends CliParams {
  name: string;
}

export interface GenerateCrudParams extends CliParams {
  feature: string;
  dataType: string;
  public?: CrudOperation[];
  override?: CrudOperation[];
  exclude?: CrudOperation[];
  force?: boolean;
}

export interface GenerateJobParams extends CliParams {
  feature: string;
  name: string;
  schedule?: string;
  scheduleArgs?: string;
  entities?: string[];
  force?: boolean;
}

export interface GenerateOperationParams extends CliParams {
  feature: string;
  operation: ActionOperation | QueryOperation;
  dataType: string;
  entities?: string[];
  auth?: boolean;
  force?: boolean;
}

export interface GenerateRouteParams extends CliParams {
  feature: string;
  name: string;
  path: string;
  auth?: boolean;
  force?: boolean;
}

export interface GenerateApiNamespaceParams extends CliParams {
  feature: string;
  name: string;
  path: string;
  force?: boolean;
}

export interface GenerationResult extends CliResult {
  generatedFiles: string[];
  modifiedFiles: string[];
  skippedFiles?: string[];
  warnings?: string[];
  conflicts?: {
    file: string;
    reason: string;
    resolution?: 'overwrite' | 'skip' | 'merge';
  }[];
}

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'ALL']);
export const OperationTypeSchema = z.enum(['query', 'action']);
export const ActionOperationSchema = z.enum(['create', 'update', 'delete']);
export const QueryOperationSchema = z.enum(['get', 'getAll']);
export const CrudOperationSchema = z.enum([
  'create',
  'update',
  'delete',
  'get',
  'getAll',
]);

export const CliParamsSchema = z.object({
  projectPath: z.string().optional(),
  options: z.record(z.unknown()).optional(),
});

export const GenerateApiParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  name: z.string().min(1),
  method: HttpMethodSchema,
  route: z.string().min(1),
  entities: z.array(z.string()).optional(),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
  customMiddleware: z.boolean().optional(),
});

export const GenerateFeatureParamsSchema = CliParamsSchema.extend({
  name: z.string().min(1),
});

export const GenerateCrudParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  dataType: z.string().min(1),
  public: z.array(CrudOperationSchema).optional(),
  override: z.array(CrudOperationSchema).optional(),
  exclude: z.array(CrudOperationSchema).optional(),
  force: z.boolean().optional(),
});

export const GenerateJobParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  name: z.string().min(1),
  schedule: z.string().optional(),
  scheduleArgs: z.string().optional(),
  entities: z.array(z.string()).optional(),
  force: z.boolean().optional(),
});

export const GenerateOperationParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  operation: z.union([ActionOperationSchema, QueryOperationSchema]),
  dataType: z.string().min(1),
  entities: z.array(z.string()).optional(),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const GenerateRouteParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const GenerateApiNamespaceParamsSchema =
  CliParamsSchema.extend({
    feature: z.string().min(1),
    name: z.string().min(1),
    path: z.string().min(1),
    force: z.boolean().optional(),
  });
