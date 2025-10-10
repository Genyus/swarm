import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import type { IFeatureDirectoryGenerator } from '../../interfaces/feature-directory-generator';
import { JobGenerator } from './generator';

describe('JobGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureDirectoryGenerator;
  let gen: JobGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new JobGenerator(logger, fs, featureGen);
  });

  it('generate writes worker file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn(
      () =>
        '<%=imports%>\nexport const <%=jobName%>: <%=jobType%><never, void> = async (_args, _context) => {\n  // TODO: Implement job logic\n  console.log("Job executed");\n}'
    );
    fs.writeFileSync = vi.fn();

    // Create generator after setting up mocks
    gen = new JobGenerator(logger, fs, featureGen);

    // Mock the template utility to return a simple template
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        if (templatePath.includes('config/job.eta')) {
          return `app.addJob("${replacements.jobName}", {
  schedule: "${replacements.cron}",
  args: ${replacements.args}
});`;
        }
        return `// Generated job template for ${replacements.jobName || 'unknown'}`;
      }),
    };

    await gen.generate({
      feature: 'foo',
      name: 'Job',
      force: true,
      entities: ['User'],
      cron: '0 0 * * *',
      args: '{}',
    });
    expect(fs.writeFileSync).toHaveBeenCalled();
    // The WaspBaseGenerator uses its own configGenerator instead of updateFeatureConfig
    // So we expect the config file to be written directly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('foo.wasp.ts'),
      expect.any(String),
      'utf8'
    );
  });

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition('testJob', [], '', '{}');
    expect(typeof result).toBe('string');
  });
});
