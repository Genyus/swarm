import type { IFileSystem } from '@ingenyus/swarm-core/dist/types/filesystem.js';
import type { Logger } from '@ingenyus/swarm-core/dist/types/logger.js';
import * as path from 'path';
import { SwarmGeneratorsService } from '../services/swarm-generators.service.js';
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

export class SwarmTools {
  private generatorsService: SwarmGeneratorsService;

  constructor(
    private logger: Logger,
    private fileSystem: IFileSystem
  ) {
    this.generatorsService = SwarmGeneratorsService.create(
      this.logger,
      this.fileSystem
    );
  }

  static create(logger: Logger, fileSystem: IFileSystem): SwarmTools {
    return new SwarmTools(logger, fileSystem);
  }

  private getProjectRoot(projectPath?: string): string {
    if (projectPath) {
      return path.resolve(projectPath);
    }
    return process.cwd();
  }

  private async trackGeneratedFiles(
    projectRoot: string,
    operation: () => Promise<void>
  ): Promise<{ generatedFiles: string[]; modifiedFiles: string[] }> {
    const beforeFiles = new Map<string, number>();

    const scanDirectory = (dirPath: string): void => {
      try {
        const entries = this.fileSystem.readdirSync(dirPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            scanDirectory(fullPath);
          } else if (entry.isFile()) {
            try {
              const stats = this.fileSystem.statSync(fullPath);
              beforeFiles.set(fullPath, stats.mtime.getTime());
            } catch {
              // Ignore files we can't stat
            }
          }
        }
      } catch {
        // Ignore directories we can't read
      }
    };

    scanDirectory(projectRoot);
    await operation();

    const generatedFiles: string[] = [];
    const modifiedFiles: string[] = [];

    const scanAfter = (dirPath: string): void => {
      try {
        const entries = this.fileSystem.readdirSync(dirPath, {
          withFileTypes: true,
        });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            scanAfter(fullPath);
          } else if (entry.isFile()) {
            try {
              const stats = this.fileSystem.statSync(fullPath);
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
    };

    scanAfter(projectRoot);

    return { generatedFiles, modifiedFiles };
  }

  async generateApi(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateApiParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
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

          await this.generatorsService.generateApi(
            validParams.feature,
            apiFlags
          );
        }
      );

      const output = `Successfully generated API: ${validParams.name}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate API: ${errorMessage}`);

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

  async generateFeature(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateFeatureParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        () => {
          const featurePath = validParams.name;
          this.generatorsService.generateFeature(featurePath);
          return Promise.resolve();
        }
      );

      const output = `Successfully generated feature: ${validParams.name}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate feature: ${errorMessage}`);

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

  async generateCrud(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateCrudParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        async () => {
          const crudFlags = {
            dataType: validParams.dataType,
            public: validParams.public || [],
            override: validParams.override || [],
            exclude: validParams.exclude || [],
            force: validParams.force || false,
          };

          await this.generatorsService.generateCrud(
            validParams.feature,
            crudFlags
          );
        }
      );

      const output = `Successfully generated CRUD operations for: ${validParams.dataType}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate CRUD: ${errorMessage}`);

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

  async generateRoute(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateRouteParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        async () => {
          const routeFlags = {
            path: validParams.path,
            name: validParams.name,
            auth: validParams.auth || false,
            force: validParams.force || false,
          };

          await this.generatorsService.generateRoute(
            validParams.feature,
            routeFlags
          );
        }
      );

      const output = `Successfully generated route: ${validParams.path}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate route: ${errorMessage}`);

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

  async generateJob(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateJobParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        async () => {
          const jobFlags = {
            name: validParams.name,
            schedule: validParams.schedule || '',
            scheduleArgs: validParams.scheduleArgs || '',
            entities: validParams.entities || [],
            force: validParams.force || false,
          };

          await this.generatorsService.generateJob(
            validParams.feature,
            jobFlags
          );
        }
      );

      const output = `Successfully generated job: ${validParams.name}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate job: ${errorMessage}`);

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

  async generateOperation(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateOperationParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        async () => {
          const operationFlags = {
            dataType: validParams.dataType,
            operation: validParams.operation,
            entities: validParams.entities || [],
            auth: validParams.auth || false,
            force: validParams.force || false,
          };

          await this.generatorsService.generateOperation(
            validParams.feature,
            operationFlags
          );
        }
      );

      const output = `Successfully generated operation: ${validParams.operation} for ${validParams.dataType}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate operation: ${errorMessage}`);

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

  async generateApiNamespace(params: unknown): Promise<GenerationResult> {
    try {
      const validParams = SwarmGenerateApiNamespaceParamsSchema.parse(params);
      const projectRoot = this.getProjectRoot(validParams.projectPath);

      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        async () => {
          const apiNamespaceFlags = {
            name: validParams.name,
            path: validParams.path,
            force: validParams.force || false,
          };

          await this.generatorsService.generateApiNamespace(
            validParams.feature,
            apiNamespaceFlags
          );
        }
      );

      const output = `Successfully generated API namespace: ${validParams.name}`;
      this.logger.info(output);

      return {
        success: true,
        output,
        generatedFiles: generatedFiles.map(f => path.relative(projectRoot, f)),
        modifiedFiles: modifiedFiles.map(f => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to generate API namespace: ${errorMessage}`);

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
}
