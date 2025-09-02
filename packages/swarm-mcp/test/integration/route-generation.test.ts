import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockFileSystemTools } from './mock-filesystem.js';
import {
    mockSwarmFunctions,
    resetSwarmMocks,
    setSwarmError,
    setupSwarmMocks,
} from './mock-swarm-functions.js';
import { IntegrationTestEnvironment } from './setup.js';
import { IntegrationValidator } from './validator.js';

// Mock the Swarm functions before importing them
mockSwarmFunctions();

import { realFileSystem } from '@ingenyus/swarm-cli/dist/utils/filesystem.js';
import { realLogger } from '@ingenyus/swarm-cli/dist/utils/logger.js';
import { SwarmTools } from '../../src/server/tools/swarm.js';

describe('Route Generation Integration Tests', () => {
  let testEnv: IntegrationTestEnvironment;
  let validator: IntegrationValidator;
  let mockSwarm: any;
  let swarmTools: SwarmTools;

  beforeAll(() => {
    swarmTools = SwarmTools.create(realLogger, realFileSystem);
  });

beforeEach(async () => {
    testEnv = new IntegrationTestEnvironment();
    validator = new IntegrationValidator(testEnv);
    mockSwarmFunctions();
    mockSwarm = await setupSwarmMocks();
    mockFileSystemTools(testEnv);

    await testEnv.setup('withEntities');
  });

  afterEach(async () => {
    await testEnv.teardown();
    resetSwarmMocks(mockSwarm);
  });

  describe('Basic Route Generation', () => {
    it('should generate a simple route', async () => {
      const params = {
        name: 'HomePage',
        path: '/',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });

    it('should generate a route with force flag', async () => {
      const params = {
        name: 'UserProfile',
        path: '/profile',
        force: true,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });
  });

  describe('Route Paths', () => {
    it('should generate routes with simple paths', async () => {
      const paths = ['/', '/about', '/contact', '/help'];

      for (const path of paths) {
        const params = {
          name: `Route${path.replace('/', '').charAt(0).toUpperCase() + path.replace('/', '').slice(1)}`,
          path,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });

    it('should generate routes with dynamic paths', async () => {
      const dynamicPaths = [
        '/users/:id',
        '/posts/:slug',
        '/products/:category/:id',
        '/blog/:year/:month/:day/:slug',
      ];

      for (const path of dynamicPaths) {
        const routeName = path.split('/').pop()?.replace(':', '') || '';
        const capitalizedName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
        const params = {
          name: `DynamicRoute${capitalizedName}`,
          path,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });

    it('should generate nested routes', async () => {
      const nestedPaths = [
        '/admin/users',
        '/admin/users/:id',
        '/admin/users/:id/edit',
        '/admin/users/:id/permissions',
      ];

      for (const path of nestedPaths) {
        const routeName = path.split('/').pop()?.replace(':', '') || '';
        const capitalizedName = routeName.charAt(0).toUpperCase() + routeName.slice(1);
        const params = {
          name: `Admin${capitalizedName}`,
          path,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });
  });

  describe('Route Names', () => {
    it('should generate routes with descriptive names', async () => {
      const routeConfigs = [
        { name: 'UserDashboard', path: '/dashboard' },
        { name: 'ProductCatalog', path: '/products' },
        { name: 'OrderHistory', path: '/orders' },
        { name: 'SettingsPage', path: '/settings' },
      ];

      for (const config of routeConfigs) {
        const params = {
          name: config.name,
          path: config.path,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });

    it('should handle route names with special characters', async () => {
      const params = {
        name: 'User_Profile_Page',
        path: '/user-profile',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });
  });

  describe('Authentication Integration', () => {
    it('should generate authenticated routes', async () => {
      const params = {
        name: 'ProtectedPage',
        path: '/protected',
        auth: true,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });

    it('should generate public routes', async () => {
      const params = {
        name: 'PublicPage',
        path: '/public',
        auth: false,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });

    it('should generate mixed authentication routes', async () => {
      const routes = [
        { name: 'PublicHome', path: '/', auth: false },
        { name: 'PrivateDashboard', path: '/dashboard', auth: true },
        { name: 'PublicAbout', path: '/about', auth: false },
        { name: 'PrivateProfile', path: '/profile', auth: true },
      ];

      for (const route of routes) {
        const params = {
          name: route.name,
          path: route.path,
          auth: route.auth,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });
  });

  describe('Complex Route Scenarios', () => {
    it('should generate e-commerce route structure', async () => {
      const ecommerceRoutes = [
        { name: 'ProductList', path: '/products' },
        { name: 'ProductDetail', path: '/products/:id' },
        { name: 'ShoppingCart', path: '/cart', auth: true },
        { name: 'Checkout', path: '/checkout', auth: true },
        {
          name: 'OrderConfirmation',
          path: '/order/:id/confirmation',
          auth: true,
        },
      ];

      for (const route of ecommerceRoutes) {
        const params = {
          name: route.name,
          path: route.path,
          auth: route.auth || false,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });

    it('should generate admin panel route structure', async () => {
      const adminRoutes = [
        { name: 'AdminDashboard', path: '/admin', auth: true },
        { name: 'UserManagement', path: '/admin/users', auth: true },
        { name: 'UserEdit', path: '/admin/users/:id/edit', auth: true },
        { name: 'SystemSettings', path: '/admin/settings', auth: true },
        { name: 'Analytics', path: '/admin/analytics', auth: true },
      ];

      for (const route of adminRoutes) {
        const params = {
          name: route.name,
          path: route.path,
          auth: route.auth,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });

    it('should generate blog route structure', async () => {
      const blogRoutes = [
        { name: 'BlogIndex', path: '/blog' },
        { name: 'BlogPost', path: '/blog/:slug' },
        { name: 'BlogCategory', path: '/blog/category/:category' },
        { name: 'BlogAuthor', path: '/blog/author/:author' },
        { name: 'BlogSearch', path: '/blog/search' },
      ];

      for (const route of blogRoutes) {
        const params = {
          name: route.name,
          path: route.path,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });
  });

  describe('Force Override', () => {
    it('should generate routes with force flag', async () => {
      const params = {
        name: 'OverriddenRoute',
        path: '/overridden',
        force: true,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });

    it('should handle routes without force flag', async () => {
      const params = {
        name: 'NormalRoute',
        path: '/normal',
        force: false,
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
      expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
    });
  });

  describe('Error Handling', () => {
    it('should handle route generation errors gracefully', async () => {
      setSwarmError(mockSwarm, 'generateRoute', 'Route generation failed');

      const params = {
        name: 'ErrorRoute',
        path: '/error',
        projectPath: testEnv.tempProjectDir,
      };

      await expect(swarmTools.generateRoute(params)).rejects.toThrow(
        'Route generation failed'
      );
    });

    it('should handle invalid path formats', async () => {
      const params = {
        name: 'InvalidRoute',
        path: 'invalid-path-without-slash',
        projectPath: testEnv.tempProjectDir,
      };

      // This would be handled by the Swarm CLI validation
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
    });
  });

  describe('Project Integration', () => {
    it('should work with different project templates', async () => {
      await testEnv.teardown();
      await testEnv.setup('minimal');

      const params = {
        name: 'MinimalRoute',
        path: '/minimal',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
    });

    it('should work with projects containing entities', async () => {
      await testEnv.teardown();
      await testEnv.setup('withEntities');

      const params = {
        name: 'EntityRoute',
        path: '/entities',
        projectPath: testEnv.tempProjectDir,
      };
      const result = await swarmTools.generateRoute(params);

      expect(result.success).toBe(true);
      expect(result.output).toContain('Route generated successfully');
    });
  });

  describe('Navigation Structure', () => {
    it('should generate routes for complete navigation flow', async () => {
      const navigationFlow = [
        { name: 'LandingPage', path: '/', auth: false },
        { name: 'LoginPage', path: '/login', auth: false },
        { name: 'RegisterPage', path: '/register', auth: false },
        { name: 'Dashboard', path: '/dashboard', auth: true },
        { name: 'ProfilePage', path: '/profile', auth: true },
        { name: 'SettingsPage', path: '/settings', auth: true },
        { name: 'LogoutPage', path: '/logout', auth: true },
      ];

      for (const route of navigationFlow) {
        const params = {
          name: route.name,
          path: route.path,
          auth: route.auth,
          projectPath: testEnv.tempProjectDir,
        };
        const result = await swarmTools.generateRoute(params);

        expect(result.success).toBe(true);
        expect(mockSwarm.mockSwarmToolsInstance.generateRoute).toHaveBeenCalledWith(params);
      }
    });
  });
});
