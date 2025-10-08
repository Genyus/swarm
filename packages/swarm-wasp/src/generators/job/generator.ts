import { capitalise, JobFlags, toCamelCase } from '@ingenyus/swarm-core';
import { BaseEntityGenerator } from '../../base-classes/base-entity-generator';
import { CONFIG_TYPES } from '../../types/constants';
import { schema } from './schema';

export class JobGenerator extends BaseEntityGenerator<typeof CONFIG_TYPES.JOB> {
  protected get entityType() {
    return CONFIG_TYPES.JOB;
  }

  description = 'Generate job workers for Wasp applications';
  schema = schema;

  async generate(params: {
    featurePath: string;
    flags: JobFlags;
  }): Promise<void> {
    const { featurePath, flags } = params;
    const jobName = toCamelCase(flags.name);

    return this.handleGeneratorError(this.entityType, jobName, async () => {
      const { targetDirectory } = this.ensureTargetDirectory(
        featurePath,
        this.entityType.toLowerCase()
      );
      const targetFile = `${targetDirectory}/${jobName}.ts`;

      this.generateJobFile(targetFile, jobName, flags);
      this.updateConfigFile(featurePath, jobName, flags);
    });
  }

  private generateJobFile(
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

    this.renderTemplateToFile(
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
    flags: JobFlags
  ) {
    const configPath = this.validateFeatureConfig(featurePath);
    const configExists = this.checkConfigExists(
      configPath,
      'job',
      jobName,
      flags.force || false
    );
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

    this.updateFeatureConfig(
      featurePath,
      definition,
      configPath,
      configExists,
      'job'
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
    const templatePath = this.getTemplatePath('config/job.eta');

    return this.templateUtility.processTemplate(templatePath, {
      jobName,
      entities: entities.map((e) => `"${e}"`).join(', '),
      cron,
      args,
    });
  }
}
