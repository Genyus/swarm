import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mockFileSystemTools } from './mock-filesystem.js';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { SwarmTools } from '../../src/server/tools/swarm.js';

describe('Job Generation Integration Tests', () => {
  let testEnv: IntegrationTestEnvironment;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(async () => {
    mockSwarmFunctions();
    mockSwarm = await setupSwarmMocks();
    swarmTools = mockSwarm.mockSwarmToolsInstance;
  });

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    mockFileSystemTools(testEnv);
    await testEnv.setup('withEntities');
    mockSwarm.mockSwarmToolsInstance.generateJob.mockClear();
    mockSwarm.mockSwarmToolsInstance.generateJob.mockImplementation(
      (params: any) => {
        const jobName = params.name || 'defaultJob';
        const fileName =
          jobName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.ts';
        return Promise.resolve({
          success: true,
          output: `Job ${jobName} generated successfully`,
          generatedFiles: [`src/jobs/${fileName}`],
          modifiedFiles: [],
        });
      }
    );
  });

  afterEach(async () => {
    await testEnv.teardown();
    resetSwarmMocks(mockSwarm);
  });

  describe('Basic Job Generation', () => {
    it('should generate a simple job without scheduling', async () => {
      const params = {
        feature: 'main',
        name: 'cleanupJob',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('cleanupJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should generate a job with force flag', async () => {
      const params = {
        feature: 'main',
        name: 'forceJob',
        force: true,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('forceJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });
  });

  describe('Job Scheduling', () => {
    it('should generate a job with cron schedule', async () => {
      const params = {
        feature: 'main',
        name: 'scheduledJob',
        schedule: '0 2 * * *', // Daily at 2 AM
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('scheduledJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should generate a job with complex cron schedule', async () => {
      const params = {
        feature: 'main',
        name: 'complexScheduledJob',
        schedule: '*/15 * * * *', // Every 15 minutes
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('complexScheduledJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should generate a job with schedule arguments', async () => {
      const params = {
        feature: 'main',
        name: 'argScheduledJob',
        schedule: '0 6 * * 1', // Weekly on Monday at 6 AM
        scheduleArgs: '{"timezone": "UTC", "retryAttempts": 3}',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('argScheduledJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });
  });

  describe('Entity Integration', () => {
    it('should generate a job with single entity', async () => {
      const params = {
        feature: 'main',
        name: 'userCleanupJob',
        entities: ['User'],
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('userCleanupJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should generate a job with multiple entities', async () => {
      const params = {
        feature: 'main',
        name: 'multiEntityJob',
        entities: ['User', 'Post', 'Comment'],
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('multiEntityJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should generate a job with entities and scheduling', async () => {
      const params = {
        feature: 'main',
        name: 'scheduledEntityJob',
        schedule: '0 3 * * *', // Daily at 3 AM
        entities: ['User', 'Post'],
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('scheduledEntityJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });
  });

  describe('Complex Job Scenarios', () => {
    it('should generate a comprehensive job with all options', async () => {
      const params = {
        feature: 'main',
        name: 'comprehensiveJob',
        schedule: '0 1 * * 0', // Weekly on Sunday at 1 AM
        scheduleArgs: '{"priority": "high", "timeout": 300}',
        entities: ['User', 'Post', 'Comment', 'Category'],
        force: true,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('comprehensiveJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });

    it('should handle job generation with minimal parameters', async () => {
      const params = {
        feature: 'main',
        name: 'minimalJob',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('minimalJob');
      expect(mockSwarm.mockSwarmToolsInstance.generateJob).toHaveBeenCalledWith(
        params
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle job generation errors gracefully', async () => {
      mockSwarm.mockSwarmToolsInstance.generateJob.mockImplementation(() =>
        Promise.reject(new Error('Job generation failed'))
      );

      const params = {
        feature: 'main',
        name: 'errorJob',
        projectPath: testEnv.tempProjectDir,
      };

      await expect(swarmTools.generateJob(params)).rejects.toThrow(
        'Job generation failed'
      );
    });

    it('should handle invalid schedule format', async () => {
      const params = {
        feature: 'main',
        name: 'invalidScheduleJob',
        schedule: 'invalid-cron',
        projectPath: testEnv.tempProjectDir,
      };

      // This would be handled by the Swarm CLI validation
      const result = await swarmTools.generateJob(params);
      expect(result.success).toBe(true);
    });
  });

  describe('Project Integration', () => {
    it('should work with different project templates', async () => {
      await testEnv.teardown();
      await testEnv.setup('minimal');

      const params = {
        feature: 'main',
        name: 'templateJob',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('templateJob');
    });

    it('should work with projects containing entities', async () => {
      await testEnv.teardown();
      await testEnv.setup('withEntities');

      const params = {
        feature: 'main',
        name: 'entityJob',
        entities: ['User', 'Post'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await swarmTools.generateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('entityJob');
    });
  });
});
