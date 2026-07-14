import type { FileSystem, Logger } from '@ingenyus/swarm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFS, createMockLogger } from '../../../tests/utils';
import type { SpecDeclaration } from './config-generator';
import { WaspConfigGenerator } from './wasp-config-generator';

const EMPTY_SPEC = `import { type Spec } from '@wasp.sh/spec';

export const spec: Spec = [];
`;

const query: SpecDeclaration = {
  kind: 'query',
  call: 'query(getTask, { entities: ["Task"], auth: true })',
  refImports: [{ names: ['getTask'], from: './server/queries/getTask' }],
};

describe('WaspConfigGenerator', () => {
  let fs: FileSystem;
  let logger: Logger;
  let gen: WaspConfigGenerator;

  beforeEach(() => {
    fs = createMockFS();
    logger = createMockLogger();
    gen = new WaspConfigGenerator(logger, fs);
    // findWaspRoot resolves immediately; feature config exists by default.
    fs.existsSync = vi.fn(() => true);
  });

  it('generate copies the feature template when the config does not exist', () => {
    fs.existsSync = vi.fn((p) => !String(p).endsWith('feature.wasp.ts'));
    fs.copyFileSync = vi.fn();

    gen.generate('todo');

    expect(fs.copyFileSync).toHaveBeenCalled();
  });

  it('update inserts a native declaration plus its imports into the spec array', () => {
    fs.readFileSync = vi.fn(() => EMPTY_SPEC);
    fs.writeFileSync = vi.fn();

    gen.update('todo', query);

    const written = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as string;

    expect(written).toContain(
      'query(getTask, { entities: ["Task"], auth: true })'
    );
    expect(written).toContain(
      `import { getTask } from './server/queries/getTask' with { type: 'ref' };`
    );
    expect(written).toContain('// Query definitions');
    expect(written).toMatch(
      /import \{ type Spec, query \} from '@wasp\.sh\/spec'/
    );
  });

  it('update is idempotent for the same declaration', () => {
    fs.readFileSync = vi.fn(() => EMPTY_SPEC);
    fs.writeFileSync = vi.fn();
    gen.update('todo', query);
    const once = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as string;

    fs.readFileSync = vi.fn(() => once);
    fs.writeFileSync = vi.fn();
    gen.update('todo', query);
    const twice = (fs.writeFileSync as ReturnType<typeof vi.fn>).mock
      .calls[0][1] as string;

    expect(twice).toBe(once);
  });

  it('has detects an existing declaration by kind and identity', () => {
    fs.readFileSync = vi.fn(
      () => `import { type Spec, query } from '@wasp.sh/spec';
import { getTask } from './server/queries/getTask' with { type: 'ref' };

export const spec: Spec = [
  query(getTask, { auth: true }),
];
`
    );

    expect(
      gen.has('todo', {
        kind: 'query',
        call: 'query(getTask, {})',
        refImports: [],
      })
    ).toBe(true);
    expect(
      gen.has('todo', {
        kind: 'query',
        call: 'query(getOther, {})',
        refImports: [],
      })
    ).toBe(false);
    expect(
      gen.has('todo', {
        kind: 'action',
        call: 'action(getTask, {})',
        refImports: [],
      })
    ).toBe(false);
  });
});
