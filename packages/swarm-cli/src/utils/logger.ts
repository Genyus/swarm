import pkg from 'signale';
import { Logger } from '../types/logger';

const { Signale } = pkg;
const signale = new Signale({ scope: 'Swarm' });

export const realLogger: Logger = {
  debug: (msg) => signale.debug(msg),
  info: (msg) => signale.info(msg),
  success: (msg) => signale.success(msg),
  warn: (msg) => signale.warn(msg),
  error: (msg) => signale.error(msg),
};
