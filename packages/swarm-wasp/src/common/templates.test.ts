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
    beforeEach(() => {
      // Mock the file system to simulate template files
      mockFileSystem.existsSync = vi.fn().mockImplementation((path: string) => {
        // Return false for test templates to force renderString usage
        return (
          !path.includes('test-template') &&
          !path.includes('multi-template') &&
          !path.includes('repeat-template') &&
          !path.includes('empty-template') &&
          !path.includes('no-placeholders')
        );
      });

      mockFileSystem.readFileSync = vi
        .fn()
        .mockImplementation((path: string) => {
          if (path.includes('test-template.eta')) {
            return 'Hello, <%=name%>!';
          }
          if (path.includes('multi-template.eta')) {
            return 'Hello <%=name%>, you are <%=age%> years old!';
          }
          if (path.includes('repeat-template.eta')) {
            return '<%=name%> is <%=name%> and <%=name%> is great!';
          }
          if (path.includes('empty-template.eta')) {
            return 'Hello, <%=name%>!';
          }
          if (path.includes('no-placeholders.eta')) {
            return 'Hello, World!';
          }
          return '';
        });
    });

    it('replaces single placeholder', () => {
      const result = templateUtility.processTemplate('test-template.eta', {
        name: 'World',
      });
      expect(result).toBe('Hello, World!');
    });

    it('replaces multiple placeholders', () => {
      const result = templateUtility.processTemplate('multi-template.eta', {
        name: 'John',
        age: '25',
      });
      expect(result).toBe('Hello John, you are 25 years old!');
    });

    it('replaces multiple occurrences of the same placeholder', () => {
      const result = templateUtility.processTemplate('repeat-template.eta', {
        name: 'John',
      });
      expect(result).toBe('John is John and John is great!');
    });

    it('throws error for empty replacements object', () => {
      expect(() =>
        templateUtility.processTemplate('empty-template.eta', {})
      ).toThrow('name is not defined');
    });

    it('handles template with no placeholders', () => {
      const result = templateUtility.processTemplate('no-placeholders.eta', {
        name: 'John',
      });
      expect(result).toBe('Hello, World!');
    });
  });
});
