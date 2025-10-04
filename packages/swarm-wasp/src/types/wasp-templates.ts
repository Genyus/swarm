/**
 * Wasp Template Types
 *
 * Type definitions for Wasp templates and template processing
 */

// TODO: Define Wasp-specific template types
// This will include types for template data, template contexts, etc.

export interface WaspTemplate {
  name: string;
  content: string;
  context: Record<string, any>;
}
