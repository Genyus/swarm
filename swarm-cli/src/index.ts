#!/usr/bin/env node
import { Command } from 'commander';
import { generate } from './commands/generate';

const program = new Command();

program
  .name('swarm')
  .description('Genyus/Swarm CLI')
  .version('0.1.0');

program
  .command('generate')
  .description('Run code generation')
  .action(generate);

program.parse(process.argv); 