import { ApiGenerator } from '@ingenyus/swarm-cli/dist/generators/api.js';
import { ApiNamespaceGenerator } from '@ingenyus/swarm-cli/dist/generators/apinamespace.js';
import { CrudGenerator } from '@ingenyus/swarm-cli/dist/generators/crud.js';
import { FeatureGenerator } from '@ingenyus/swarm-cli/dist/generators/feature.js';
import { JobGenerator } from '@ingenyus/swarm-cli/dist/generators/job.js';
import { OperationGenerator } from '@ingenyus/swarm-cli/dist/generators/operation.js';
import { RouteGenerator } from '@ingenyus/swarm-cli/dist/generators/route.js';

import type {
  ApiFlags,
  ApiNamespaceFlags,
  CrudFlags,
  JobFlags,
  OperationFlags,
  RouteFlags,
} from '@ingenyus/swarm-cli/dist/types/index.js';

import { realFileSystem } from '@ingenyus/swarm-cli/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-cli/dist/utils/logger.js';

export class SwarmGeneratorsService {
  private static instance: SwarmGeneratorsService;
  private featureGenerator: FeatureGenerator;

  private constructor() {
    this.featureGenerator = new FeatureGenerator(realLogger, realFileSystem);
  }

  static getInstance(): SwarmGeneratorsService {
    if (!SwarmGeneratorsService.instance) {
      SwarmGeneratorsService.instance = new SwarmGeneratorsService();
    }
    return SwarmGeneratorsService.instance;
  }

  async generateApi(featurePath: string, flags: ApiFlags): Promise<void> {
    const apiGenerator = new ApiGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await apiGenerator.generate(featurePath, flags);
  }

  generateFeature(featurePath: string): void {
    this.featureGenerator.generateFeature(featurePath);
  }

  async generateCrud(featurePath: string, flags: CrudFlags): Promise<void> {
    const crudGenerator = new CrudGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await crudGenerator.generate(featurePath, flags);
  }

  async generateRoute(featurePath: string, flags: RouteFlags): Promise<void> {
    const routeGenerator = new RouteGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await routeGenerator.generate(featurePath, flags);
  }

  async generateJob(featurePath: string, flags: JobFlags): Promise<void> {
    const jobGenerator = new JobGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await jobGenerator.generate(featurePath, flags);
  }

  async generateOperation(
    featurePath: string,
    flags: OperationFlags
  ): Promise<void> {
    const operationGenerator = new OperationGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await operationGenerator.generate(featurePath, flags);
  }

  async generateApiNamespace(
    featurePath: string,
    flags: ApiNamespaceFlags
  ): Promise<void> {
    const apiNamespaceGenerator = new ApiNamespaceGenerator(
      realLogger,
      realFileSystem,
      this.featureGenerator
    );
    await apiNamespaceGenerator.generate(featurePath, flags);
  }

  getFeatureGenerator(): FeatureGenerator {
    return this.featureGenerator;
  }
}
