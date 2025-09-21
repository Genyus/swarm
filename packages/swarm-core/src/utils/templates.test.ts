import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplateUtility } from './templates';

// Mock the filesystem module
vi.mock('./filesystem', () => ({
  getTemplatesDir: vi.fn().mockReturnValue('/mock/templates'),
}));

// Mock the strings module
vi.mock('./strings', () => ({
  getPlural: vi.fn().mockImplementation((str: string) => {
    if (str.endsWith('y')) {
      return `${str.slice(0, -1)}ies`;
    }
    if (str.endsWith('s')) {
      return `${str}es`;
    }
    return `${str}s`;
  }),
}));

describe('TemplateUtility', () => {
  let templateUtility: TemplateUtility;
  let mockFileSystem: {
    existsSync: ReturnType<typeof vi.fn>;
    readFileSync: ReturnType<typeof vi.fn>;
    writeFileSync: ReturnType<typeof vi.fn>;
    mkdirSync: ReturnType<typeof vi.fn>;
    copyFileSync: ReturnType<typeof vi.fn>;
    readdirSync: ReturnType<typeof vi.fn>;
    statSync: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockFileSystem = {
      existsSync: vi.fn(),
      readFileSync: vi.fn(),
      writeFileSync: vi.fn(),
      mkdirSync: vi.fn(),
      copyFileSync: vi.fn(),
      readdirSync: vi.fn(),
      statSync: vi.fn(),
    };
    templateUtility = new TemplateUtility(mockFileSystem);
  });

  describe('processTemplate', () => {
    it('replaces single placeholder', () => {
      const template = 'Hello, {{name}}!';
      const result = templateUtility.processTemplate(template, {
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('replaces multiple placeholders', () => {
      const template = 'Hello {{name}}, you are {{age}} years old!';
      const result = templateUtility.processTemplate(template, {
        name: 'John',
        age: '25',
      });
      expect(result).toBe('Hello John, you are 25 years old!');
    });

    it('replaces multiple occurrences of the same placeholder', () => {
      const template = '{{name}} is {{name}} and {{name}} is great!';
      const result = templateUtility.processTemplate(template, {
        name: 'John',
      });
      expect(result).toBe('John is John and John is great!');
    });

    it('handles empty replacements object', () => {
      const template = 'Hello, {{name}}!';
      const result = templateUtility.processTemplate(template, {});
      expect(result).toBe('Hello, {{name}}!');
    });

    it('handles template with no placeholders', () => {
      const template = 'Hello, World!';
      const result = templateUtility.processTemplate(template, {
        name: 'John',
      });
      expect(result).toBe('Hello, World!');
    });
  });

  describe('getFileTemplatePath', () => {
    it('returns correct path for client types', () => {
      const result = templateUtility.getFileTemplatePath('component');
      expect(result).toBe('/mock/templates/files/client/component.tsx');
    });

    it('returns correct path for server types', () => {
      const result = templateUtility.getFileTemplatePath('api');
      expect(result).toBe('/mock/templates/files/server/api.ts');
    });

    it('returns correct path for query with operation', () => {
      const result = templateUtility.getFileTemplatePath('query', 'getAll');
      expect(result).toBe('/mock/templates/files/server/queries/getAll.ts');
    });

    it('returns correct path for action with operation', () => {
      const result = templateUtility.getFileTemplatePath('action', 'create');
      expect(result).toBe('/mock/templates/files/server/actions/create.ts');
    });

    it('returns correct path for type', () => {
      const result = templateUtility.getFileTemplatePath('type');
      expect(result).toBe('/mock/templates/type.ts');
    });

    it('throws error for unknown file type', () => {
      expect(() => {
        templateUtility.getFileTemplatePath('unknown');
      }).toThrow('Unknown file type: unknown');
    });
  });

  describe('getConfigTemplatePath', () => {
    it('returns correct path for config template', () => {
      const result = templateUtility.getConfigTemplatePath('wasp');
      expect(result).toBe('/mock/templates/config/wasp.ts');
    });

    it('returns correct path for different config types', () => {
      const result = templateUtility.getConfigTemplatePath('operation');
      expect(result).toBe('/mock/templates/config/operation.ts');
    });
  });
});
