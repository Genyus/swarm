import type {
  ExtendedSchema,
  FileSystem,
  Generator,
  Logger,
} from '@ingenyus/swarm';
import { vi } from 'vitest';
import { schema } from '../../src/generators/feature/schema';

export function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } as Logger;
}

export function createMockFS(): FileSystem {
  return {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  } as FileSystem;
}

export function createMockFeatureGen<S extends ExtendedSchema>(
  s: S
): Generator<S> {
  return { name: 'feature', description: 'Mock', schema: s, generate: vi.fn() };
}
