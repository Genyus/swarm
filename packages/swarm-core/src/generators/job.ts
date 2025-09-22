import path from 'node:path';
import { JobFlags } from '../types';
import { IFileSystem } from '../types/filesystem';
import { IFeatureGenerator, NodeGenerator } from '../types/generator';
import { Logger } from '../types/logger';
import {
  ensureDirectoryExists,
  findWaspRoot,
  getFeatureTargetDir,
  getTemplatesDir,
} from '../utils/filesystem';
import { capitalise } from '../utils/strings';
import { TemplateUtility } from '../utils/templates';

export class JobGenerator implements NodeGenerator<JobFlags> {
  private templatesDir: string;
  private templateUtility: TemplateUtility;

  constructor(
    public logger: Logger,
    public fs: IFileSystem,
    private featureGenerator: IFeatureGenerator
  ) {
    this.templatesDir = getTemplatesDir(this.fs);
    this.templateUtility = new TemplateUtility(fs);
    this.logger = logger;
    this.fs = fs;
    this.featureGenerator = featureGenerator;
  }

  async generate(featurePath: string, flags: JobFlags): Promise<void> {
    try {
      let baseName = flags.name;
      if (!baseName.endsWith('Job')) {
        baseName = baseName + 'Job';
      }
      const jobName = baseName;
      const jobWorkerName = baseName;
      const jobWorkerFile = baseName;
      const JobType = capitalise(baseName);
      const entitiesArray = Array.isArray(flags.entities)
        ? flags.entities
        : flags.entities
          ? [flags.entities]
          : [];
      const entitiesList = entitiesArray
        .map((e: string) => `"${e}"`)
        .join(', ');
      const schedule = flags.schedule;
      const scheduleArgs = flags.scheduleArgs || '{}';
      const cron = schedule;
      const queueName = jobName;

      let imports = `import type { ${JobType} } from 'wasp/server/jobs';\n`;
      if (entitiesArray.length > 0) {
        imports += `import { ${entitiesArray.join(', ')} } from 'wasp/entities';\n`;
      }

      const { targetDirectory: jobsDir, importDirectory } = getFeatureTargetDir(
        this.fs,
        featurePath,
        'job'
      );
      const importPath = path.join(importDirectory, jobWorkerFile);
      ensureDirectoryExists(this.fs, jobsDir);
      const workerFilePath = `${jobsDir}/${jobWorkerFile}.ts`;
      const workerExists = this.fs.existsSync(workerFilePath);
      if (workerExists && !flags.force) {
        this.logger.info(`Job worker file already exists: ${workerFilePath}`);
        this.logger.info('Use --force to overwrite');
      } else {
        const workerTemplatePath = path.join(
          this.templatesDir,
          'files',
          'server',
          'job.ts'
        );
        if (!this.fs.existsSync(workerTemplatePath)) {
          this.logger.error('Job worker template not found');
          return;
        }
        const workerTemplate = this.fs.readFileSync(workerTemplatePath, 'utf8');
        const workerCode = this.templateUtility.processTemplate(
          workerTemplate,
          {
            Imports: imports,
            JobType,
            jobWorkerName,
          }
        );
        this.fs.writeFileSync(workerFilePath, workerCode);
        this.logger.success(
          `${
            workerExists ? 'Overwrote' : 'Generated'
          } job worker: ${workerFilePath}`
        );
      }
      const waspRoot = findWaspRoot(this.fs);
      const configPath = path.join(
        waspRoot,
        'config',
        `${featurePath.split('/')[0]}.wasp.ts`
      );
      if (!this.fs.existsSync(configPath)) {
        this.logger.error(`Feature config file not found: ${configPath}`);
        return;
      }
      let configContent = this.fs.readFileSync(configPath, 'utf8');
      const configExists = configContent.includes(`${jobName}: {`);
      if (configExists && !flags.force) {
        this.logger.info(`Job config already exists in ${configPath}`);
        this.logger.info('Use --force to overwrite');
        return;
      } else if (configExists && flags.force) {
        // Remove existing job definition (single job entry in jobs object)
        const jobsSectionRegex = /(jobs\s*:\s*{)([\s\S]*?)(^\s*}\s*[},])/m;
        const jobsMatch = configContent.match(jobsSectionRegex);
        if (jobsMatch) {
          let jobsBlock = jobsMatch[2];
          const jobKeyRegex = new RegExp(
            `(\\s*${jobName}\\s*:\\s*{[\\s\\S]*?^\\s*},?)`,
            'm'
          );
          jobsBlock = jobsBlock.replace(jobKeyRegex, '');
          configContent = configContent.replace(
            jobsSectionRegex,
            `$1${jobsBlock}$3`
          );
          this.fs.writeFileSync(configPath, configContent);
        }
      }
      this.featureGenerator.updateFeatureConfig(featurePath, 'job', {
        jobName,
        jobWorkerName,
        jobWorkerFile,
        entitiesList,
        schedule,
        cron,
        args: scheduleArgs,
        importPath,
        queueName,
      });
      this.logger.success(
        `${configExists ? 'Updated' : 'Added'} job config in: ${configPath}`
      );
      this.logger.info(`\nJob ${jobName} processing complete.`);
    } catch (error: any) {
      this.logger.error('Failed to generate job: ' + error.stack);
    }
  }
}
