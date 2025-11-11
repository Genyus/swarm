import { ZodType } from 'zod';
import { GeneratorServices } from './services';
import { Generator } from './types';

export interface GeneratorProvider {
  schema: ZodType;
  create: (services: GeneratorServices) => Generator | Promise<Generator>;
}

interface GeneratorProviderTyped<S extends ZodType> {
  schema: S;
  create: (services: GeneratorServices) => Generator<S> | Promise<Generator<S>>;
}

export function defineGeneratorProvider<S extends ZodType>(
  provider: GeneratorProviderTyped<S>
): GeneratorProvider {
  return provider as unknown as GeneratorProvider;
}
