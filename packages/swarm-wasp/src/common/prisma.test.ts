import { describe, expect, it } from 'vitest';
import type { EntityMetadata } from './prisma';
import * as prisma from './prisma';

describe('prisma utils', () => {
  const mockModel: EntityMetadata = {
    name: 'User',
    fields: [
      {
        name: 'id',
        type: 'Int',
        tsType: 'number',
        isRequired: true,
        isId: true,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: true,
      },
      {
        name: 'profile',
        type: 'Json',
        tsType: 'Prisma.JsonValue',
        isRequired: false,
        isId: false,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
      {
        name: 'name',
        type: 'String',
        tsType: 'string',
        isRequired: true,
        isId: false,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
    ],
  };

  const mockCompositeKeyModel: EntityMetadata = {
    name: 'UserProject',
    fields: [
      {
        name: 'userId',
        type: 'Int',
        tsType: 'number',
        isRequired: true,
        isId: true,
        isUnique: false,
        isGenerated: true,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
      {
        name: 'projectId',
        type: 'Int',
        tsType: 'number',
        isRequired: true,
        isId: true,
        isUnique: false,
        isGenerated: true,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
      {
        name: 'assignedAt',
        type: 'DateTime',
        tsType: 'Date',
        isRequired: true,
        isId: false,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
    ],
  };

  const mockCompositeExplicitKeyModel: EntityMetadata = {
    name: 'UserProject',
    fields: [
      {
        name: 'userId',
        type: 'Int',
        tsType: 'number',
        isRequired: true,
        isId: true,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
      {
        name: 'projectId',
        type: 'Int',
        tsType: 'number',
        isRequired: true,
        isId: true,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
      {
        name: 'assignedAt',
        type: 'DateTime',
        tsType: 'Date',
        isRequired: true,
        isId: false,
        isUnique: false,
        isGenerated: false,
        isUpdatedAt: false,
        hasDefaultValue: false,
      },
    ],
  };

  describe('field helper functions', () => {
    it('getIdFields returns array of id field names', () => {
      expect(prisma.getIdFields(mockModel)).toEqual(['id']);
    });

    it('getIdFields supports composite primary keys', () => {
      expect(prisma.getIdFields(mockCompositeKeyModel)).toEqual([
        'userId',
        'projectId',
      ]);
    });

    it('getRequiredFields returns required fields without defaults', () => {
      expect(prisma.getRequiredFields(mockModel)).toEqual(['name']);
    });

    it('getRequiredFields excludes generated composite key fields', () => {
      expect(prisma.getRequiredFields(mockCompositeKeyModel)).toEqual([
        'assignedAt',
      ]);
    });

    it('getRequiredFields includes explicit composite key fields', () => {
      expect(prisma.getRequiredFields(mockCompositeExplicitKeyModel)).toEqual([
        'userId',
        'projectId',
        'assignedAt',
      ]);
    });

    it('getOptionalFields returns array of optional field names', () => {
      expect(prisma.getOptionalFields(mockModel)).toEqual(['profile']);
    });

    it('getJsonFields returns json fields', () => {
      expect(prisma.getJsonFields(mockModel)).toEqual(['profile']);
    });
  });

  describe('type generation helpers', () => {
    const allFields = ['id', 'name', 'profile'];
    const allCompositeFields = ['userId', 'projectId', 'assignedAt'];

    describe('generatePickType', () => {
      it('returns empty string when fields array is empty', () => {
        expect(prisma.generatePickType('User', [], allFields)).toBe('');
      });

      it('returns model name when all fields are picked', () => {
        expect(prisma.generatePickType('User', allFields, allFields)).toBe(
          'User'
        );
      });

      it('returns Pick type for subset of fields', () => {
        expect(prisma.generatePickType('User', ['id', 'name'], allFields)).toBe(
          'Pick<User, "id" | "name">'
        );
      });

      it('handles single field', () => {
        expect(prisma.generatePickType('User', ['id'], allFields)).toBe(
          'Pick<User, "id">'
        );
      });

      it('handles composite key fields', () => {
        expect(
          prisma.generatePickType(
            'UserProject',
            ['userId', 'projectId'],
            allCompositeFields
          )
        ).toBe('Pick<UserProject, "userId" | "projectId">');
      });
    });

    describe('generateOmitType', () => {
      it('returns model name when fields array is empty', () => {
        expect(prisma.generateOmitType('User', [], allFields)).toBe('User');
      });

      it('returns empty string when all fields are omitted', () => {
        expect(prisma.generateOmitType('User', allFields, allFields)).toBe('');
      });

      it('returns Omit type for subset of fields', () => {
        expect(prisma.generateOmitType('User', ['id'], allFields)).toBe(
          'Omit<User, "id">'
        );
      });

      it('handles multiple fields', () => {
        expect(
          prisma.generateOmitType('User', ['id', 'profile'], allFields)
        ).toBe('Omit<User, "id" | "profile">');
      });
    });

    describe('generatePartialType', () => {
      it('returns empty string for empty input', () => {
        expect(prisma.generatePartialType('')).toBe('');
      });

      it('wraps type in Partial', () => {
        expect(prisma.generatePartialType('User')).toBe('Partial<User>');
      });

      it('wraps complex type in Partial', () => {
        expect(prisma.generatePartialType('Pick<User, "id">')).toBe(
          'Partial<Pick<User, "id">>'
        );
      });
    });

    describe('generateIntersectionType', () => {
      it('returns empty string when both types are empty', () => {
        expect(prisma.generateIntersectionType('', '')).toBe('');
      });

      it('returns type1 when type2 is empty', () => {
        expect(prisma.generateIntersectionType('User', '')).toBe('User');
      });

      it('returns type2 when type1 is empty', () => {
        expect(prisma.generateIntersectionType('', 'Profile')).toBe('Profile');
      });

      it('returns intersection when both types are present', () => {
        expect(prisma.generateIntersectionType('User', 'Profile')).toBe(
          'User & Profile'
        );
      });

      it('handles complex types', () => {
        expect(
          prisma.generateIntersectionType('Pick<User, "id">', 'Partial<User>')
        ).toBe('Pick<User, "id"> & Partial<User>');
      });
    });
  });
});
