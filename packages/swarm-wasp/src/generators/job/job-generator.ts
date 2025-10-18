import { capitalise, toCamelCase } from '@ingenyus/swarm';
import { JobFlags } from '../../generators/args.types';
import { CONFIG_TYPES } from '../../types';
import { EntityGeneratorBase } from '../base';
import { schema } from './schema';

export class JobGenerator extends EntityGeneratorBase<typeof CONFIG_TYPES.JOB> {
  protected get entityType() {
    return CONFIG_TYPES.JOB;
  }

  description = 'Generate job workers for Wasp applications';
  schema = schema;

  async generate(flags: JobFlags): Promise<void> {
    const jobName = toCamelCase(flags.name);

    return this.handleGeneratorError(this.entityType, jobName, async () => {
      const configPath = this.validateFeatureConfig(flags.feature);
      const { targetDirectory } = this.ensureTargetDirectory(
        flags.feature,
        this.entityType.toLowerCase()
      );
      const targetFile = `${targetDirectory}/${jobName}.ts`;

      await this.generateJobFile(targetFile, jobName, flags);
      this.updateConfigFile(flags.feature, jobName, flags, configPath);
    });
  }

  private async generateJobFile(
    targetFile: string,
    jobName: string,
    flags: JobFlags
  ) {
    const jobType = capitalise(jobName);
    const entities = Array.isArray(flags.entities)
      ? flags.entities
      : flags.entities
        ? [flags.entities]
        : [];
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
      flags.force || false
    );
  }

  private updateConfigFile(
    featurePath: string,
    jobName: string,
    flags: JobFlags,
    configPath: string
  ) {
    const entities = Array.isArray(flags.entities)
      ? flags.entities
      : flags.entities
        ? [flags.entities]
        : [];
    const cron = flags.cron || '0 0 * * *';
    const args = flags.args || '{}';
    const definition = this.getDefinition(
      jobName,
      entities,
      cron,
      args || '{}'
    );

    this.updateConfigWithCheck(
      configPath,
      'job',
      jobName,
      definition,
      featurePath,
      flags.force || false
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
