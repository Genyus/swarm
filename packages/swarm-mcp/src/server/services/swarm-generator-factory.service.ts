import type {
  ApiFlags,
  ApiNamespaceFlags,
  CrudFlags,
  JobFlags,
  OperationFlags,
  RouteFlags,
} from '@ingenyus/swarm-cli/dist/types/index.js';
import { SwarmGeneratorsService } from './swarm-generators.service.js';

export class SwarmGeneratorFactoryService {
  private static instance: SwarmGeneratorFactoryService;
  private generatorsService: SwarmGeneratorsService;

  private constructor() {
    this.generatorsService = SwarmGeneratorsService.getInstance();
  }

  static getInstance(): SwarmGeneratorFactoryService {
    if (!SwarmGeneratorFactoryService.instance) {
      SwarmGeneratorFactoryService.instance =
        new SwarmGeneratorFactoryService();
    }
    return SwarmGeneratorFactoryService.instance;
  }

  async generateApi(featurePath: string, flags: ApiFlags): Promise<void> {
    try {
      await this.generatorsService.generateApi(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate API: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  generateFeature(featurePath: string): void {
    try {
      this.generatorsService.generateFeature(featurePath);
    } catch (error) {
      throw new Error(
        `Failed to generate feature: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateCrud(featurePath: string, flags: CrudFlags): Promise<void> {
    try {
      await this.generatorsService.generateCrud(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate CRUD: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateRoute(featurePath: string, flags: RouteFlags): Promise<void> {
    try {
      await this.generatorsService.generateRoute(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate route: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateJob(featurePath: string, flags: JobFlags): Promise<void> {
    try {
      await this.generatorsService.generateJob(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate job: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateOperation(
    featurePath: string,
    flags: OperationFlags
  ): Promise<void> {
    try {
      await this.generatorsService.generateOperation(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate operation: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async generateApiNamespace(
    featurePath: string,
    flags: ApiNamespaceFlags
  ): Promise<void> {
    try {
      await this.generatorsService.generateApiNamespace(featurePath, flags);
    } catch (error) {
      throw new Error(
        `Failed to generate API namespace: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  getGeneratorsService(): SwarmGeneratorsService {
    return this.generatorsService;
  }
}
