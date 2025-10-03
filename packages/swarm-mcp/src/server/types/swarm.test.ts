import { HttpMethod, OperationType } from '@ingenyus/swarm-core';
import { describe, expect, it } from 'vitest';
import {
  GenerateApiParamsSchema,
  GenerateCrudParamsSchema,
  GenerateFeatureParamsSchema,
  GenerateJobParamsSchema,
  GenerateOperationParamsSchema,
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
        expect(() =>
          GenerateApiParamsSchema.parse(validParams)
        ).not.toThrow();
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
          dataType: 'User',
          public: ['create', 'get'],
          override: ['update'],
          exclude: ['delete'],
          force: true,
        };
        expect(() =>
          GenerateCrudParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject parameters with empty dataType', () => {
        const invalidParams = {
          dataType: '',
        };
        expect(() =>
          GenerateCrudParamsSchema.parse(invalidParams)
        ).toThrow();
      });
    });

    describe('SwarmGenerateJobParamsSchema', () => {
      it('should validate correct job generation parameters', () => {
        const validParams = {
          feature: 'maintenance',
          name: 'EmailSender',
          schedule: '0 */6 * * *',
          scheduleArgs: '{"retryLimit": 3}',
          entities: ['Email'],
          force: false,
        };
        expect(() =>
          GenerateJobParamsSchema.parse(validParams)
        ).not.toThrow();
      });
    });

    describe('SwarmGenerateOperationParamsSchema', () => {
      it('should validate correct operation generation parameters', () => {
        const validParams = {
          feature: 'UserManagement',
          operation: 'create' as const,
          dataType: 'User',
          entities: ['User'],
          auth: true,
          force: false,
        };
        expect(() =>
          GenerateOperationParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject invalid operation types', () => {
        const invalidParams = {
          feature: 'UserManagement',
          operation: 'invalid',
          dataType: 'User',
        };
        expect(() =>
          GenerateOperationParamsSchema.parse(invalidParams)
        ).toThrow();
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
