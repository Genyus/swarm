import { JobFlags } from '../types';
import { capitalise, toCamelCase } from '../utils/strings';
import { BaseGenerator } from './base';

export class JobGenerator extends BaseGenerator<JobFlags> {
  protected entityType = 'Job';

  async generate(featurePath: string, flags: JobFlags): Promise<void> {
    const entityType = 'Job';
    const jobName = toCamelCase(flags.name);

    return this.handleGeneratorError(entityType, jobName, async () => {
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
      'files/server/jobs/job.eta',
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
    const cron = flags.schedule || '0 0 * * *';
    const scheduleArgs = flags.scheduleArgs || '{}';
    const definition = this.getDefinition(
      jobName,
      entities,
      cron,
      scheduleArgs || '{}'
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
    const templatePath = 'config/job.eta';

    return this.templateUtility.processTemplate(templatePath, {
      jobName,
      entities: entities.map((e) => `"${e}"`).join(', '),
      cron,
      args,
    });
  }
}
