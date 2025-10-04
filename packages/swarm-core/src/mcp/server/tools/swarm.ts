import * as path from 'path';
import type { IFileSystem } from '../../../types/filesystem';
import type { Logger } from '../../../types/logger';
import { GeneratorService } from '../types/generator-service.js';
import {
  GenerateActionParams,
  GenerateActionParamsSchema,
  GenerateApiNamespaceParams,
  GenerateApiNamespaceParamsSchema,
  GenerateApiParams,
  GenerateApiParamsSchema,
  GenerateCrudParams,
  GenerateCrudParamsSchema,
  GenerateFeatureParams,
  GenerateFeatureParamsSchema,
  GenerateJobParams,
  GenerateJobParamsSchema,
  GenerateQueryParams,
  GenerateQueryParamsSchema,
  GenerateRouteParams,
  GenerateRouteParamsSchema,
  GenerationResult,
} from '../types/swarm.js';

export class SwarmTools {
  private generatorService: GeneratorService;

  constructor(
    private logger: Logger,
    private fileSystem: IFileSystem
  ) {
    this.generatorService = GeneratorService.create();
  }

  static create(logger: Logger, fileSystem: IFileSystem): SwarmTools {
    return new SwarmTools(logger, fileSystem);
  }

  async generateApi(params: GenerateApiParams): Promise<GenerationResult> {
    const validParams = GenerateApiParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const apiFlags = {
          name: validParams.name,
          method: validParams.method,
          route: validParams.route,
          entities: validParams.entities || [],
          auth: validParams.auth || false,
          force: validParams.force || false,
          customMiddleware: validParams.customMiddleware || false,
        };

        await this.generatorService.generateApi(validParams.feature, apiFlags);
      },
      `Successfully generated API: ${validParams.name}`,
      'Failed to generate API',
      projectRoot
    );
  }

  async generateFeature(
    params: GenerateFeatureParams
  ): Promise<GenerationResult> {
    const validParams = GenerateFeatureParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      () => {
        const featurePath = validParams.name;
        this.generatorService.generateFeature(featurePath);
        return Promise.resolve();
      },
      `Successfully generated feature: ${validParams.name}`,
      'Failed to generate feature',
      projectRoot
    );
  }

  async generateCrud(params: GenerateCrudParams): Promise<GenerationResult> {
    const validParams = GenerateCrudParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const crudFlags = {
          dataType: validParams.name, // Use name instead of dataType
          public: validParams.public || [],
          override: validParams.override || [],
          exclude: validParams.exclude || [],
          force: validParams.force || false,
        };

        await this.generatorService.generateCrud(
          validParams.feature,
          crudFlags
        );
      },
      `Successfully generated CRUD operations for: ${validParams.name}`,
      'Failed to generate CRUD',
      projectRoot
    );
  }

  async generateRoute(params: GenerateRouteParams): Promise<GenerationResult> {
    const validParams = GenerateRouteParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const routeFlags = {
          path: validParams.path,
          name: validParams.name,
          auth: validParams.auth || false,
          force: validParams.force || false,
        };

        await this.generatorService.generateRoute(
          validParams.feature,
          routeFlags
        );
      },
      `Successfully generated route: ${validParams.path}`,
      'Failed to generate route',
      projectRoot
    );
  }

  async generateJob(params: GenerateJobParams): Promise<GenerationResult> {
    const validParams = GenerateJobParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const jobFlags = {
          name: validParams.name,
          schedule: validParams.cron || '', // Use cron instead of schedule
          scheduleArgs: validParams.args || '', // Use args instead of scheduleArgs
          entities: validParams.entities || [],
          force: validParams.force || false,
        };

        await this.generatorService.generateJob(validParams.feature, jobFlags);
      },
      `Successfully generated job: ${validParams.name}`,
      'Failed to generate job',
      projectRoot
    );
  }

  async generateAction(
    params: GenerateActionParams
  ): Promise<GenerationResult> {
    const validParams = GenerateActionParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const operationFlags = {
          dataType: validParams.dataType,
          operation: validParams.operation,
          entities: validParams.entities || [],
          auth: validParams.auth || false,
          force: validParams.force || false,
        };

        await this.generatorService.generateOperation(
          validParams.feature,
          operationFlags
        );
      },
      `Successfully generated action: ${validParams.operation} for ${validParams.dataType}`,
      'Failed to generate action',
      projectRoot
    );
  }

  async generateQuery(params: GenerateQueryParams): Promise<GenerationResult> {
    const validParams = GenerateQueryParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const operationFlags = {
          dataType: validParams.dataType,
          operation: validParams.operation,
          entities: validParams.entities || [],
          auth: validParams.auth || false,
          force: validParams.force || false,
        };

        await this.generatorService.generateOperation(
          validParams.feature,
          operationFlags
        );
      },
      `Successfully generated query: ${validParams.operation} for ${validParams.dataType}`,
      'Failed to generate query',
      projectRoot
    );
  }

  async generateApiNamespace(
    params: GenerateApiNamespaceParams
  ): Promise<GenerationResult> {
    const validParams = GenerateApiNamespaceParamsSchema.parse(params);
    const projectRoot = this.getProjectRoot(validParams.projectPath);

    return this.executeGenerator(
      async () => {
        const apiNamespaceFlags = {
          name: validParams.name,
          path: validParams.path,
          force: validParams.force || false,
        };

        await this.generatorService.generateApiNamespace(
          validParams.feature,
          apiNamespaceFlags
        );
      },
      `Successfully generated API namespace: ${validParams.name}`,
      'Failed to generate API namespace',
      projectRoot
    );
  }

  private getProjectRoot(projectPath?: string): string {
    if (projectPath) {
      return path.resolve(projectPath);
    }
    return process.cwd();
  }

  private async executeGenerator(
    operation: () => Promise<void>,
    successMessage: string,
    failureMessage: string,
    projectRoot: string
  ): Promise<GenerationResult> {
    try {
      const { generatedFiles, modifiedFiles } = await this.trackGeneratedFiles(
        projectRoot,
        operation
      );

      this.logger.info(successMessage);

      return {
        success: true,
        output: successMessage,
        generatedFiles: generatedFiles.map((f) =>
          path.relative(projectRoot, f)
        ),
        modifiedFiles: modifiedFiles.map((f) => path.relative(projectRoot, f)),
        warnings: [],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`${failureMessage}: ${errorMessage}`);

      return {
        success: false,
        output: failureMessage,
        error: errorMessage,
        generatedFiles: [],
        modifiedFiles: [],
        warnings: [],
      };
    }
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
}
