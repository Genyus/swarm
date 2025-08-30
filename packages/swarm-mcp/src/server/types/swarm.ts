import { z } from 'zod';

export interface SwarmCliParams {
  projectPath?: string;
  options?: Record<string, unknown>;
}

export interface SwarmCliResult {
  success: boolean;
  output: string;
  error?: string;
  generatedFiles?: string[];
  modifiedFiles?: string[];
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
export type OperationType = 'query' | 'action';
export type ActionOperation = 'create' | 'update' | 'delete';
export type QueryOperation = 'get' | 'getAll';

export interface SwarmGenerateApiParams extends SwarmCliParams {
  name: string;
  method: HttpMethod;
  route: string;
  entities?: string[];
  auth?: boolean;
  force?: boolean;
}

export interface SwarmGenerateFeatureParams extends SwarmCliParams {
  name: string;
  dataType?: string;
  components?: string[];
  withTests?: boolean;
  force?: boolean;
}

export interface SwarmGenerateCrudParams extends SwarmCliParams {
  dataType: string;
  public?: string[];
  override?: string[];
  exclude?: string[];
  force?: boolean;
}

export interface SwarmGenerateJobParams extends SwarmCliParams {
  name: string;
  schedule?: string;
  scheduleArgs?: string;
  entities?: string[];
  force?: boolean;
}

export interface SwarmGenerateOperationParams extends SwarmCliParams {
  feature: string;
  operation: ActionOperation | QueryOperation;
  dataType: string;
  entities?: string[];
  auth?: boolean;
  force?: boolean;
}

export interface SwarmGenerateRouteParams extends SwarmCliParams {
  name: string;
  path: string;
  auth?: boolean;
  force?: boolean;
}

export interface SwarmGenerateApiNamespaceParams extends SwarmCliParams {
  name: string;
  path: string;
  force?: boolean;
}

export interface FeatureDefinition {
  name: string;
  path: string;
  type: 'full-stack' | 'client-only' | 'server-only';
  components: string[];
  operations: {
    queries: string[];
    actions: string[];
  };
  routes: string[];
  dependencies: string[];
}

export interface EntityDefinition {
  name: string;
  fields: FieldDefinition[];
  relationships: RelationshipDefinition[];
}

export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'optional';
  defaultValue?: unknown;
  constraints?: {
    unique?: boolean;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

export interface RelationshipDefinition {
  name: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  target: string;
  fields?: string[];
  references?: string[];
}

export interface GenerationResult extends SwarmCliResult {
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

export interface TemplateProcessingResult {
  content: string;
  variables: Record<string, unknown>;
  dependencies: string[];
}

export type SwarmErrorType =
  | 'validation'
  | 'filesystem'
  | 'generation'
  | 'configuration'
  | 'dependency'
  | 'template'
  | 'system';

export interface SwarmError {
  type: SwarmErrorType;
  code: string;
  message: string;
  details?: unknown;
  file?: string;
  line?: number;
  suggestion?: string;
}

export interface SwarmWarning {
  type: 'deprecation' | 'performance' | 'best-practice' | 'compatibility';
  message: string;
  file?: string;
  suggestion?: string;
}

export interface SwarmToolConfig {
  generators: {
    api: boolean;
    feature: boolean;
    crud: boolean;
    job: boolean;
    operation: boolean;
    route: boolean;
    apiNamespace: boolean;
  };
  analysis: {
    enableDeepScan: boolean;
    includeDependencies: boolean;
    checkCompatibility: boolean;
  };
  validation: {
    strict: boolean;
    allowExperimental: boolean;
    enforceNaming: boolean;
  };
  output: {
    verbose: boolean;
    format: 'json' | 'yaml' | 'text';
    includeStackTrace: boolean;
  };
}

export const HttpMethodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE', 'ALL']);
export const OperationTypeSchema = z.enum(['query', 'action']);
export const ActionOperationSchema = z.enum(['create', 'update', 'delete']);
export const QueryOperationSchema = z.enum(['get', 'getAll']);

export const SwarmCliParamsSchema = z.object({
  projectPath: z.string().optional(),
  options: z.record(z.unknown()).optional(),
});

export const SwarmGenerateApiParamsSchema = SwarmCliParamsSchema.extend({
  name: z.string().min(1),
  method: HttpMethodSchema,
  route: z.string().min(1),
  entities: z.array(z.string()).optional(),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateFeatureParamsSchema = SwarmCliParamsSchema.extend({
  name: z.string().min(1),
  dataType: z.string().optional(),
  components: z.array(z.string()).optional(),
  withTests: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateCrudParamsSchema = SwarmCliParamsSchema.extend({
  dataType: z.string().min(1),
  public: z.array(z.string()).optional(),
  override: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateJobParamsSchema = SwarmCliParamsSchema.extend({
  name: z.string().min(1),
  schedule: z.string().optional(),
  scheduleArgs: z.string().optional(),
  entities: z.array(z.string()).optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateOperationParamsSchema = SwarmCliParamsSchema.extend({
  feature: z.string().min(1),
  operation: z.union([ActionOperationSchema, QueryOperationSchema]),
  dataType: z.string().min(1),
  entities: z.array(z.string()).optional(),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateRouteParamsSchema = SwarmCliParamsSchema.extend({
  name: z.string().min(1),
  path: z.string().min(1),
  auth: z.boolean().optional(),
  force: z.boolean().optional(),
});

export const SwarmGenerateApiNamespaceParamsSchema =
  SwarmCliParamsSchema.extend({
    name: z.string().min(1),
    path: z.string().min(1),
    force: z.boolean().optional(),
  });

export function isHttpMethod(value: string): value is HttpMethod {
  return ['GET', 'POST', 'PUT', 'DELETE', 'ALL'].includes(value);
}

export function isOperationType(value: string): value is OperationType {
  return ['query', 'action'].includes(value);
}

export function isActionOperation(value: string): value is ActionOperation {
  return ['create', 'update', 'delete'].includes(value);
}

export function isQueryOperation(value: string): value is QueryOperation {
  return ['get', 'getAll'].includes(value);
}

export function isSwarmError(error: unknown): error is SwarmError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'code' in error &&
    'message' in error
  );
}

export type SwarmGeneratorType =
  | 'api'
  | 'feature'
  | 'crud'
  | 'job'
  | 'operation'
  | 'route'
  | 'apiNamespace';

export interface SwarmGeneratorInfo {
  type: SwarmGeneratorType;
  name: string;
  description: string;
  supportedOptions: string[];
  requiredParameters: string[];
  examples: {
    description: string;
    command: string;
    result: string;
  }[];
}

export type SwarmMcpToolName =
  | 'swarm_generate_api'
  | 'swarm_generate_feature'
  | 'swarm_generate_crud'
  | 'swarm_generate_job'
  | 'swarm_generate_operation'
  | 'swarm_generate_route'
  | 'swarm_generate_apinamespace';
