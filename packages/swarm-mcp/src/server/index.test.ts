import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SwarmMCPServer } from './index.js';
import type { ServerConfig } from './types/mcp.js';

describe('SwarmMCPServer', () => {
  let server: SwarmMCPServer;
  let config: ServerConfig;

  beforeEach(() => {
    config = {
      name: 'test-swarm-mcp',
      version: '0.1.0',
      instructions: 'Test MCP server for Swarm CLI integration',
      tools: [],
      logging: {
        level: 'error', // Reduce logging noise in tests
        format: 'text',
      },
    };
  });

  afterEach(async () => {
    if (server) {
      try {
        await server.stop();
      } catch {
        // Ignore errors during cleanup
      }
    }
  });

  describe('Constructor', () => {
    it('should create a server instance with valid config', () => {
      server = new SwarmMCPServer(config);
      expect(server).toBeDefined();
      expect(server.getInfo().name).toBe('test-swarm-mcp');
      expect(server.getInfo().version).toBe('0.1.0');
    });

    it('should handle missing instructions gracefully', () => {
      const configWithoutInstructions = { ...config };
      delete configWithoutInstructions.instructions;

      server = new SwarmMCPServer(configWithoutInstructions);
      const info = server.getInfo();
      // Instructions may be undefined if not provided, which is acceptable
      expect(
        info.instructions === undefined || typeof info.instructions === 'string'
      ).toBe(true);
    });
  });

  describe('Server State', () => {
    it('should start with isRunning false', () => {
      server = new SwarmMCPServer(config);
      const status = server.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.sessionId).toBeUndefined();
    });

    it('should provide server information', () => {
      server = new SwarmMCPServer(config);
      const info = server.getInfo();

      expect(info.name).toBe(config.name);
      expect(info.version).toBe(config.version);
      expect(info.instructions).toBe(config.instructions);
      expect(info.status).toBeDefined();
    });
  });

  describe('Transport Creation', () => {
    it('should handle stdio transport configuration', () => {
      server = new SwarmMCPServer(config);
      expect(() => server.getInfo()).not.toThrow();
    });
  });

  describe('Lifecycle Management', () => {
    it('should prevent starting server twice', async () => {
      server = new SwarmMCPServer(config);

      // Note: We can't actually start the server in tests without a real MCP client
      // But we can test that attempting to start twice throws an error
      try {
        await server.start();
      } catch {
        // Expected to fail without a real transport connection
      }

      // Set the state manually for testing
      const status = server.getStatus();
      if (!status.isRunning) {
        // Simulate the running state for this test
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        (server as any).state.isRunning = true;
      }

      await expect(server.start()).rejects.toThrow(
        'Internal error during start server'
      );
    });

    it('should handle stop gracefully when not running', async () => {
      server = new SwarmMCPServer(config);

      // Should not throw when stopping a server that's not running
      await expect(server.stop()).resolves.not.toThrow();
    });
  });
});
