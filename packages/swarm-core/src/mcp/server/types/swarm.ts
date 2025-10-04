import { z } from 'zod';
import {
  ActionOperation,
  CrudOperation,
  HttpMethod,
  QueryOperation,
} from '../../../types/constants';

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
  name: string; // Changed from dataType to name to match CLI
  public?: CrudOperation[];
  override?: CrudOperation[];
  exclude?: CrudOperation[];
  force?: boolean;
}

export interface GenerateJobParams extends CliParams {
  feature: string;
  name: string;
  cron?: string; // Changed from schedule to cron to match CLI
  args?: string; // Changed from scheduleArgs to args to match CLI
  entities?: string[];
  force?: boolean;
}

export interface GenerateActionParams extends CliParams {
  feature: string;
  operation: ActionOperation;
  dataType: string;
  entities?: string[];
  auth?: boolean;
  force?: boolean;
}

export interface GenerateQueryParams extends CliParams {
  feature: string;
  operation: QueryOperation;
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
  name: z.string().min(1), // Changed from dataType to name to match CLI
  public: z.array(CrudOperationSchema).optional(),
  override: z.array(CrudOperationSchema).optional(),
  exclude: z.array(CrudOperationSchema).optional(),
  force: z.boolean().optional(),
});

export const GenerateJobParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  name: z.string().min(1),
  cron: z.string().optional(), // Changed from schedule to cron to match CLI
  args: z.string().optional(), // Changed from scheduleArgs to args to match CLI
  entities: z.array(z.string()).optional(),
  force: z.boolean().optional(),
});

export const GenerateActionParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  operation: ActionOperationSchema,
  dataType: z.string().min(1),
  entities: z.array(z.string()).optional(),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const GenerateQueryParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  operation: QueryOperationSchema,
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

export const GenerateApiNamespaceParamsSchema = CliParamsSchema.extend({
  feature: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  force: z.boolean().optional(),
});
