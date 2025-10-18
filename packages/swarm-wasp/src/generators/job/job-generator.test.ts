import type { FileSystem, Logger, SwarmGenerator } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import { JobGenerator } from './job-generator';

// Mock SwarmConfigManager
vi.mock('@ingenyus/swarm', async () => {
  const actual = await vi.importActual('@ingenyus/swarm');
  return {
    ...actual,
    SwarmConfigManager: vi.fn().mockImplementation(() => ({
      loadConfig: vi.fn().mockResolvedValue({
        templateDirectory: '.swarm/templates',
        plugins: {
          wasp: {
            enabled: true,
            plugin: 'wasp',
          },
        },
      }),
    })),
  };
});

describe('JobGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let featureGen: SwarmGenerator<{ path: string }>;
  let gen: JobGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new JobGenerator(logger, fs, featureGen);
  });

  it('generate writes worker file and updates config', async () => {
    fs.existsSync = vi.fn((p) => !p.includes('notfound'));
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.endsWith('.wasp.ts')) {
        return `import { App } from "@ingenyus/swarm-wasp";

export default function configureFeature(app: App, feature: string): void {
  app
}`;
      }
      return '<%=imports%>\nexport const <%=jobName%>: <%=jobType%><never, void> = async (_args, _context) => {\n  // TODO: Implement job logic\n  console.log("Job executed");\n}';
    });
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
      resolveTemplatePath: vi.fn(
        (templateName, generatorName, currentFileUrl) => {
          return `/mock/templates/${generatorName}/templates/${templateName}`;
        }
      ),
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
      expect.any(String)
    );
  });

  it('getDefinition returns processed template', () => {
    // Mock the template utility to process templates
    (gen as any).templateUtility = {
      processTemplate: vi.fn((templatePath, replacements) => {
        return `testJob: { schedule: "", args: {} }`;
      }),
      resolveTemplatePath: vi.fn(
        (templateName, generatorName, currentFileUrl) => {
          return `/mock/templates/${generatorName}/templates/${templateName}`;
        }
      ),
    };

    const result = gen.getDefinition('testJob', [], '', '{}');
    expect(typeof result).toBe('string');
  });
});
