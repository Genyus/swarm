import { realLogger as logger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SwarmGeneratorFactoryService } from '../services/swarm-generator-factory.service.js';
import {
  GenerationResult,
  SwarmGenerateApiNamespaceParamsSchema,
  SwarmGenerateApiParamsSchema,
  SwarmGenerateCrudParamsSchema,
  SwarmGenerateFeatureParamsSchema,
  SwarmGenerateJobParamsSchema,
  SwarmGenerateOperationParamsSchema,
  SwarmGenerateRouteParamsSchema,
} from '../types/swarm.js';
import { ErrorFactory, createErrorContext } from '../utils/errors.js';

function getProjectRoot(projectPath?: string): string {
  if (projectPath) {
    return path.resolve(projectPath);
  }
  return process.cwd();
}

async function trackGeneratedFiles(
  projectRoot: string,
  operation: () => Promise<void>
): Promise<{ generatedFiles: string[]; modifiedFiles: string[] }> {
  const beforeFiles = new Map<string, number>();

  function scanDirectory(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            beforeFiles.set(fullPath, stats.mtime.getTime());
          } catch {
            // Ignore files we can't stat
          }
        }
      }
    } catch {
      // Ignore directories we can't read
    }
  }

  scanDirectory(projectRoot);
  await operation();

  const generatedFiles: string[] = [];
  const modifiedFiles: string[] = [];

  function scanAfter(dirPath: string): void {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          scanAfter(fullPath);
        } else if (entry.isFile()) {
          try {
            const stats = fs.statSync(fullPath);
            const currentMtime = stats.mtime.getTime();
            const previousMtime = beforeFiles.get(fullPath);

            if (previousMtime === undefined) {
              generatedFiles.push(fullPath);
            } else if (currentMtime > previousMtime) {
              modifiedFiles.push(fullPath);
            }
          } catch {
            // Ignore files we can't stat
          }
        }
      }
    } catch {
      // Ignore directories we can't read
    }
  }

  scanAfter(projectRoot);

  return { generatedFiles, modifiedFiles };
}

export async function swarmGenerateApi(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateApiParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const apiFlags = {
          name: validParams.name,
          method: validParams.method,
          route: validParams.route,
          entities: validParams.entities || [],
          auth: validParams.auth || false,
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateApi(featurePath, apiFlags);
      }
    );

    const output = `Successfully generated API: ${validParams.name}`;

    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate API: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'api',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_api',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateFeature(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateFeatureParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      () => {
        const featurePath = validParams.name;

        generatorFactory.generateFeature(featurePath);
        return Promise.resolve();
      }
    );

    const output = `Successfully generated feature: ${validParams.name}`;
    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate feature: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'feature',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_feature',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateCrud(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateCrudParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const crudFlags = {
          dataType: validParams.dataType,
          public: validParams.public || [],
          override: validParams.override || [],
          exclude: validParams.exclude || [],
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateCrud(featurePath, crudFlags);
      }
    );

    const output = `Successfully generated CRUD operations for: ${validParams.dataType}`;
    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(`Failed to generate CRUD: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'crud',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_crud',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateRoute(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateRouteParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const routeFlags = {
          path: validParams.path,
          name: validParams.name,
          auth: validParams.auth || false,
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateRoute(featurePath, routeFlags);
      }
    );
    const output = `Successfully generated route: ${validParams.path}`;

    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(`Failed to generate route: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'route',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_route',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateJob(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateJobParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const jobFlags = {
          name: validParams.name,
          entities: validParams.entities || [],
          schedule: validParams.schedule || '',
          scheduleArgs: validParams.scheduleArgs || '',
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateJob(featurePath, jobFlags);
      }
    );
    const output = `Successfully generated job: ${validParams.name}`;

    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate job: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'job',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_job',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateOperation(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateOperationParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const operationFlags = {
          feature: validParams.feature,
          dataType: validParams.dataType,
          operation: validParams.operation,
          entities: validParams.entities || [],
          auth: validParams.auth || false,
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateOperation(featurePath, operationFlags);
      }
    );
    const output = `Successfully generated operation: ${validParams.operation} for ${validParams.dataType}`;

    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate operation: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'operation',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_operation',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}

export async function swarmGenerateApiNamespace(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateApiNamespaceParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const generatorFactory = SwarmGeneratorFactoryService.getInstance();
    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const apiNamespaceFlags = {
          name: validParams.name,
          path: validParams.path,
          force: validParams.force || false,
        };
        const featurePath = 'default'; // This should be configurable or derived from project structure

        await generatorFactory.generateApiNamespace(
          featurePath,
          apiNamespaceFlags
        );
      }
    );
    const output = `Successfully generated API namespace: ${validParams.name}`;

    logger.info(output);

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings: [],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate API namespace: ${errorMessage}`);

    throw ErrorFactory.swarmGeneration(
      'apinamespace',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_apinamespace',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}
