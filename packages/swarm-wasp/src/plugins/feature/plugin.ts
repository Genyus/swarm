/**
 * Feature Plugin for Swarm Wasp
 *
 * Provides feature generation, CLI commands, and MCP tools for Wasp features
 */

import { SwarmPlugin } from '../../types/plugin';

export const featurePlugin: SwarmPlugin = {
  name: 'wasp-feature',
  version: '0.1.0',
  generators: [], // TODO: Add feature generators
  commands: [],   // TODO: Add feature commands
  mcpTools: [],   // TODO: Add feature MCP tools
  dependencies: []
};
