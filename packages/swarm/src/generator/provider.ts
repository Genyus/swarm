import { ZodType } from 'zod';
import { GeneratorServices } from './services';
import { SwarmGenerator } from './types';

export interface SwarmGeneratorProvider {
  schema: ZodType;
  create: (
    services: GeneratorServices
  ) => SwarmGenerator | Promise<SwarmGenerator>;
}

interface SwarmGeneratorProviderTyped<S extends ZodType> {
  schema: S;
  create: (
    services: GeneratorServices
  ) => SwarmGenerator<S> | Promise<SwarmGenerator<S>>;
}

export function defineGeneratorProvider<S extends ZodType>(
  provider: SwarmGeneratorProviderTyped<S>
): SwarmGeneratorProvider {
  return provider as unknown as SwarmGeneratorProvider;
}
