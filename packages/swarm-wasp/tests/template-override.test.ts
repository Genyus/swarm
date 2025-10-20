import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CUSTOM_TEMPLATES_DIR,
  SignaleLogger,
} from '@ingenyus/swarm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiGenerator, FeatureGenerator } from '../src';
import { realFileSystem } from '../src/common';
import {
  createTestWaspProject,
  readGeneratedFile,
  type TestProjectPaths,
} from './utils';

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

  it('should use custom template when it exists', async () => {
    const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;
    const customApiTemplatePath = path.join(
      projectPaths.root,
      customTemplateDir,
      'wasp',
      'api',
      'api.eta'
    );
    const customConfigTemplatePath = path.join(
      projectPaths.root,
      customTemplateDir,
      'wasp',
      'api',
      'config',
      'api.eta'
    );

    fs.mkdirSync(path.dirname(customApiTemplatePath), { recursive: true });
    fs.mkdirSync(path.dirname(customConfigTemplatePath), { recursive: true });
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
    fs.writeFileSync(
      customConfigTemplatePath,
      `    .addApi(feature, "<%=apiName%>", {
      method: "<%=method%>",
      route: "<%=route%>",
<%- if (entities) { %>
      entities: [<%=entities%>],
<%- } %>
      auth: <%=auth%>,
<%- if (customMiddleware === 'true') { %>
      customMiddleware: true,
<%- } %>
      // Custom config template feature
      customFeature: true,
    })
`
    );

    const swarmConfig = {
      templateDirectory: customTemplateDir,
      plugins: {
        wasp: {
          enabled: true,
          plugin: 'wasp',
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );

    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'customApi',
      method: 'GET',
      route: '/api/posts/custom',
      entities: ['Post'],
      auth: false,
      force: true,
    });

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/customApi.ts'
    );

    expect(apiContent).toContain('// CUSTOM API TEMPLATE');
    expect(apiContent).toContain('Custom API: customApi');
    expect(apiContent).toContain('Custom implementation');

    const configContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/posts.wasp.ts'
    );

    expect(configContent).toContain('customFeature: true');
    expect(configContent).toContain('customApi');
  });

  it('should fall back to built-in template when custom does not exist', async () => {
    const swarmConfig = {
      templateDirectory: DEFAULT_CUSTOM_TEMPLATES_DIR,
      plugins: {
        wasp: {
          enabled: true,
          plugin: 'wasp',
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );

    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'builtInApi',
      method: 'POST',
      route: '/api/posts',
      entities: ['Post'],
      auth: true,
      force: true,
    });

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/builtInApi.ts'
    );

    expect(apiContent).not.toContain('// CUSTOM API TEMPLATE');
    expect(apiContent).toContain('export const builtInApi: BuiltInApi = async');
    expect(apiContent).toContain('import { HttpError } from "wasp/server"');

    const configContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/posts.wasp.ts'
    );

    expect(configContent).not.toContain('customFeature: true');
    expect(configContent).toContain('builtInApi');
  });

  it('should handle nested template paths correctly', async () => {
    const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;
    const customConfigTemplatePath = path.join(
      projectPaths.root,
      customTemplateDir,
      'wasp',
      'api',
      'config',
      'api.eta'
    );

    fs.mkdirSync(path.dirname(customConfigTemplatePath), { recursive: true });
    fs.writeFileSync(
      customConfigTemplatePath,
      `    .addApi(feature, "<%=apiName%>", {
      method: "<%=method%>",
      route: "<%=route%>",
<%- if (entities) { %>
      entities: [<%=entities%>],
<%- } %>
      auth: <%=auth%>,
<%- if (customMiddleware === 'true') { %>
      customMiddleware: true,
<%- } %>
      // Custom nested template feature
      customFeature: true,
    })
`
    );

    const swarmConfig = {
      templateDirectory: customTemplateDir,
      plugins: {
        wasp: {
          enabled: true,
          plugin: 'wasp',
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );

    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'nestedApi',
      method: 'PUT',
      route: '/api/posts/nested',
      entities: ['Post'],
      auth: false,
      force: true,
    });

    const configContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/posts.wasp.ts'
    );

    expect(configContent).toContain('customFeature: true');
    expect(configContent).toContain('nestedApi');
  });

  it('should validate custom template syntax and throw error for invalid templates', async () => {
    const customTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;
    const customApiTemplatePath = path.join(
      projectPaths.root,
      customTemplateDir,
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
<%=authCheck%><%=methodCheck%>  <% if (auth) { %>
    // Missing closing tag
  res.json({ message: 'Invalid template' });
};
`
    );

    const swarmConfig = {
      templateDirectory: customTemplateDir,
      plugins: {
        wasp: {
          enabled: true,
          plugin: 'wasp',
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );

    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await expect(
      apiGen.generate({
        feature: 'posts',
        name: 'invalidApi',
        method: 'GET',
        route: '/api/posts/invalid',
        entities: ['Post'],
        auth: false,
        force: true,
      })
    ).rejects.toThrow('Bad template syntax');
  });

  it('should use default template directory when not specified in config', async () => {
    const defaultTemplateDir = DEFAULT_CUSTOM_TEMPLATES_DIR;
    const customApiTemplatePath = path.join(
      projectPaths.root,
      defaultTemplateDir,
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

    const swarmConfig = {
      plugins: {
        wasp: {
          enabled: true,
          plugin: 'wasp',
        },
      },
    };

    fs.writeFileSync(
      path.join(projectPaths.root, DEFAULT_CONFIG_FILE),
      JSON.stringify(swarmConfig, null, 2)
    );

    const logger = new SignaleLogger();
    const featureGen = new FeatureGenerator(logger, realFileSystem);
    const apiGen = new ApiGenerator(logger, realFileSystem, featureGen);

    await featureGen.generate({ path: 'posts' });
    await apiGen.generate({
      feature: 'posts',
      name: 'defaultApi',
      method: 'DELETE',
      route: '/api/posts/default',
      entities: ['Post'],
      auth: false,
      force: true,
    });

    const apiContent = readGeneratedFile(
      projectPaths.root,
      'src/features/posts/server/apis/defaultApi.ts'
    );

    expect(apiContent).toContain('// DEFAULT LOCATION TEMPLATE');
    expect(apiContent).toContain('Default location template: defaultApi');
  });
});
