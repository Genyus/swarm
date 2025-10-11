import { describe, expect, it } from 'vitest';
import type { EntityMetadata } from '../types';
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

  it('getIdField returns the id field', () => {
    expect(prisma.getIdField(mockModel)).toEqual({
      name: 'id',
      tsType: 'number',
    });
  });

  it('getOmitFields returns correct omit fields', () => {
    expect(prisma.getOmitFields(mockModel)).toContain('id');
  });

  it('getJsonFields returns json fields', () => {
    expect(prisma.getJsonFields(mockModel)).toEqual(['profile']);
  });

  // Add more tests for other prisma utilities as needed
});
