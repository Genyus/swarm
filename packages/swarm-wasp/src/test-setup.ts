import { afterAll, beforeAll, vi } from 'vitest';

// Mock process.exit to prevent CLI from actually exiting
const originalExit = process.exit;
beforeAll(() => {
  process.exit = vi.fn() as any;
});

afterAll(() => {
  process.exit = originalExit;
});
