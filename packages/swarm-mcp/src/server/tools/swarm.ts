import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
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
import { logger } from '../utils/logger.js';

async function executeSwarmCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', error => {
      reject(error);
    });
  });
}

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
    const args = [
      'api',
      '--name',
      validParams.name,
      '--method',
      validParams.method,
      '--route',
      validParams.route,
    ];

    if (validParams.entities && validParams.entities.length > 0) {
      args.push('--entities', validParams.entities.join(','));
    }

    if (validParams.auth) {
      args.push('--auth');
    }

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
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
    const args = ['feature', '--name', validParams.name];

    if (validParams.dataType) {
      args.push('--data-type', validParams.dataType);
    }

    if (validParams.components && validParams.components.length > 0) {
      args.push('--components', validParams.components.join(','));
    }

    if (validParams.withTests) {
      args.push('--with-tests');
    }

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
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
    const args = ['crud', '--data-type', validParams.dataType];

    if (validParams.public && validParams.public.length > 0) {
      args.push('--public', validParams.public.join(','));
    }

    if (validParams.override && validParams.override.length > 0) {
      args.push('--override', validParams.override.join(','));
    }

    if (validParams.exclude && validParams.exclude.length > 0) {
      args.push('--exclude', validParams.exclude.join(','));
    }

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
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

export async function swarmGenerateJob(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateJobParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const args = ['job', '--name', validParams.name];

    if (validParams.schedule) {
      args.push('--schedule', validParams.schedule);
    }

    if (validParams.scheduleArgs) {
      args.push('--schedule-args', validParams.scheduleArgs);
    }

    if (validParams.entities && validParams.entities.length > 0) {
      args.push('--entities', validParams.entities.join(','));
    }

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
      }
    );
    const output = `Successfully generated job: ${validParams.name}`;

    logger.info(output);

    const warnings = validParams.schedule
      ? []
      : ['No schedule provided, job will need manual configuration'];

    return {
      success: true,
      output,
      generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
      modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
      warnings,
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
    const args = [
      'operation',
      '--feature',
      validParams.feature,
      '--operation',
      validParams.operation,
      '--data-type',
      validParams.dataType,
    ];

    if (validParams.entities && validParams.entities.length > 0) {
      args.push('--entities', validParams.entities.join(','));
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
      }
    );
    const output = `Successfully generated ${validParams.operation} operation for: ${validParams.dataType}`;

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

export async function swarmGenerateRoute(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateRouteParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const args = [
      'route',
      '--name',
      validParams.name,
      '--path',
      validParams.path,
    ];

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
      }
    );
    const output = `Successfully generated route: ${validParams.name}`;

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

export async function swarmGenerateApiNamespace(
  params: unknown
): Promise<GenerationResult> {
  try {
    const validParams = SwarmGenerateApiNamespaceParamsSchema.parse(params);
    const projectRoot = getProjectRoot(validParams.projectPath);
    const args = [
      'api-namespace',
      '--name',
      validParams.name,
      '--path',
      validParams.path,
    ];

    if (validParams.force) {
      args.push('--force');
    }

    const { generatedFiles, modifiedFiles } = await trackGeneratedFiles(
      projectRoot,
      async () => {
        const { stdout, stderr } = await executeSwarmCommand(
          'npx',
          ['swarm', ...args],
          projectRoot
        );

        if (stderr) {
          logger.warn(`Swarm CLI warnings: ${stderr}`);
        }

        logger.info(`Swarm CLI output: ${stdout}`);
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
      'api-namespace',
      'generate',
      errorMessage,
      createErrorContext(
        'swarm_generate_api_namespace',
        'generate',
        params as Record<string, unknown>
      )
    );
  }
}
