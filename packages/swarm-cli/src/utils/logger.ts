import pkg from 'signale';
import { Logger } from '../types/logger';

const { Signale } = pkg;
const signale = new Signale({ scope: 'Swarm' });

export const realLogger: Logger = {
  debug: (message, context) => signale.debug(formatMessage(message, context)),
  info: (message, context) => signale.info(formatMessage(message, context)),
  success: (message, context) =>
    signale.success(formatMessage(message, context)),
  warn: (message, context) => signale.warn(formatMessage(message, context)),
  error: (message, context) => signale.error(formatMessage(message, context)),
};

function formatMessage(message: string, context?: Record<string, unknown>) {
  return `${message} ${context ? JSON.stringify(context) : ''}`;
}
