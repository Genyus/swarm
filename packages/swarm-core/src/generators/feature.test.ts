import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IFileSystem, Logger } from '../types';
import { parseHelperMethodDefinition } from '../utils/strings';
import { FeatureGenerator } from './feature';

// Mock implementations
const mockLogger: Logger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  success: vi.fn(),
};

const createMockFileSystem = (
  initialContent: string
): IFileSystem & { getContent: () => string } => {
  let content = initialContent;
  let callCount = 0;

  const mockFs = {
    readFileSync: vi.fn().mockImplementation(() => {
      callCount++;
      console.log(
        `Mock readFileSync call #${callCount}, returning content length: ${content.length}`
      );
      return content;
    }),
    writeFileSync: vi
      .fn()
      .mockImplementation((path: string, newContent: string) => {
        console.log(
          `Mock writeFileSync called, updating content from length ${content.length} to ${newContent.length}`
        );
        content = newContent;
      }),
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn(),
    readdirSync: vi.fn().mockReturnValue([]),
    statSync: vi.fn().mockReturnValue({ isDirectory: () => false }),
    getContent: () => content,
  };

  return mockFs as any;
};

describe('FeatureGenerator', () => {
  let featureGenerator: FeatureGenerator;
  let mockFs: IFileSystem;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateFeatureConfig', () => {
    it('should maintain consistent content when replacing all job definitions with force mode', () => {
      // Initial content with three jobs
      const initialContent = `import { App } from "@ingenyus/swarm-config";

/**
 * Fluent Wasp feature configuration
 */
export default function configure(app: App, feature: string): void {
  app
    // Job definitions
    .addJob(feature, "emailJob", {
      cron: "0 8 * * *",
      args: {},
    })
    .addJob(feature, "reportJob", {
      cron: "0 9 * * *",
      args: {},
    })
    .addJob(feature, "userStatsJob", {
      cron: "0 10 * * *",
      args: {},
    })
}`;

      // Create mock filesystem with initial content
      mockFs = createMockFileSystem(initialContent);
      featureGenerator = new FeatureGenerator(mockLogger, mockFs);

      // Job definitions to test (in order of execution)
      const jobDefinitions = [
        {
          name: 'emailJob',
          cron: '0 8 * * *',
          definition: `    .addJob(feature, "emailJob", {
      cron: "0 8 * * *",
      args: {},
    })`,
        },
        {
          name: 'reportJob',
          cron: '0 9 * * *',
          definition: `    .addJob(feature, "reportJob", {
      cron: "0 9 * * *",
      args: {},
    })`,
        },
        {
          name: 'userStatsJob',
          cron: '0 10 * * *',
          definition: `    .addJob(feature, "userStatsJob", {
      cron: "0 10 * * *",
      args: {},
    })`,
        },
      ];

      let currentContent = initialContent;
      const results: string[] = [];

      // Test each job replacement
      for (let i = 0; i < jobDefinitions.length; i++) {
        const job = jobDefinitions[i];
        console.log(`\n=== Testing job ${i + 1}: ${job.name} ===`);

        // Update the mock to return current content
        (mockFs.readFileSync as any).mockReturnValue(currentContent);

        // Call updateFeatureConfig
        const filePath = featureGenerator.updateFeatureConfig(
          '/test/path',
          job.definition
        );

        // Get the updated content from the mock
        const updatedContent = (mockFs as any).getContent();

        // Store the result
        results.push(updatedContent);
        currentContent = updatedContent;

        console.log(`Content after ${job.name}:`);
        console.log(updatedContent);
        console.log('---');
      }

      // Assertions
      expect(results).toHaveLength(3);

      // Each result should have the same structure
      for (let i = 0; i < results.length; i++) {
        const content = results[i];

        // Should contain all three job definitions
        expect(content).toContain('emailJob');
        expect(content).toContain('reportJob');
        expect(content).toContain('userStatsJob');

        // Should have only one "Job definitions" comment
        const jobCommentMatches = content.match(/\/\/ Job definitions/g);
        expect(jobCommentMatches).toHaveLength(1);

        // Comment should be at the beginning of the job group, not at the end
        const lines = content.split('\n');
        const jobCommentIndex = lines.findIndex(
          (line) => line.trim() === '// Job definitions'
        );
        const firstJobIndex = lines.findIndex((line) =>
          line.includes('.addJob(feature, "emailJob"')
        );

        expect(jobCommentIndex).toBeLessThan(firstJobIndex);
        expect(jobCommentIndex).toBeGreaterThan(-1);
        expect(firstJobIndex).toBeGreaterThan(-1);

        console.log(`Result ${i + 1} validation passed`);
      }

      // Final content should be identical to initial content (except for any whitespace differences)
      const finalContent = results[results.length - 1];
      const normalizedFinal = finalContent.replace(/\s+/g, ' ').trim();
      const normalizedInitial = initialContent.replace(/\s+/g, ' ').trim();

      expect(normalizedFinal).toBe(normalizedInitial);
    });

    it('should handle adding new job when no jobs exist', () => {
      const initialContent = `import { App } from "@ingenyus/swarm-config";

export default function configure(app: App, feature: string): void {
  app
    // API definitions
    .addApi(feature, "testApi", {
      method: "GET",
      route: "/api/test",
      auth: false
    })
}`;

      mockFs = createMockFileSystem(initialContent);
      featureGenerator = new FeatureGenerator(mockLogger, mockFs);

      const jobDefinition = `    .addJob(feature, "newJob", {
      cron: "0 8 * * *",
      args: {},
    })`;

      featureGenerator.updateFeatureConfig('/test/path', jobDefinition);
      const result = (mockFs as any).getContent();

      // Should add the job with a comment
      expect(result).toContain('// Job definitions');
      expect(result).toContain('newJob');
      expect(result).toContain('testApi');

      // Comment should be before the job
      const lines = result.split('\n');
      const jobCommentIndex = lines.findIndex(
        (line: string) => line.trim() === '// Job definitions'
      );
      const jobIndex = lines.findIndex((line: string) =>
        line.includes('.addJob(feature, "newJob"')
      );

      expect(jobCommentIndex).toBeLessThan(jobIndex);
    });

    it('should handle replacing the last job in the list', () => {
      const initialContent = `import { App } from "@ingenyus/swarm-config";

export default function configure(app: App, feature: string): void {
  app
    // Job definitions
    .addJob(feature, "emailJob", {
      cron: "0 8 * * *",
      args: {},
    })
    .addJob(feature, "userStatsJob", {
      cron: "0 10 * * *",
      args: {},
    })
}`;

      mockFs = createMockFileSystem(initialContent);
      featureGenerator = new FeatureGenerator(mockLogger, mockFs);

      // Replace the last job (userStatsJob)
      const jobDefinition = `    .addJob(feature, "userStatsJob", {
      cron: "0 11 * * *",
      args: {},
    })`;

      featureGenerator.updateFeatureConfig('/test/path', jobDefinition);
      const result = (mockFs as any).getContent();

      // Should still have the comment at the beginning, not at the end
      const lines = result.split('\n');
      const jobCommentIndex = lines.findIndex(
        (line: string) => line.trim() === '// Job definitions'
      );
      const lastJobIndex = lines.findIndex((line: string) =>
        line.includes('.addJob(feature, "userStatsJob"')
      );

      expect(jobCommentIndex).toBeLessThan(lastJobIndex);
      expect(jobCommentIndex).toBeGreaterThan(-1);

      // Should not have duplicate comments
      const jobCommentMatches = result.match(/\/\/ Job definitions/g);
      expect(jobCommentMatches).toHaveLength(1);
    });

    it('should handle single definition replacement without moving comment', () => {
      // Start with a single job definition
      const initialContent = `export default function configureFeature() {
  app
    // Job definitions
    .addJob(feature, "initialJob", async (args, { prisma }) => {
      // Initial job implementation
    })
}`;

      const mockFs = createMockFileSystem(initialContent);
      const featureGenerator = new FeatureGenerator(mockLogger, mockFs);

      // Replace the single job with a new one (same name, different implementation)
      const newJobDefinition = `    .addJob(feature, "initialJob", async (args, { prisma }) => {
      // Replaced job implementation
    })`;

      featureGenerator.updateFeatureConfig('/test/path', newJobDefinition);
      const result = mockFs.getContent();

      // The comment should still be at the beginning, not moved above the new definition
      const lines = result.split('\n');
      const jobCommentIndex = lines.findIndex(
        (line: string) => line.trim() === '// Job definitions'
      );
      const replacedJobIndex = lines.findIndex((line: string) =>
        line.includes('.addJob(feature, "initialJob"')
      );
      console.log('jobCommentIndex:', jobCommentIndex);
      console.log('result:', result);
      // Comment should come before the job definition
      expect(jobCommentIndex).toBeLessThan(replacedJobIndex);
      expect(jobCommentIndex).toBeGreaterThan(-1);

      // Should have the replaced job with new implementation
      expect(result).toContain('initialJob');
      expect(result).toContain('// Replaced job implementation');
      expect(result).not.toContain('// Initial job implementation');

      // Should only have one comment
      const jobCommentMatches = result.match(/\/\/ Job definitions/g);
      expect(jobCommentMatches).toHaveLength(1);
    });

    it('should replace definition with different parameters but same name', () => {
      // Start with a job definition
      const initialContent = `export default function configureFeature() {
  app
    // Job definitions
    .addJob(feature, "testJob", {
      cron: "0 8 * * *",
      args: {},
    })
}`;

      const mockFs = createMockFileSystem(initialContent);
      const featureGenerator = new FeatureGenerator(mockLogger, mockFs);

      // Replace with same name but different parameters
      const newJobDefinition = `    .addJob(feature, "testJob", {
      cron: "0 9 * * *",
      args: { timezone: "UTC" },
    })`;

      featureGenerator.updateFeatureConfig('/test/path', newJobDefinition);
      const result = mockFs.getContent();

      // Should have replaced the job with new parameters
      expect(result).toContain('testJob');
      expect(result).toContain('0 9 * * *');
      expect(result).toContain('timezone: "UTC"');
      expect(result).not.toContain('0 8 * * *');

      // Should only have one definition (not duplicates)
      const jobMatches = result.match(/\.addJob\(feature, "testJob"/g);
      expect(jobMatches).toHaveLength(1);

      // Should only have one comment
      const jobCommentMatches = result.match(/\/\/ Job definitions/g);
      expect(jobCommentMatches).toHaveLength(1);
    });
  });
});
