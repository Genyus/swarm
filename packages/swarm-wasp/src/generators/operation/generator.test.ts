import type { IFileSystem, Logger } from '@ingenyus/swarm-core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockFeatureGen,
  createMockFS,
  createMockLogger,
} from '../../../tests/utils';
import type { IFeatureDirectoryGenerator } from '../../interfaces/feature-directory-generator';
import { OperationGenerator } from './generator';

describe('OperationGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureDirectoryGenerator;
  let gen: OperationGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    featureGen = createMockFeatureGen();
    gen = new OperationGenerator(logger, fs, featureGen);
  });

  it('generate writes operation file and updates config', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
      if (typeof p === 'string' && p.endsWith('.ts')) return false; // operation file does not exist
      if (typeof p === 'string' && p.includes('operations')) return false; // operation dir does not exist
      if (typeof p === 'string' && p.includes('schema.prisma')) return true; // Prisma schema exists
      return true; // all others exist
    });
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.includes('schema.prisma')) {
        return `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`;
      }
      return 'template';
    });
    fs.writeFileSync = vi.fn();
    fs.copyFileSync = vi.fn();
    fs.mkdirSync = vi.fn();
    gen = new OperationGenerator(logger, fs, featureGen);

    await gen.generate({
      featurePath: 'foo',
      flags: {
        dataType: 'User',
        operation: 'get',
        entities: 'User',
        force: true,
      },
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
    // The WaspBaseGenerator uses its own configGenerator instead of updateFeatureConfig
    // So we expect the config file to be written directly
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('foo.wasp.ts'),
      expect.any(String),
      'utf8'
    );
  });

  it('OperationGenerator > generate writes operation file and updates config', async () => {
    fs.existsSync = vi.fn((p) => {
      if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
      if (typeof p === 'string' && p.endsWith('.ts')) return false; // operation file does not exist
      if (typeof p === 'string' && p.includes('operations')) return false; // operation dir does not exist
      if (typeof p === 'string' && p.includes('schema.prisma')) return true; // Prisma schema exists
      return true; // all others exist
    });
    fs.mkdirSync = vi.fn();
    fs.readFileSync = vi.fn((path) => {
      if (typeof path === 'string' && path.includes('schema.prisma')) {
        return `model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}`;
      }
      return 'template';
    });
    fs.writeFileSync = vi.fn();
    gen = new OperationGenerator(logger, fs, featureGen);

    await gen.generate({
      featurePath: 'bar',
      flags: {
        dataType: 'User',
        operation: 'get',
        entities: 'User',
        force: true,
      },
    });

    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('getDefinition returns processed template', () => {
    const result = gen.getDefinition(
      'testOperation',
      'test',
      ['User'],
      'query',
      'features/test/server/queries/testOperation'
    );
    expect(typeof result).toBe('string');
  });
});
