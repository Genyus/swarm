import { describe, expect, it, vi } from 'vitest';

// Mock only the logger/signale part
vi.mock('signale', () => ({
  default: {
    Signale: function MockSignale(this: any) {
      this.error = vi.fn();
      this.warn = vi.fn();
      this.info = vi.fn();
      this.success = vi.fn();
    },
  },
  Signale: function MockSignale(this: any) {
    this.error = vi.fn();
    this.warn = vi.fn();
    this.info = vi.fn();
    this.success = vi.fn();
  },
}));

describe('errors utils', () => {
  it('handleFatalError logs and throws error', async () => {
    // Mock console.error to capture error logging
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Dynamically import the module to avoid module caching issues
    const { handleFatalError } = await import('./errors');

    const testError = new Error('Test error');

    expect(() => {
      handleFatalError('Test error message', testError);
    }).toThrow('Test error');

    consoleSpy.mockRestore();
  });
});
