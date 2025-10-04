/**
 * Wasp Entity Types
 *
 * Type definitions specific to Wasp entities and data structures
 */

// TODO: Define Wasp-specific entity types
// This will include types for Wasp entities, fields, relationships, etc.

export interface WaspEntity {
  name: string;
  fields: WaspField[];
}

export interface WaspField {
  name: string;
  type: string;
  isRequired: boolean;
}
