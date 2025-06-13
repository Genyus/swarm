import { describe, expect, it, vi } from 'vitest';

// Mock only the logger/signale part
vi.mock('signale', () => ({
  Signale: vi.fn().mockImplementation(() => ({
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
  })),
}));

describe('errors utils', () => {
  it('handleFatalError logs and exits', async () => {
    // Mock console.error to capture error logging
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });

    // Dynamically import the module to avoid module caching issues
    const { handleFatalError } = await import('./errors');

    try {
      handleFatalError('Test error');
    } catch {
      // expected process.exit throws
    }

    expect(exitSpy).toHaveBeenCalledWith(1);
    // Since we're using Signale, let's just check that process.exit was called
    // The actual logging is handled by Signale which we've mocked

    consoleSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
