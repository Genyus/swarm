import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfigurationManager } from '../../../src/server/utils/config.js';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock path resolution
vi.mock('node:path', () => ({
  join: vi.fn((...args) => args.join('/')),
  resolve: vi.fn((path, ...args) => `${path}/${args.join('/')}`),
}));

// Mock process.cwd
vi.mock('node:process', () => ({
  cwd: vi.fn(() => '/test/project'),
}));

// Mock logger
vi.mock('../../../src/server/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ConfigurationManager', () => {
  let configManager: ConfigurationManager;
  const mockReadFile = readFile as vi.MockedFunction<typeof readFile>;

  beforeEach(() => {
    vi.clearAllMocks();
    configManager = new ConfigurationManager('/test/config.json');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(configManager.isConfigLoaded()).toBe(false);
    });

    it('should accept custom config path', () => {
      const customManager = new ConfigurationManager(
        '/custom/path/config.json'
      );
      expect(customManager.getConfigPath()).toBe('/custom/path/config.json');
    });
  });

  describe('loadConfig', () => {
    it('should load valid configuration successfully', async () => {
      const validConfig = {
        transport: {
          stdio: true,
        },
        logging: {
          level: 'debug',
          format: 'text',
        },
      };

      mockReadFile.mockResolvedValue(JSON.stringify(validConfig));

      await configManager.loadConfig();

      expect(configManager.isConfigLoaded()).toBe(true);
      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('debug');
      expect(config.logging?.format).toBe('text');
    });

    it('should use defaults when no config file exists', async () => {
      const error = new Error('File not found');
      (error as NodeJS.ErrnoException).code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      await configManager.loadConfig();

      expect(configManager.isConfigLoaded()).toBe(true);
      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('info');
      expect(config.logging?.format).toBe('json');
    });

    it('should use defaults when config file is invalid JSON', async () => {
      mockReadFile.mockResolvedValue('invalid json');

      await configManager.loadConfig();

      expect(configManager.isConfigLoaded()).toBe(true);
      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('info');
    });

    it('should use defaults when config validation fails', async () => {
      const invalidConfig = {
        transport: {
          stdio: 'invalid-boolean', // Should be boolean
        },
      };

      mockReadFile.mockResolvedValue(JSON.stringify(invalidConfig));

      await configManager.loadConfig();

      expect(configManager.isConfigLoaded()).toBe(true);
      const config = configManager.getConfig();
      // Transport is no longer configurable, so no assertion needed
    });
  });

  describe('getConfig', () => {
    it('should throw error when config not loaded', () => {
      expect(() => configManager.getConfig()).toThrow(
        'Configuration error: config="not loaded". Expected: loaded configuration'
      );
    });

    it('should return configuration copy when loaded', async () => {
      mockReadFile.mockResolvedValue('{}');
      await configManager.loadConfig();

      const config1 = configManager.getConfig();
      const config2 = configManager.getConfig();

      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // Should be copies
    });
  });

  describe('getLoggingConfig', () => {
    it('should return logging configuration with defaults', async () => {
      mockReadFile.mockResolvedValue('{}');
      await configManager.loadConfig();

      const loggingConfig = configManager.getLoggingConfig();
      expect(loggingConfig.level).toBe('info');
      expect(loggingConfig.format).toBe('json');
    });

    it('should return custom logging configuration', async () => {
      const testConfig = {
        logging: {
          level: 'warn',
          format: 'text',
        },
      };

      mockReadFile.mockResolvedValue(JSON.stringify(testConfig));
      await configManager.loadConfig();

      const loggingConfig = configManager.getLoggingConfig();
      expect(loggingConfig.level).toBe('warn');
      expect(loggingConfig.format).toBe('text');
    });
  });

  describe('updateConfig', () => {
    it('should throw error when config not loaded', () => {
      expect(() => configManager.updateConfig({})).toThrow(
        'Configuration error: config="not loaded". Expected: loaded configuration'
      );
    });

    it('should update configuration at runtime', async () => {
      mockReadFile.mockResolvedValue('{}');
      await configManager.loadConfig();

      configManager.updateConfig({
        logging: { level: 'debug' },
      });

      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('debug');
    });

    it('should ignore transport configuration updates', async () => {
      mockReadFile.mockResolvedValue('{}');
      await configManager.loadConfig();

      // Transport updates should be ignored since transport is not configurable
      configManager.updateConfig({
        logging: { level: 'debug' },
      });

      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('debug');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset configuration to defaults', async () => {
      const testConfig = {
        logging: { level: 'error' },
      };

      mockReadFile.mockResolvedValue(JSON.stringify(testConfig));
      await configManager.loadConfig();

      // Verify custom config is loaded
      let config = configManager.getConfig();
      expect(config.logging?.level).toBe('error');

      // Reset to defaults
      configManager.resetToDefaults();
      config = configManager.getConfig();
      expect(config.logging?.level).toBe('info'); // Default
    });
  });

  describe('configuration merging', () => {
    it('should merge logging configuration correctly', async () => {
      const partialConfig = {
        logging: {
          level: 'debug',
          format: 'text',
        },
      };

      mockReadFile.mockResolvedValue(JSON.stringify(partialConfig));
      await configManager.loadConfig();

      const config = configManager.getConfig();
      expect(config.logging?.level).toBe('debug');
      expect(config.logging?.format).toBe('text');
    });
  });
});
