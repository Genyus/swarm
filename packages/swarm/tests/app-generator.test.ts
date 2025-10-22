import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toFriendlyName, validateProjectName } from '../src/common/strings';
import { AppGenerator } from '../src/generators';
import { FileSystem, Logger } from '../src/types';

// Mock degit module
vi.mock('degit', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      clone: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  } as Logger;
}

function createMockFS(): FileSystem {
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

describe('AppGenerator', () => {
  let fs: any;
  let logger: any;
  let gen: AppGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new AppGenerator(fs, logger);
    vi.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'));
  });

  it('should validate project names correctly', () => {
    expect(validateProjectName('my-app').valid).toBe(true);
    expect(validateProjectName('my_app').valid).toBe(true);
    expect(validateProjectName('myApp').valid).toBe(true);
    expect(validateProjectName('my app').valid).toBe(false);
    expect(validateProjectName('').valid).toBe(false);
    expect(validateProjectName('a'.repeat(215)).valid).toBe(false);
  });

  it('should generate friendly names from various cases', () => {
    expect(toFriendlyName('my-awesome-app')).toBe('My Awesome App');
    expect(toFriendlyName('myAwesomeApp')).toBe('My Awesome App');
    expect(toFriendlyName('my_awesome_app')).toBe('My Awesome App');
  });

  it('should reject existing directories', async () => {
    fs.existsSync.mockReturnValue(true);
    await expect(
      gen.generate({ name: 'existing-app', template: 'test/template' })
    ).rejects.toThrow('Directory already exists');
  });

  it('should validate project name before generation', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(
      gen.generate({ name: 'invalid name!', template: 'test/template' })
    ).rejects.toThrow(
      'Project name can only contain letters, numbers, hyphens, and underscores'
    );
  });

  it('should use project name as default target directory', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue('content');
    fs.writeFileSync.mockImplementation(() => {});

    await gen.generate({ name: 'my-app', template: 'test/template' });

    // Verify that degit was called with correct parameters
    const degit = await import('degit');
    expect(degit.default).toHaveBeenCalledWith('test/template', {
      cache: false,
      force: false,
    });
  });

  it('should use custom target directory when provided', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue('content');
    fs.writeFileSync.mockImplementation(() => {});

    await gen.generate({
      name: 'my-app',
      template: 'test/template',
      targetDir: './custom-dir',
    });

    // Verify that degit was called with correct parameters
    const degit = await import('degit');
    expect(degit.default).toHaveBeenCalledWith('test/template', {
      cache: false,
      force: false,
    });
  });
});
