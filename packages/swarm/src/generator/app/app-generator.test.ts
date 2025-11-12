import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FileSystem, toFriendlyName, validateProjectName } from '../../common';
import {
  Generator,
  GeneratorProvider,
  GeneratorServices,
  getGeneratorServices,
} from '../index';
import { AppGenerator } from './app-generator';

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
  };
}

function createMockFS(): FileSystem {
  const mockFS = {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    copyFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
  } as any;
  Object.keys(mockFS).forEach((key) => {
    if (typeof mockFS[key] === 'function' && !vi.isMockFunction(mockFS[key])) {
      mockFS[key] = vi.fn();
    }
  });
  return mockFS as FileSystem;
}

describe('AppGenerator', () => {
  let fs: any;
  let logger: any;
  let gen: AppGenerator;
  const appProvider: GeneratorProvider = {
    create: (services: GeneratorServices): Generator<any> =>
      new AppGenerator(services),
  };

  beforeEach(async () => {
    fs = createMockFS();
    logger = createMockLogger();
    vi.spyOn(path, 'resolve').mockImplementation((...args) => args.join('/'));
    const services = getGeneratorServices('test', logger, { fileSystem: fs });
    gen = (await appProvider.create(services)) as AppGenerator;
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
    const testFs = createMockFS();
    testFs.existsSync = vi.fn().mockReturnValue(true);
    const services = getGeneratorServices('test', logger, {
      fileSystem: testFs,
    });
    const testGen = (await appProvider.create(services)) as AppGenerator;
    await expect(
      testGen.generate({ name: 'existing-app', template: 'test/template' })
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

  it('should discover and process files with supported extensions', async () => {
    fs.existsSync.mockReturnValue(false);
    fs.readFileSync.mockReturnValue('swarm-wasp-starter content');
    fs.writeFileSync.mockImplementation(() => {});

    await gen.generate({ name: 'my-app', template: 'test/template' });

    // Verify that degit was called with correct parameters
    const degit = await import('degit');
    expect(degit.default).toHaveBeenCalledWith('test/template', {
      cache: false,
      force: false,
    });
  });

  describe('findFilesToReplace', () => {
    it('should find files with supported extensions', async () => {
      const testFs = createMockFS();
      testFs.existsSync = vi.fn().mockReturnValue(true);
      testFs.readdirSync = vi.fn().mockReturnValue([
        { name: 'package.json', isDirectory: () => false, isFile: () => true },
        { name: 'main.ts', isDirectory: () => false, isFile: () => true },
        { name: 'component.tsx', isDirectory: () => false, isFile: () => true },
        { name: 'README.md', isDirectory: () => false, isFile: () => true },
      ]);
      const services = getGeneratorServices('test', logger, {
        fileSystem: testFs,
      });
      const testGen = (await appProvider.create(services)) as AppGenerator;

      const files = await testGen.findFilesToReplace('/test/project');

      expect(files).toHaveLength(3);
      expect(files).toContain('/test/project/package.json');
      expect(files).toContain('/test/project/main.ts');
      expect(files).toContain('/test/project/component.tsx');
      expect(files).not.toContain('/test/project/README.md');
    });

    it('should recursively search subdirectories', async () => {
      const testFs = createMockFS();
      testFs.existsSync = vi.fn().mockReturnValue(true);
      testFs.readdirSync = vi.fn().mockImplementation((dirPath: string) => {
        if (dirPath.endsWith('project')) {
          return [
            { name: 'src', isDirectory: () => true, isFile: () => false },
            {
              name: 'package.json',
              isDirectory: () => false,
              isFile: () => true,
            },
          ];
        } else if (dirPath.endsWith('src')) {
          return [
            {
              name: 'components',
              isDirectory: () => true,
              isFile: () => false,
            },
            { name: 'utils.ts', isDirectory: () => false, isFile: () => true },
          ];
        } else if (dirPath.endsWith('components')) {
          return [
            {
              name: 'Button.tsx',
              isDirectory: () => false,
              isFile: () => true,
            },
            {
              name: 'config.json',
              isDirectory: () => false,
              isFile: () => true,
            },
          ];
        }
        return [];
      });
      const services = getGeneratorServices('test', logger, {
        fileSystem: testFs,
      });
      const testGen = (await appProvider.create(services)) as AppGenerator;

      const files = await testGen.findFilesToReplace('/test/project');

      expect(files).toHaveLength(4);
      expect(files).toContain('/test/project/package.json');
      expect(files).toContain('/test/project/src/utils.ts');
      expect(files).toContain('/test/project/src/components/Button.tsx');
      expect(files).toContain('/test/project/src/components/config.json');
    });

    it('should skip common directories that should not be processed', async () => {
      const testFs = createMockFS();
      testFs.existsSync = vi.fn().mockImplementation((path: string) => {
        // Only return true for the main project directory, not subdirectories
        return path === '/test/project';
      });

      testFs.readdirSync = vi.fn().mockReturnValue([
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: '.git', isDirectory: () => true, isFile: () => false },
        { name: 'dist', isDirectory: () => true, isFile: () => false },
        { name: 'package.json', isDirectory: () => false, isFile: () => true },
      ]);
      const services = getGeneratorServices('test', logger, {
        fileSystem: testFs,
      });
      const testGen = (await appProvider.create(services)) as AppGenerator;

      const files = await testGen.findFilesToReplace('/test/project');

      expect(files).toHaveLength(1);
      expect(files).toContain('/test/project/package.json');
    });

    it('should return empty array if directory does not exist', async () => {
      const testFs = createMockFS();
      testFs.existsSync = vi.fn().mockReturnValue(false);
      const services = getGeneratorServices('test', logger, {
        fileSystem: testFs,
      });
      const testGen = (await appProvider.create(services)) as AppGenerator;

      const files = await testGen.findFilesToReplace('/nonexistent/project');

      expect(files).toHaveLength(0);
    });
  });

  describe('replaceInFile', () => {
    it('should replace placeholders in file content', async () => {
      const testFs = createMockFS();
      testFs.readFileSync = vi
        .fn()
        .mockReturnValue('swarm-wasp-starter content');
      testFs.writeFileSync = vi.fn().mockImplementation(() => {});
      const services = getGeneratorServices('test', logger, {
        fileSystem: testFs,
      });
      const testGen = (await appProvider.create(services)) as AppGenerator;

      const context = {
        projectName: 'my-app',
        friendlyName: 'My App',
        pascalName: 'MyApp',
        kebabName: 'my-app',
      };

      await testGen.replaceInFile('/test/file.ts', context);

      expect(testFs.readFileSync).toHaveBeenCalledWith(
        '/test/file.ts',
        'utf-8'
      );
      expect(testFs.writeFileSync).toHaveBeenCalledWith(
        '/test/file.ts',
        'my-app content',
        'utf-8'
      );
    });
  });
});
