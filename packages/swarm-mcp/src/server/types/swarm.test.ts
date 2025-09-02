import { describe, expect, it } from 'vitest';
import {
  HttpMethodSchema,
  OperationTypeSchema,
  SwarmGenerateApiParamsSchema,
  SwarmGenerateCrudParamsSchema,
  SwarmGenerateFeatureParamsSchema,
  SwarmGenerateJobParamsSchema,
  SwarmGenerateOperationParamsSchema,
  SwarmGenerateRouteParamsSchema,
  isActionOperation,
  isHttpMethod,
  isOperationType,
  isQueryOperation,
  isSwarmError,
  type HttpMethod,
  type OperationType,
  type SwarmError,
  type SwarmGenerateApiParams,
} from './swarm.js';

describe('Swarm Types', () => {
  describe('Type Guards', () => {
    describe('isHttpMethod', () => {
      it('should return true for valid HTTP methods', () => {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'ALL'];
        validMethods.forEach(method => {
          expect(isHttpMethod(method)).toBe(true);
        });
      });

      it('should return false for invalid HTTP methods', () => {
        const invalidMethods = ['PATCH', 'HEAD', 'OPTIONS', '', 'get', 'post'];
        invalidMethods.forEach(method => {
          expect(isHttpMethod(method)).toBe(false);
        });
      });
    });

    describe('isOperationType', () => {
      it('should return true for valid operation types', () => {
        expect(isOperationType('query')).toBe(true);
        expect(isOperationType('action')).toBe(true);
      });

      it('should return false for invalid operation types', () => {
        expect(isOperationType('mutation')).toBe(false);
        expect(isOperationType('subscription')).toBe(false);
        expect(isOperationType('')).toBe(false);
      });
    });

    describe('isActionOperation', () => {
      it('should return true for valid action operations', () => {
        const validActions = ['create', 'update', 'delete'];
        validActions.forEach(action => {
          expect(isActionOperation(action)).toBe(true);
        });
      });

      it('should return false for invalid action operations', () => {
        expect(isActionOperation('get')).toBe(false);
        expect(isActionOperation('list')).toBe(false);
        expect(isActionOperation('')).toBe(false);
      });
    });

    describe('isQueryOperation', () => {
      it('should return true for valid query operations', () => {
        expect(isQueryOperation('get')).toBe(true);
        expect(isQueryOperation('getAll')).toBe(true);
      });

      it('should return false for invalid query operations', () => {
        expect(isQueryOperation('create')).toBe(false);
        expect(isQueryOperation('find')).toBe(false);
        expect(isQueryOperation('')).toBe(false);
      });
    });

    describe('isSwarmError', () => {
      it('should return true for valid SwarmError objects', () => {
        const validError: SwarmError = {
          type: 'validation',
          code: 'INVALID_PARAMS',
          message: 'Invalid parameters provided',
        };
        expect(isSwarmError(validError)).toBe(true);
      });

      it('should return false for invalid objects', () => {
        expect(isSwarmError(null)).toBe(false);
        expect(isSwarmError(undefined)).toBe(false);
        expect(isSwarmError('error')).toBe(false);
        expect(isSwarmError({ message: 'error' })).toBe(false);
        expect(isSwarmError({ type: 'validation' })).toBe(false);
      });
    });
  });

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
        const validParams: SwarmGenerateApiParams = {
          name: 'UserAPI',
          method: 'GET',
          route: '/api/users',
          entities: ['User'],
          auth: true,
          force: false,
        };
        expect(() =>
          SwarmGenerateApiParamsSchema.parse(validParams)
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
          expect(() => SwarmGenerateApiParamsSchema.parse(params)).toThrow();
        });
      });
    });

    describe('SwarmGenerateFeatureParamsSchema', () => {
      it('should validate correct feature generation parameters', () => {
        const validParams = {
          name: 'UserManagement',
          dataType: 'User',
          components: ['UserList', 'UserForm'],
          withTests: true,
          force: false,
        };
        expect(() =>
          SwarmGenerateFeatureParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject parameters with empty name', () => {
        const invalidParams = {
          name: '',
          dataType: 'User',
        };
        expect(() =>
          SwarmGenerateFeatureParamsSchema.parse(invalidParams)
        ).toThrow();
      });
    });

    describe('SwarmGenerateCRUDParamsSchema', () => {
      it('should validate correct CRUD generation parameters', () => {
        const validParams = {
          dataType: 'User',
          public: ['create', 'read'],
          override: ['update'],
          exclude: ['delete'],
          force: true,
        };
        expect(() =>
          SwarmGenerateCrudParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject parameters with empty dataType', () => {
        const invalidParams = {
          dataType: '',
        };
        expect(() =>
          SwarmGenerateCrudParamsSchema.parse(invalidParams)
        ).toThrow();
      });
    });

    describe('SwarmGenerateJobParamsSchema', () => {
      it('should validate correct job generation parameters', () => {
        const validParams = {
          name: 'EmailSender',
          schedule: '0 */6 * * *',
          scheduleArgs: '{"retryLimit": 3}',
          entities: ['Email'],
          force: false,
        };
        expect(() =>
          SwarmGenerateJobParamsSchema.parse(validParams)
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
          SwarmGenerateOperationParamsSchema.parse(validParams)
        ).not.toThrow();
      });

      it('should reject invalid operation types', () => {
        const invalidParams = {
          feature: 'UserManagement',
          operation: 'invalid',
          dataType: 'User',
        };
        expect(() =>
          SwarmGenerateOperationParamsSchema.parse(invalidParams)
        ).toThrow();
      });
    });

    describe('SwarmGenerateRouteParamsSchema', () => {
      it('should validate correct route generation parameters', () => {
        const validParams = {
          name: 'UserDashboard',
          path: '/dashboard/users',
          auth: true,
          force: false,
        };
        expect(() =>
          SwarmGenerateRouteParamsSchema.parse(validParams)
        ).not.toThrow();
      });
    });
  });
});
