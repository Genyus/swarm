// Test setup file for Vitest
import { vi } from 'vitest';

// Global test timeout
vi.setConfig({ testTimeout: 10000 });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
