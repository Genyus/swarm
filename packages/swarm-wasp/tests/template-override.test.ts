import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CUSTOM_TEMPLATES_DIR,
} from '@ingenyus/swarm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiGenerator, FeatureGenerator } from '../src';
import { realFileSystem } from '../src/common';
import { schema as apiSchema } from '../src/generators/api/schema';
import { schema as featureSchema } from '../src/generators/feature/schema';
import {
  createTestGenerator,
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

// Only the code-file templates (e.g. `api.eta`) are user-overridable. Config
// declarations are generated in code (not templated), so a custom config
// template has no effect.
describe('Template Override Integration Tests', () => {
  let projectPaths: TestProjectPaths;
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
    projectPaths = createTestWaspProject();
    process.chdir(projectPaths.root);
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  function writeSwarmConfig(templateDirectory?: string): void {
    const swarmConfig = {
      ...(templateDirectory ? { templateDirectory } : {}),
      plugins: { wasp: { enabled: true, plugin: 'wasp' } },
    };
    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );
  }

  async function generateApi(name: string, overrides = {}): Promise<void> {
    const featureGen = await createTestGenerator(
      FeatureGenerator,
      featureSchema,
      {
        fileSystem: realFileSystem,
      }
    );
    const apiGen = await createTestGenerator(ApiGenerator, apiSchema, {
      fileSystem: realFileSystem,
    });

    await featureGen.generate({ target: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name,
      method: 'GET',
      path: `/api/posts/${name}`,
      entities: ['Post'],
      auth: false,
      force: true,
      ...overrides,
    });
  }

  it('should use a custom code template when it exists', async () => {
    const customApiTemplatePath = path.join(
      projectPaths.root,
      DEFAULT_CUSTOM_TEMPLATES_DIR,
      'wasp',
      'api',
      'api.eta'
    );
    fs.mkdirSync(path.dirname(customApiTemplatePath), { recursive: true });
    fs.writeFileSync(
      customApiTemplatePath,
      `// CUSTOM API TEMPLATE
<%=imports%>

export const <%=apiName%>: <%=apiType%> = async (req, res, context) => {
<%=authCheck%><%=methodCheck%>  // Custom implementation
  res.json({ message: 'Custom API: <%=apiName%>' });
};
`
    );
    writeSwarmConfig(DEFAULT_CUSTOM_TEMPLATES_DIR);

    await generateApi('customApi');

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/customApi.ts'
    );
    expect(apiContent).toContain('// CUSTOM API TEMPLATE');
    expect(apiContent).toContain('Custom API: customApi');

    // The config declaration is always code-generated, regardless of templates.
    const configContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/feature.wasp.ts'
    );
    expect(configContent).toContain('api(');
    expect(configContent).toContain('customApi');
  });

  it('should fall back to the built-in template when no custom exists', async () => {
    writeSwarmConfig(DEFAULT_CUSTOM_TEMPLATES_DIR);

    await generateApi('builtInApi', { method: 'POST', auth: true });

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/builtInApi.ts'
    );
    expect(apiContent).not.toContain('// CUSTOM API TEMPLATE');
    expect(apiContent).toContain('export const builtInApi: BuiltInApi = async');
    expect(apiContent).toContain('import { HttpError } from "wasp/server"');
  });

  it('should throw for a custom template with invalid syntax', async () => {
    const customApiTemplatePath = path.join(
      projectPaths.root,
      DEFAULT_CUSTOM_TEMPLATES_DIR,
      'wasp',
      'api',
      'api.eta'
    );
    fs.mkdirSync(path.dirname(customApiTemplatePath), { recursive: true });
    fs.writeFileSync(
      customApiTemplatePath,
      `// INVALID TEMPLATE
<%=imports%>
export const <%=apiName%>: <%=apiType%> = async (req, res, context) => {
  <% if (auth) { %>
  // Missing closing tag
};
`
    );
    writeSwarmConfig(DEFAULT_CUSTOM_TEMPLATES_DIR);

    const featureGen = await createTestGenerator(
      FeatureGenerator,
      featureSchema,
      {
        fileSystem: realFileSystem,
      }
    );
    const apiGen = await createTestGenerator(ApiGenerator, apiSchema, {
      fileSystem: realFileSystem,
    });
    await featureGen.generate({ target: 'posts' });

    await expect(
      apiGen.generate({
        feature: 'posts',
        name: 'invalidApi',
        method: 'GET',
        path: '/api/posts/invalid',
        entities: ['Post'],
        auth: false,
        force: true,
      })
    ).rejects.toThrow('Bad template syntax');
  });

  it('should use the default template directory when not specified', async () => {
    const customApiTemplatePath = path.join(
      projectPaths.root,
      DEFAULT_CUSTOM_TEMPLATES_DIR,
      'wasp',
      'api',
      'api.eta'
    );
    fs.mkdirSync(path.dirname(customApiTemplatePath), { recursive: true });
    fs.writeFileSync(
      customApiTemplatePath,
      `// DEFAULT LOCATION TEMPLATE
<%=imports%>

export const <%=apiName%>: <%=apiType%> = async (req, res, context) => {
<%=authCheck%><%=methodCheck%>  res.json({ message: 'Default location template: <%=apiName%>' });
};
`
    );
    writeSwarmConfig();

    await generateApi('defaultApi', { method: 'DELETE' });

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/defaultApi.ts'
    );
    expect(apiContent).toContain('// DEFAULT LOCATION TEMPLATE');
    expect(apiContent).toContain('Default location template: defaultApi');
  });
});
