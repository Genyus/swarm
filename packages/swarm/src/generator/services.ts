import { type FileSystem, type Logger, realFileSystem } from '../common';
import type { GeneratorEnvironment } from './types';

export interface GeneratorServices {
  fileSystem: FileSystem;
  logger: Logger;
}

export function getGeneratorServices(
  _env: GeneratorEnvironment,
  logger: Logger,
  overrides: Partial<GeneratorServices> = {}
): GeneratorServices {
  return {
    fileSystem: realFileSystem,
    logger,
    ...overrides,
  };
}
