import { ApiGenerator } from '../../../generators/api';
import { ApiNamespaceGenerator } from '../../../generators/apinamespace';
import { CrudGenerator } from '../../../generators/crud';
import { FeatureGenerator } from '../../../generators/feature';
import { JobGenerator } from '../../../generators/job';
import { OperationGenerator } from '../../../generators/operation';
import { RouteGenerator } from '../../../generators/route';

import type {
  ApiFlags,
  ApiNamespaceFlags,
  CrudFlags,
  JobFlags,
  OperationFlags,
  RouteFlags,
} from '../../../types/index';

export class GeneratorService {
  private featureGenerator?: FeatureGenerator;
  private apiGenerator?: ApiGenerator;
  private apiNamespaceGenerator?: ApiNamespaceGenerator;
  private crudGenerator?: CrudGenerator;
  private routeGenerator?: RouteGenerator;
  private jobGenerator?: JobGenerator;
  private operationGenerator?: OperationGenerator;

  static create(): GeneratorService {
    return new GeneratorService();
  }

  private getApiGenerator(): ApiGenerator {
    if (!this.apiGenerator) {
      this.apiGenerator = new ApiGenerator();
    }

    return this.apiGenerator;
  }

  private getCrudGenerator(): CrudGenerator {
    if (!this.crudGenerator) {
      this.crudGenerator = new CrudGenerator();
    }

    return this.crudGenerator;
  }

  private getFeatureGenerator(): FeatureGenerator {
    if (!this.featureGenerator) {
      this.featureGenerator = new FeatureGenerator();
    }

    return this.featureGenerator;
  }

  private getRouteGenerator(): RouteGenerator {
    if (!this.routeGenerator) {
      this.routeGenerator = new RouteGenerator();
    }

    return this.routeGenerator;
  }

  private getJobGenerator(): JobGenerator {
    if (!this.jobGenerator) {
      this.jobGenerator = new JobGenerator();
    }

    return this.jobGenerator;
  }

  private getOperationGenerator(): OperationGenerator {
    if (!this.operationGenerator) {
      this.operationGenerator = new OperationGenerator();
    }

    return this.operationGenerator;
  }

  private getApiNamespaceGenerator(): ApiNamespaceGenerator {
    if (!this.apiNamespaceGenerator) {
      this.apiNamespaceGenerator = new ApiNamespaceGenerator();
    }

    return this.apiNamespaceGenerator;
  }

  generateFeature(featurePath: string): void {
    this.getFeatureGenerator().generateFeature(featurePath);
  }

  async generateApi(featurePath: string, flags: ApiFlags): Promise<void> {
    await this.getApiGenerator().generate(featurePath, flags);
  }

  async generateCrud(featurePath: string, flags: CrudFlags): Promise<void> {
    await this.getCrudGenerator().generate(featurePath, flags);
  }

  async generateRoute(featurePath: string, flags: RouteFlags): Promise<void> {
    await this.getRouteGenerator().generate(featurePath, flags);
  }

  async generateJob(featurePath: string, flags: JobFlags): Promise<void> {
    await this.getJobGenerator().generate(featurePath, flags);
  }

  async generateOperation(
    featurePath: string,
    flags: OperationFlags
  ): Promise<void> {
    await this.getOperationGenerator().generate(featurePath, flags);
  }

  async generateApiNamespace(
    featurePath: string,
    flags: ApiNamespaceFlags
  ): Promise<void> {
    await this.getApiNamespaceGenerator().generate(featurePath, flags);
  }
}
