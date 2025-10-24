import { capitalise, toCamelCase } from '@ingenyus/swarm';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { JobArgs, schema } from './schema';

export class JobGenerator extends EntityGeneratorBase<
  JobArgs,
  typeof CONFIG_TYPES.JOB
> {
  protected get entityType() {
    return CONFIG_TYPES.JOB;
  }

  description = 'Generate job workers for Wasp applications';
  schema = schema;

  async generate(args: JobArgs): Promise<void> {
    const jobName = toCamelCase(args.name);

    return this.handleGeneratorError(this.entityType, jobName, async () => {
      const configPath = this.validateFeatureConfig(args.feature);
      const { targetDirectory } = this.ensureTargetDirectory(
        args.feature,
        this.entityType.toLowerCase()
      );
      const targetFile = `${targetDirectory}/${jobName}.ts`;

      await this.generateJobFile(targetFile, jobName, args);
      this.updateConfigFile(args.feature, jobName, args, configPath);
    });
  }

  private async generateJobFile(
    targetFile: string,
    jobName: string,
    args: JobArgs
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
    args: JobArgs,
    configPath: string
  ) {
    const {
      entities = [],
      cron = '0 0 * * *',
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
