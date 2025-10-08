/**
 * Metadata for individual schema fields
 */
export interface FieldMetadata {
  /** Human-readable description of the field */
  description: string;
  /** Friendly display name for the field */
  friendlyName: string;
  /** Example values for the field */
  examples?: string[];
  /** Additional help text for the field */
  helpText?: string;
  /** Short name for command-line options (e.g., 'r' for 'route') */
  shortName?: string;
  /** Default value for the field */
  defaultValue?: any;
}
