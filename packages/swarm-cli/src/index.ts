#!/usr/bin/env node
import { handleFatalError } from '@ingenyus/swarm-core';
import { main } from './cli/index';

main().catch((err) => {
  handleFatalError('Swarm CLI failed to start', err);
});
