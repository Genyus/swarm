import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IFileSystem } from '../types/filesystem';
import type { IFeatureGenerator } from '../types/generator';
import type { Logger } from '../types/logger';
import * as ioUtils from '../utils/io';
import { OperationGenerator } from './operation';

// Mock the io utils
vi.mock('../utils/io', () => ({
  getFeatureTargetDir: vi.fn().mockReturnValue({
    targetDir: 'features/test/server/queries',
    importPath: '@src/features/test/_core/server/queries'
  }),
  ensureDirectoryExists: vi.fn(),
  getConfigDir: vi.fn().mockReturnValue('config'),
}));

// Mock the prisma utils
vi.mock('../utils/prisma', () => ({
  getEntityMetadata: vi.fn().mockResolvedValue({
    name: 'User',
    fields: [
      { name: 'id', type: 'String', tsType: 'string', isId: true, isRequired: true },
      { name: 'name', type: 'String', tsType: 'string', isRequired: true },
    ],
  }),
  getIdField: vi.fn().mockReturnValue({ name: 'id', tsType: 'string' }),
  getOmitFields: vi.fn().mockReturnValue('"id"'),
  getJsonFields: vi.fn().mockReturnValue([]),
  needsPrismaImport: vi.fn().mockReturnValue(false),
  generateJsonTypeHandling: vi.fn().mockReturnValue(''),
}));

// Mock template utils
vi.mock('../utils/templates', () => ({
  getFileTemplatePath: vi.fn().mockReturnValue('template/path'),
  processTemplate: vi.fn().mockReturnValue('processed template'),
}));

function createMockFS(): IFileSystem {
  return {
    readFileSync: vi.fn(() => 'template'),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(() => true),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
  };
}

function createMockLogger(): Logger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  };
}

function createMockFeatureGen(): IFeatureGenerator {
  return {
    updateFeatureConfig: vi.fn(() => 'config'),
  } as any;
}

describe('OperationGenerator', () => {
  let fs: IFileSystem;
  let logger: Logger;
  let featureGen: IFeatureGenerator;
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
      return true; // all others exist
    });
    fs.readFileSync = vi.fn(() => 'template');
    fs.writeFileSync = vi.fn();
    fs.copyFileSync = vi.fn();
    fs.mkdirSync = vi.fn();
    const logger = {
      info: vi.fn(),
      success: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };
    const featureGen = createMockFeatureGen();
    const gen = new OperationGenerator(logger as any, fs as any, featureGen as any);
    await gen.generate('foo', {
      feature: 'foo',
      dataType: 'User',
      operation: 'get',
      entities: 'User',
      force: true,
    });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(ioUtils.ensureDirectoryExists).toHaveBeenCalled();
    expect(featureGen.updateFeatureConfig).toHaveBeenCalled();
  });

  it('OperationGenerator > generate writes operation file and updates config', async () => {
    const fs = {
      existsSync: vi.fn((p) => {
        if (typeof p === 'string' && p.endsWith('.wasp.ts')) return true; // config file exists
        if (typeof p === 'string' && p.endsWith('.ts')) return false; // operation file does not exist
        if (typeof p === 'string' && p.includes('operations')) return false; // operation dir does not exist
        return true; // all others exist
      }),
      mkdirSync: vi.fn(),
      readFileSync: vi.fn().mockReturnValue('template'),
      writeFileSync: vi.fn(),
    };
    const logger = {
      info: vi.fn(),
      success: vi.fn(),
      debug: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    };
    const featureGen = createMockFeatureGen();
    const gen = new OperationGenerator(logger as any, fs as any, featureGen as any);
    await gen.generate('bar', {
      feature: 'bar',
      dataType: 'User',
      operation: 'get',
      entities: 'User',
      force: true,
    });
    expect(ioUtils.ensureDirectoryExists).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
}); 