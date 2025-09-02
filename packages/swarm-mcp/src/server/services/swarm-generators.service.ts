import { ApiGenerator } from '@ingenyus/swarm-cli/dist/generators/api.js';
import { ApiNamespaceGenerator } from '@ingenyus/swarm-cli/dist/generators/apinamespace.js';
import { CrudGenerator } from '@ingenyus/swarm-cli/dist/generators/crud.js';
import { FeatureGenerator } from '@ingenyus/swarm-cli/dist/generators/feature.js';
import { JobGenerator } from '@ingenyus/swarm-cli/dist/generators/job.js';
import { OperationGenerator } from '@ingenyus/swarm-cli/dist/generators/operation.js';
import { RouteGenerator } from '@ingenyus/swarm-cli/dist/generators/route.js';
import type { IFileSystem } from '@ingenyus/swarm-cli/dist/types/filesystem.js';
import type { Logger } from '@ingenyus/swarm-cli/dist/types/logger.js';

import type {
  ApiFlags,
  ApiNamespaceFlags,
  CrudFlags,
  JobFlags,
  OperationFlags,
  RouteFlags,
} from '@ingenyus/swarm-cli/dist/types/index.js';

export class SwarmGeneratorsService {
  private featureGenerator: FeatureGenerator;
  private apiGenerator?: ApiGenerator;
  private apiNamespaceGenerator?: ApiNamespaceGenerator;
  private crudGenerator?: CrudGenerator;
  private routeGenerator?: RouteGenerator;
  private jobGenerator?: JobGenerator;
  private operationGenerator?: OperationGenerator;

  constructor(
    private logger: Logger,
    private fileSystem: IFileSystem
  ) {
    this.featureGenerator = new FeatureGenerator(this.logger, this.fileSystem);
  }

  static create(
    logger: Logger,
    fileSystem: IFileSystem
  ): SwarmGeneratorsService {
    return new SwarmGeneratorsService(logger, fileSystem);
  }

  private getApiGenerator(): ApiGenerator {
    if (!this.apiGenerator) {
      this.apiGenerator = new ApiGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.apiGenerator;
  }

  private getCrudGenerator(): CrudGenerator {
    if (!this.crudGenerator) {
      this.crudGenerator = new CrudGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.crudGenerator;
  }

  private getRouteGenerator(): RouteGenerator {
    if (!this.routeGenerator) {
      this.routeGenerator = new RouteGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.routeGenerator;
  }

  private getJobGenerator(): JobGenerator {
    if (!this.jobGenerator) {
      this.jobGenerator = new JobGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.jobGenerator;
  }

  private getOperationGenerator(): OperationGenerator {
    if (!this.operationGenerator) {
      this.operationGenerator = new OperationGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.operationGenerator;
  }

  private getApiNamespaceGenerator(): ApiNamespaceGenerator {
    if (!this.apiNamespaceGenerator) {
      this.apiNamespaceGenerator = new ApiNamespaceGenerator(
        this.logger,
        this.fileSystem,
        this.featureGenerator
      );
    }

    return this.apiNamespaceGenerator;
  }

  generateFeature(featurePath: string): void {
    this.featureGenerator.generateFeature(featurePath);
  }

  async generateApi(featurePath: string, flags: ApiFlags): Promise<void> {
    const apiGenerator = this.getApiGenerator();

    await apiGenerator.generate(featurePath, flags);
  }

  async generateCrud(featurePath: string, flags: CrudFlags): Promise<void> {
    const crudGenerator = this.getCrudGenerator();

    await crudGenerator.generate(featurePath, flags);
  }

  async generateRoute(featurePath: string, flags: RouteFlags): Promise<void> {
    const routeGenerator = this.getRouteGenerator();

    await routeGenerator.generate(featurePath, flags);
  }

  async generateJob(featurePath: string, flags: JobFlags): Promise<void> {
    const jobGenerator = this.getJobGenerator();

    await jobGenerator.generate(featurePath, flags);
  }

  async generateOperation(
    featurePath: string,
    flags: OperationFlags
  ): Promise<void> {
    const operationGenerator = this.getOperationGenerator();

    await operationGenerator.generate(featurePath, flags);
  }

  async generateApiNamespace(
    featurePath: string,
    flags: ApiNamespaceFlags
  ): Promise<void> {
    const apiNamespaceGenerator = this.getApiNamespaceGenerator();

    await apiNamespaceGenerator.generate(featurePath, flags);
  }
}
