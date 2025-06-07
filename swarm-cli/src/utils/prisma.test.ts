import { describe, expect, it } from 'vitest';
import * as prisma from './prisma';

describe('prisma utils', () => {
  const mockModel = {
    name: 'User',
    fields: [
      { name: 'id', type: 'Int', isId: true, isJson: false },
      { name: 'profile', type: 'Json', isId: false, isJson: true },
      { name: 'name', type: 'String', isId: false, isJson: false },
    ],
  };

  it('getIdField returns the id field', () => {
    expect(prisma.getIdField(mockModel)).toEqual({ name: 'id', type: 'Int', isId: true, isJson: false });
  });

  it('getOmitFields returns correct omit fields', () => {
    expect(prisma.getOmitFields(mockModel)).toContain('id');
  });

  it('getJsonFields returns json fields', () => {
    expect(prisma.getJsonFields(mockModel)).toEqual([
      'profile',
    ]);
  });

  // Add more tests for other prisma utilities as needed
}); 