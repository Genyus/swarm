import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { configureLogger, LogFormat, logger, LogLevel } from '../../../logger';
import { createErrorContext, ErrorFactory } from './errors';

const ENV_PREFIX = 'SWARM_MCP_';

const LoggingConfigSchema = z.object({
  level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  format: z.enum(['json', 'text']).optional(),
});

const ServerConfigSchema = z.object({
  logging: LoggingConfigSchema.optional(),
});

interface LoggingConfig {
  level?: 'debug' | 'info' | 'warn' | 'error' | undefined;
  format?: 'json' | 'text' | undefined;
}

interface ServerConfig {
  logging?: LoggingConfig | undefined;
}

const DEFAULT_CONFIG: ServerConfig = {
  logging: {
    level: 'info',
    format: 'json',
  },
};

export class ConfigurationManager {
  private config: ServerConfig;
  private configPath: string;
  private isLoaded = false;

  constructor(configPath?: string) {
    this.configPath = configPath || this.findConfigPath();
    this.config = { ...DEFAULT_CONFIG };
  }

  private loadFromEnvironment(): Partial<ServerConfig> {
    const envConfig: Partial<ServerConfig> = {};

    if (process.env[`${ENV_PREFIX}LOGGING_LEVEL`] !== undefined) {
      const level = process.env[`${ENV_PREFIX}LOGGING_LEVEL`]!;
      if (['debug', 'info', 'warn', 'error'].includes(level)) {
        envConfig.logging = {
          ...envConfig.logging,
          level: level as 'debug' | 'info' | 'warn' | 'error',
        };
      }
    }

    if (process.env[`${ENV_PREFIX}LOGGING_FORMAT`] !== undefined) {
      const format = process.env[`${ENV_PREFIX}LOGGING_FORMAT`]!;
      if (['json', 'text'].includes(format)) {
        envConfig.logging = {
          ...envConfig.logging,
          format: format as 'json' | 'text',
        };
      }
    }

    return envConfig;
  }

  private findConfigPath(): string {
    let currentDir = process.cwd();
    const maxDepth = 10;

    for (let depth = 0; depth < maxDepth; depth++) {
      const configPath = join(currentDir, '.mcp', 'config.json');
      try {
        if (existsSync(configPath)) {
          return configPath;
        }
      } catch {
        // Continue searching if file check fails
      }

      const parentDir = resolve(currentDir, '..');
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }

    return join(process.cwd(), '.mcp', 'config.json');
  }

  async loadConfig(): Promise<void> {
    let finalConfig = { ...DEFAULT_CONFIG };

    try {
      const configData = await readFile(this.configPath, 'utf-8');
      const parsedConfig = JSON.parse(configData) as unknown;
      const validatedConfig = ServerConfigSchema.parse(parsedConfig);

      // Ensure logging goes to stderr to avoid corrupting MCP stdio transport.
      configureLogger({
        stream: 'stderr',
        level: (process.env['SWARM_MCP_LOG_LEVEL'] || 'info') as LogLevel,
        format: (process.env['SWARM_MCP_LOG_FORMAT'] || 'text') as LogFormat,
      });
      finalConfig = this.mergeConfig(DEFAULT_CONFIG, validatedConfig);
      logger.info(`[INFO] Configuration loaded from file: ${this.configPath}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn(
          `[WARN] Invalid configuration format in file, using defaults. Config path: ${this.configPath}`
        );
      } else if ((error as { code?: string }).code === 'ENOENT') {
        logger.info(
          `[INFO] No configuration file found, using defaults. Config path: ${this.configPath}`
        );
      } else {
        logger.error(
          `[ERROR] Failed to load configuration file, using defaults. Config path: ${this.configPath}, Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    const envConfig = this.loadFromEnvironment();
    if (Object.keys(envConfig).length > 0) {
      const completeEnvConfig: ServerConfig = {
        logging: envConfig.logging,
      };
      finalConfig = this.mergeConfig(finalConfig, completeEnvConfig);
      console.log(`[INFO] Environment variable overrides applied`);
    }

    this.config = finalConfig;
    this.isLoaded = true;
  }

  private mergeConfig(
    defaults: ServerConfig,
    userConfig: ServerConfig
  ): ServerConfig {
    const merged: ServerConfig = {
      logging: { ...defaults.logging },
    };

    if (userConfig.logging) {
      merged.logging = {
        ...defaults.logging,
        ...userConfig.logging,
      };
    }

    return merged;
  }

  getConfig(): ServerConfig {
    if (!this.isLoaded) {
      throw ErrorFactory.configuration(
        'config',
        'not loaded',
        'loaded configuration',
        createErrorContext('ConfigurationManager', 'getConfig')
      );
    }
    return { ...this.config };
  }

  getLoggingConfig(): LoggingConfig {
    const config = this.getConfig();
    return (
      config.logging || {
        level: 'info',
        format: 'json',
      }
    );
  }

  updateConfig(updates: Partial<ServerConfig>): void {
    if (!this.isLoaded) {
      throw ErrorFactory.configuration(
        'config',
        'not loaded',
        'loaded configuration',
        createErrorContext('ConfigurationManager', 'updateConfig')
      );
    }

    const completeUpdates: ServerConfig = {
      logging: updates.logging,
    };

    this.config = this.mergeConfig(this.config, completeUpdates);
    console.log(`[INFO] Configuration updated at runtime`);
  }

  getConfigPath(): string {
    return this.configPath;
  }

  isConfigLoaded(): boolean {
    return this.isLoaded;
  }

  resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
    console.log('[INFO] Configuration reset to defaults');
  }

  getEnvironmentVariableInfo(): Record<string, string> {
    return {
      SWARM_MCP_LOGGING_LEVEL: 'Log level (debug/info/warn/error)',
      SWARM_MCP_LOGGING_FORMAT: 'Log format (json/text)',
    };
  }
}

export const configManager = new ConfigurationManager();
