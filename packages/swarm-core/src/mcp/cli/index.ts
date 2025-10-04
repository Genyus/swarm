#!/usr/bin/env node

import { Command } from 'commander';
import {
  createStartCommand,
  createStatusCommand,
  createStopCommand,
} from './commands/index.js';
import { ServerManager } from './server-manager.js';

const program = new Command();
const serverManager = new ServerManager();

program
  .name('swarm-mcp')
  .description('Model Context Protocol server for Swarm CLI integration')
  .version('0.1.0');

program.addCommand(createStartCommand(serverManager));
program.addCommand(createStopCommand(serverManager));
program.addCommand(createStatusCommand(serverManager));

program.addHelpText(
  'after',
  `
Examples:
  $ swarm-mcp start              # Start server on default port 3000
  $ swarm-mcp start --port 8080  # Start server on port 8080
  $ swarm-mcp start --stdio      # Start server in stdio mode
  $ swarm-mcp stop               # Stop the server gracefully
  $ swarm-mcp stop --force       # Force stop the server
  $ swarm-mcp status             # Check server status
  $ swarm-mcp status --json      # Get status in JSON format
`
);

program.parse();
