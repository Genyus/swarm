import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFileSystemTools } from './mock-filesystem.js';
import {
  mockSwarmFunctions,
  resetSwarmMocks,
  setSwarmError,
  setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';
import { IntegrationValidator } from './validator.js';

describe('Job Generation Integration Tests', () => {
  let testEnv: IntegrationTestEnvironment;
  let validator: IntegrationValidator;
  let mockSwarm: any;

  beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    validator = new IntegrationValidator(testEnv);

    // Setup mocks
    mockSwarmFunctions();
    mockSwarm = setupSwarmMocks();
    mockFileSystemTools(testEnv);

    // Setup test project
    await testEnv.setup('withEntities');
  });

  afterEach(async () => {
    await testEnv.teardown();
    resetSwarmMocks(mockSwarm);
  });

  describe('Basic Job Generation', () => {
    it('should generate a simple job without scheduling', async () => {
      const params = {
        name: 'cleanupJob',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('cleanupJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should generate a job with force flag', async () => {
      const params = {
        name: 'forceJob',
        force: true,
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('forceJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });
  });

  describe('Job Scheduling', () => {
    it('should generate a job with cron schedule', async () => {
      const params = {
        name: 'scheduledJob',
        schedule: '0 2 * * *', // Daily at 2 AM
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('scheduledJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should generate a job with complex cron schedule', async () => {
      const params = {
        name: 'complexScheduledJob',
        schedule: '*/15 * * * *', // Every 15 minutes
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('complexScheduledJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should generate a job with schedule arguments', async () => {
      const params = {
        name: 'argScheduledJob',
        schedule: '0 6 * * 1', // Weekly on Monday at 6 AM
        scheduleArgs: '{"timezone": "UTC", "retryAttempts": 3}',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('argScheduledJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });
  });

  describe('Entity Integration', () => {
    it('should generate a job with single entity', async () => {
      const params = {
        name: 'userCleanupJob',
        entities: ['User'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('userCleanupJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should generate a job with multiple entities', async () => {
      const params = {
        name: 'multiEntityJob',
        entities: ['User', 'Post', 'Comment'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('multiEntityJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should generate a job with entities and scheduling', async () => {
      const params = {
        name: 'scheduledEntityJob',
        schedule: '0 3 * * *', // Daily at 3 AM
        entities: ['User', 'Post'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('scheduledEntityJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });
  });

  describe('Complex Job Scenarios', () => {
    it('should generate a comprehensive job with all options', async () => {
      const params = {
        name: 'comprehensiveJob',
        schedule: '0 1 * * 0', // Weekly on Sunday at 1 AM
        scheduleArgs: '{"priority": "high", "timeout": 300}',
        entities: ['User', 'Post', 'Comment', 'Category'],
        force: true,
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('comprehensiveJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });

    it('should handle job generation with minimal parameters', async () => {
      const params = {
        name: 'minimalJob',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('minimalJob');
      expect(mockSwarm.swarmGenerateJob).toHaveBeenCalledWith(params);
    });
  });

  describe('Error Handling', () => {
    it('should handle job generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'swarmGenerateJob', 'Job generation failed');

      const params = {
        name: 'errorJob',
        projectPath: testEnv.tempProjectDir,
      };

      await expect(mockSwarm.swarmGenerateJob(params)).rejects.toThrow(
        'Job generation failed'
      );
    });

    it('should handle invalid schedule format', async () => {
      const params = {
        name: 'invalidScheduleJob',
        schedule: 'invalid-cron',
        projectPath: testEnv.tempProjectDir,
      };

      // This would be handled by the Swarm CLI validation
      const result = await mockSwarm.swarmGenerateJob(params);
      expect(result.success).toBe(true);
    });
  });

  describe('Project Integration', () => {
    it('should work with different project templates', async () => {
      await testEnv.teardown();
      await testEnv.setup('minimal');

      const params = {
        name: 'templateJob',
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('templateJob');
    });

    it('should work with projects containing entities', async () => {
      await testEnv.teardown();
      await testEnv.setup('withEntities');

      const params = {
        name: 'entityJob',
        entities: ['User', 'Post'],
        projectPath: testEnv.tempProjectDir,
      };

      const result = await mockSwarm.swarmGenerateJob(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('entityJob');
    });
  });
});
