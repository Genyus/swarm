#!/usr/bin/env node
import { main } from './cli/index';
import { handleFatalError } from './utils/errors';

main().catch((err) => {
  handleFatalError('Swarm CLI failed to start', err);
});
