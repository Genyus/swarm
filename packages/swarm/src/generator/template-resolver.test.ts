import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CUSTOM_TEMPLATES_DIR, FileSystem } from '../common';
import { TemplateResolver } from './template-resolver';

// Mock file system
const mockFileSystem: FileSystem = {
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  copyFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(),
  statSync: vi.fn(),
};

describe('TemplateResolver', () => {
  let resolver: TemplateResolver;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new TemplateResolver(mockFileSystem);
  });

  describe('resolveTemplateWithOverride', () => {
    it('should return custom template path when custom template exists', () => {
      const pluginName = 'wasp';
      const generatorName = 'api';
      const templateName = 'api.eta';
      const builtInPath = '/built-in/path/api.eta';
      const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;

      // Mock custom template exists
      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi
        .fn()
        .mockReturnValue('<% console.log("test"); %>');

      const result = resolver.resolveTemplatePath(
        pluginName,
        generatorName,
        templateName,
        builtInPath,
        customTemplateDir
      );

      expect(result.isCustom).toBe(true);
      expect(result.path).toContain(
        `${DEFAULT_CUSTOM_TEMPLATES_DIR}/wasp/api/api.eta`
      );
      expect(mockFileSystem.existsSync).toHaveBeenCalledWith(
        expect.stringContaining(
          `${DEFAULT_CUSTOM_TEMPLATES_DIR}/wasp/api/api.eta`
        )
      );
    });

    it('should return built-in template path when custom template does not exist', () => {
      const pluginName = 'wasp';
      const generatorName = 'api';
      const templateName = 'api.eta';
      const builtInPath = '/built-in/path/api.eta';
      const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;

      // Mock custom template does not exist
      mockFileSystem.existsSync = vi.fn().mockReturnValue(false);

      const result = resolver.resolveTemplatePath(
        pluginName,
        generatorName,
        templateName,
        builtInPath,
        customTemplateDir
      );

      expect(result.isCustom).toBe(false);
      expect(result.path).toBe(builtInPath);
    });

    it('should use default template directory when not provided', () => {
      const pluginName = 'wasp';
      const generatorName = 'api';
      const templateName = 'api.eta';
      const builtInPath = '/built-in/path/api.eta';

      // Mock custom template exists
      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi
        .fn()
        .mockReturnValue('<% console.log("test"); %>');

      const result = resolver.resolveTemplatePath(
        pluginName,
        generatorName,
        templateName,
        builtInPath
      );

      expect(result.isCustom).toBe(true);
      expect(result.path).toContain(
        `${DEFAULT_CUSTOM_TEMPLATES_DIR}/wasp/api/api.eta`
      );
    });

    it('should handle nested template paths correctly', () => {
      const pluginName = 'wasp';
      const generatorName = 'api';
      const templateName = 'config/api.eta';
      const builtInPath = '/built-in/path/config/api.eta';
      const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;

      // Mock custom template exists
      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi
        .fn()
        .mockReturnValue('<% console.log("test"); %>');

      const result = resolver.resolveTemplatePath(
        pluginName,
        generatorName,
        templateName,
        builtInPath,
        customTemplateDir
      );

      expect(result.isCustom).toBe(true);
      expect(result.path).toContain(
        `${DEFAULT_CUSTOM_TEMPLATES_DIR}/wasp/api/config/api.eta`
      );
    });
  });

  describe('validateTemplate', () => {
    it('should validate template with correct Eta syntax', () => {
      const templatePath = '/path/to/template.eta';
      const validTemplate = '<% console.log("test"); %>';

      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi.fn().mockReturnValue(validTemplate);

      expect(() => resolver.validateTemplate(templatePath)).not.toThrow();
    });

    it('should throw error for template with unclosed tags', () => {
      const templatePath = '/path/to/template.eta';
      const invalidTemplate = '<% console.log("test"); %';

      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi.fn().mockReturnValue(invalidTemplate);

      expect(() => resolver.validateTemplate(templatePath)).toThrow(
        'Template has unclosed tags'
      );
    });

    it('should throw error for template with extra closing tags', () => {
      const templatePath = '/path/to/template.eta';
      const invalidTemplate = '<% console.log("test"); %> %>';

      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi.fn().mockReturnValue(invalidTemplate);

      expect(() => resolver.validateTemplate(templatePath)).toThrow(
        'Template has unclosed tags'
      );
    });

    it('should throw error when template file does not exist', () => {
      const templatePath = '/path/to/nonexistent.eta';

      mockFileSystem.existsSync = vi.fn().mockReturnValue(false);

      expect(() => resolver.validateTemplate(templatePath)).toThrow(
        'Template not found'
      );
    });

    it('should handle complex template with multiple tags', () => {
      const templatePath = '/path/to/template.eta';
      const complexTemplate = `
        <% if (user) { %>
          <h1>Hello <%= user.name %></h1>
        <% } else { %>
          <h1>Welcome</h1>
        <% } %>
      `;

      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi.fn().mockReturnValue(complexTemplate);

      expect(() => resolver.validateTemplate(templatePath)).not.toThrow();
    });

    it('should handle template with no tags', () => {
      const templatePath = '/path/to/template.eta';
      const plainTemplate = 'This is a plain template with no Eta tags.';

      mockFileSystem.existsSync = vi.fn().mockReturnValue(true);
      mockFileSystem.readFileSync = vi.fn().mockReturnValue(plainTemplate);

      expect(() => resolver.validateTemplate(templatePath)).not.toThrow();
    });
  });
});
