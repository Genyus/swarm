declare module 'degit' {
  interface DegitOptions {
    cache?: boolean;
    force?: boolean;
  }

  interface DegitEmitter {
    clone(dest: string): Promise<void>;
  }

  function degit(repo: string, options?: DegitOptions): DegitEmitter;
  export = degit;
}
