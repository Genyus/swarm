import { HttpMethod, OperationType } from '@ingenyus/swarm-core';
import { describe, expect, it } from 'vitest';
import {
  GenerateActionParamsSchema,
  GenerateApiParamsSchema,
  GenerateCrudParamsSchema,
  GenerateFeatureParamsSchema,
  GenerateJobParamsSchema,
  GenerateQueryParamsSchema,
  GenerateRouteParamsSchema,
  HttpMethodSchema,
  OperationTypeSchema,
  type GenerateApiParams,
} from './swarm.js';

describe('Swarm Types', () => {
  describe('Zod Schemas', () => {
    describe('HttpMethodSchema', () => {
      it('should validate correct HTTP methods', () => {
        const validMethods: HttpMethod[] = [
          'GET',
          'POST',
          'PUT',
          'DELETE',
          'ALL',
        ];
        validMethods.forEach(method => {
          expect(() => HttpMethodSchema.parse(method)).not.toThrow();
        });
      });

      it('should reject invalid HTTP methods', () => {
        const invalidMethods = ['PATCH', 'get', 'invalid', ''];
        invalidMethods.forEach(method => {
          expect(() => HttpMethodSchema.parse(method)).toThrow();
        });
      });
    });

    describe('OperationTypeSchema', () => {
      it('should validate correct operation types', () => {
        const validTypes: OperationType[] = ['query', 'action'];
        validTypes.forEach(type => {
          expect(() => OperationTypeSchema.parse(type)).not.toThrow();
        });
      });

      it('should reject invalid operation types', () => {
        const invalidTypes = ['mutation', 'subscription', ''];
        invalidTypes.forEach(type => {
          expect(() => OperationTypeSchema.parse(type)).toThrow();
        });
      });
    });

    describe('SwarmGenerateAPIParamsSchema', () => {
      it('should validate correct API generation parameters', () => {
        const validParams: GenerateApiParams = {
          name: 'UserAPI',
          feature: 'default',
          method: 'GET',
          route: '/api/users',
          entities: ['User'],
          auth: true,
          force: false,
        };
        expect(() => GenerateApiParamsSchema.parse(validParams)).not.toThrow();
      });

      it('should reject invalid API generation parameters', () => {
        const invalidParams = [
          { method: 'GET', route: '/api/users' }, // missing name
          { name: '', method: 'GET', route: '/api/users' }, // empty name
          { name: 'UserAPI', route: '/api/users' }, // missing method
          { name: 'UserAPI', method: 'INVALID', route: '/api/users' }, // invalid method
          { name: 'UserAPI', method: 'GET' }, // missing route
        ];

        invalidParams.forEach(params => {
          expect(() => GenerateApiParamsSchema.parse(params)).toThrow();
        });
      });
    });

    describe('SwarmGenerateFeatureParamsSchema', () => {
      it('should validate correct feature generation parameters', () => {
        const validParams = {
          name: 'UserManagement',
        };
        expect(() =>
          GenerateFeatureParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject parameters with empty name', () => {
        const invalidParams = {
          name: '',
        };
        expect(() =>
          GenerateFeatureParamsSchema.parse(invalidParams)
        ).toThrow();
      });
    });

    describe('SwarmGenerateCRUDParamsSchema', () => {
      it('should validate correct CRUD generation parameters', () => {
        const validParams = {
          feature: 'user-management',
          name: 'User', // Changed from dataType to name
          public: ['create', 'get'],
          override: ['update'],
          exclude: ['delete'],
          force: true,
        };
        expect(() => GenerateCrudParamsSchema.parse(validParams)).not.toThrow();
      });

      it('should reject parameters with empty name', () => {
        const invalidParams = {
          name: '', // Changed from dataType to name
        };
        expect(() => GenerateCrudParamsSchema.parse(invalidParams)).toThrow();
      });
    });

    describe('SwarmGenerateJobParamsSchema', () => {
      it('should validate correct job generation parameters', () => {
        const validParams = {
          feature: 'maintenance',
          name: 'EmailSender',
          cron: '0 */6 * * *', // Changed from schedule to cron
          args: '{"retryLimit": 3}', // Changed from scheduleArgs to args
          entities: ['Email'],
          force: false,
        };
        expect(() => GenerateJobParamsSchema.parse(validParams)).not.toThrow();
      });
    });

    describe('SwarmGenerateActionParamsSchema', () => {
      it('should validate correct action generation parameters', () => {
        const validParams = {
          feature: 'UserManagement',
          operation: 'create' as const,
          dataType: 'User',
          entities: ['User'],
          auth: true,
          force: false,
        };
        expect(() =>
          GenerateActionParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject invalid action operation types', () => {
        const invalidParams = {
          feature: 'UserManagement',
          operation: 'get', // get is not a valid action operation
          dataType: 'User',
        };
        expect(() => GenerateActionParamsSchema.parse(invalidParams)).toThrow();
      });
    });

    describe('SwarmGenerateQueryParamsSchema', () => {
      it('should validate correct query generation parameters', () => {
        const validParams = {
          feature: 'UserManagement',
          operation: 'get' as const,
          dataType: 'User',
          entities: ['User'],
          auth: true,
          force: false,
        };
        expect(() =>
          GenerateQueryParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject invalid query operation types', () => {
        const invalidParams = {
          feature: 'UserManagement',
          operation: 'create', // create is not a valid query operation
          dataType: 'User',
        };
        expect(() => GenerateQueryParamsSchema.parse(invalidParams)).toThrow();
      });
    });

    describe('SwarmGenerateRouteParamsSchema', () => {
      it('should validate correct route generation parameters', () => {
        const validParams = {
          feature: 'ui',
          name: 'UserDashboard',
          path: '/dashboard/users',
          auth: true,
          force: false,
        };
        expect(() =>
          GenerateRouteParamsSchema.parse(validParams)
        ).not.toThrow();
      });
    });
  });
});
