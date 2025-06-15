import pkg from 'signale';

const { Signale } = pkg;
const logger = new Signale({ scope: 'Swarm' });

export function error(message: string, err?: Error, debug?: boolean) {
  if (err && (debug || process.env.SWARM_DEBUG === '1')) {
    logger.error(`${message}\n${err.stack}`);
  } else if (err) {
    logger.error(`${message}: ${err.message}`);
  } else {
    logger.error(message);
  }
}

export function warn(message: string) {
  logger.warn(message);
}

export function info(message: string) {
  logger.info(message);
}

export function success(message: string) {
  logger.success(message);
}

export function handleFatalError(
  message: string,
  err?: Error,
  code = 1,
  debug?: boolean
) {
  error(message, err, debug);
  process.exit(code);
}
