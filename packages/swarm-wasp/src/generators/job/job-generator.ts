import {
  capitalise,
  GeneratorServices,
  Out,
  toCamelCase,
} from '@ingenyus/swarm';
import { CONFIG_TYPES } from '../../common';
import { ComponentGeneratorBase } from '../base';
import { schema } from './schema';

export class JobGenerator extends ComponentGeneratorBase<
  typeof schema,
  typeof CONFIG_TYPES.JOB
> {
  protected get componentType() {
    return CONFIG_TYPES.JOB;
  }

  description = 'Generates a Wasp Job';
  schema = schema;

  constructor(services: GeneratorServices) {
    super(services);
  }

  async generate(args: Out<typeof schema>): Promise<void> {
    const jobName = toCamelCase(args.name);

    return this.handleGeneratorError(this.componentType, jobName, async () => {
      const configPath = this.validateFeatureConfig(args.feature);
      const { targetDirectory } = this.ensureTargetDirectory(
        args.feature,
        this.componentType.toLowerCase()
      );
      const targetFile = `${targetDirectory}/${jobName}.ts`;

      await this.generateJobFile(targetFile, jobName, args);
      this.updateConfigFile(args.feature, jobName, args, configPath);
    });
  }

  private async generateJobFile(
    targetFile: string,
    jobName: string,
    args: Out<typeof schema>
  ) {
    const jobType = capitalise(jobName);
    const entities = args.entities ?? [];
    let imports = `import type { ${jobType} } from 'wasp/server/jobs';\n`;

    if (entities.length > 0) {
      imports += `import { ${entities.join(', ')} } from 'wasp/entities';\n`;
    }

    const replacements = {
      imports,
      jobType,
      jobName,
    };

    await this.renderTemplateToFile(
      'job.eta',
      replacements,
      targetFile,
      'job worker',
      args.force || false
    );
  }

  private updateConfigFile(
    featurePath: string,
    jobName: string,
    args: Out<typeof schema>,
    configPath: string
  ) {
    const {
      entities = [],
      cron = '',
      args: executionArgs = '{}',
      force = false,
    } = args;
    const definition = this.getDefinition(
      jobName,
      entities,
      cron,
      executionArgs
    );

    this.updateConfigWithCheck(
      configPath,
      'job',
      jobName,
      definition,
      featurePath,
      force
    );
  }

  /**
   * Generates a job definition for the feature configuration.
   */
  getDefinition(
    jobName: string,
    entities: string[],
    cron: string,
    args: string
  ): string {
    const templatePath = this.getDefaultTemplatePath('config/job.eta');

    return this.templateUtility.processTemplate(templatePath, {
      jobName,
      entities: entities.map((e) => `"${e}"`).join(', '),
      cron,
      args,
    });
  }
}
