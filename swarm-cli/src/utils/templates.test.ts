import { describe, expect, it } from 'vitest';
import * as templates from './templates';

describe('templates utils', () => {
  it('processTemplate replaces placeholders', () => {
    const template = 'Hello, {{name}}!';
    const result = templates.processTemplate(template, { name: 'World' });
    expect(result).toBe('Hello, World!');
  });

  // Add more tests for getFileTemplatePath, getConfigTemplatePath as needed
}); 