import { FileSystem, Logger, realFileSystem } from '../common';
import { GeneratorEnvironment } from './types';

export interface GeneratorServices {
  fileSystem: FileSystem;
  logger: Logger;
}

export function getGeneratorServices(
  env: GeneratorEnvironment,
  logger: Logger,
  overrides: Partial<GeneratorServices> = {}
): GeneratorServices {
  return {
    fileSystem: realFileSystem,
    logger,
    ...overrides,
  };
}
