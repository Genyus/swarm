#!/usr/bin/env node

import { Command } from 'commander';
import { getVersion } from '../../common';
import {
  createStartCommand,
  createStatusCommand,
  createStopCommand,
} from './commands';
import { ServerManager } from './server-manager';

export function createProgram(): Command {
  const serverManager = new ServerManager();
  const program = new Command('swarm-mcp')
    .description('Model Context Protocol server for Swarm CLI integration')
    .version(getVersion());

  program.addCommand(createStartCommand(serverManager));
  program.addCommand(createStopCommand(serverManager));
  program.addCommand(createStatusCommand(serverManager));

  program.addHelpText(
    'after',
    `
Examples:
  $ swarm-mcp start                                      # Start server in stdio mode
  $ swarm-mcp start --config ~/.swarm/swarm.config.json  # Start with custom config file
  $ swarm-mcp stop                                       # Stop the server gracefully
  $ swarm-mcp stop --force                               # Force stop the server
  $ swarm-mcp status                                     # Check server status
  $ swarm-mcp status --json                              # Get status in JSON format
`
  );

  return program;
}

export async function runCli(argv = process.argv): Promise<void> {
  const program = createProgram();
  await program.parseAsync(argv);
}

// Only parse if this file is being run directly (not imported)
// Check if this module is being executed directly vs imported
if (import.meta.url === `file://${process.argv[1]}`) {
  void runCli();
}
