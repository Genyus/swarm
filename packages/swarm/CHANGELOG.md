# @ingenyus/swarm

## [0.3.1][0.3.1] - 2025-11-04

### 🐞 Bug Fixes

- ensure explicit config path is used ([2e8888e](https://github.com/genyus/swarm/commit/2e8888e9e80dad22e2e192f38928e993d7c33b28))

### 🔧 Minor Improvements

- improve MCP class/interface names ([07a8b17](https://github.com/genyus/swarm/commit/07a8b17f4fcc18ffd66edfdf923dc7379a7d9f7f))

Contributors: [genyus](https://github.com/genyus)

[0.3.1]: https://github.com/genyus/swarm/releases/tag/v0.3.1

## [0.3.0][0.3.0] - 2025-11-03

### 🎉 New Features

- support custom config path for MCP server ([6905966](https://github.com/Genyus/swarm/commit/69059664c61139fb7f5b24f9db5ac9e6c4cf78dd))

Contributors: [Genyus](https://github.com/Genyus)

[0.3.0]: https://github.com/genyus/swarm/releases/tag/v0.3.0

## [0.2.2][0.2.2] - 2025-11-03

### 🔧 Minor Improvements

- rename swarm-cli to swarm ([6f9c36c](https://github.com/Genyus/swarm/commit/6f9c36c3631cba60f474aef0b61ae644cbb514cd))
- remove unnecessary constructor args ([9d27085](https://github.com/Genyus/swarm/commit/9d270852dc0f831a961e743c55eef94ef79c62b9))

Contributors: [Genyus](https://github.com/Genyus)

[0.2.2]: https://github.com/genyus/swarm/releases/tag/v0.2.2

## [0.2.1][0.2.1] - 2025-11-02

### 🔧 Minor Improvements

- remove obsolete properties ([8743146](https://github.com/Genyus/swarm/commit/874314652fafbd45a01e39daf35ff175e0e0e1c8))

Contributors: [Genyus](https://github.com/Genyus)

[0.2.1]: https://github.com/genyus/swarm/releases/tag/v0.2.1

## [0.2.0][0.2.0] - 2025-11-01

### 🎉 New Features

- update templates to render swarm-config methods ([9b9b1250](https://github.com/Genyus/swarm/commit/9b9b1250d40aa08143df164e090f5dc0fd41351b))
- overhaul feature configuration templates ([c00ec9cb](https://github.com/Genyus/swarm/commit/c00ec9cb8c6ac9c0be4602f85d16ecade236c847))
- improve config function insertion ([1bd579a6](https://github.com/Genyus/swarm/commit/1bd579a671654c80fcde54d3e0ab2c43573d7c06))
- update type params ([5a7b0152](https://github.com/Genyus/swarm/commit/5a7b0152847a50e88b90b9e2ff37e2db12b7c10d))
- add support for `getFiltered` queries ([630acc4f](https://github.com/Genyus/swarm/commit/630acc4fb90fdc06352de9739502159c4988a210))
- enable custom API middleware ([6162c00e](https://github.com/Genyus/swarm/commit/6162c00e1e1df94f328500c4546fd35d2480df30))
- implement alphabetical ordering for config sections ([e89a2689](https://github.com/Genyus/swarm/commit/e89a2689fa967fae5c5ed04fccdcca171de33148))
- update directory structure ([62b706b6](https://github.com/Genyus/swarm/commit/62b706b669be83a3f4bad3065bcfab1637fb6390))
- migrate code from swarm-mcp and swarm-cli ([60bb627d](https://github.com/Genyus/swarm/commit/60bb627d1bec74f1f74a01ff1688c26c12933ddc))
- implement template overriding ([e736c093](https://github.com/Genyus/swarm/commit/e736c0939dea4d6fdebfe770128478cd22a9358b))
- improve api generator arguments ([f5b8300c](https://github.com/Genyus/swarm/commit/f5b8300cf6e70c78a04f97d5da2c1124b44b276e))
- implement 'create' command ([9520d46c](https://github.com/Genyus/swarm/commit/9520d46c4371007ae49583d8654fa22460cbf262))

### 🔧 Minor Improvements

- rebuild Prisma utils on AST parsing ([adf19c87](https://github.com/Genyus/swarm/commit/adf19c87dfd3e2226bae083230d0011f1f4f1bfd))
- implement Eta templating ([48312f3d](https://github.com/Genyus/swarm/commit/48312f3de7dcab105f1268bb90964f0966d7957c))
- switch to default Eta delimiters ([1fa7280f](https://github.com/Genyus/swarm/commit/1fa7280f75eeb51fc4cdd89d1e2acbecb75bbfcf))
- implement generator base class ([db1d767e](https://github.com/Genyus/swarm/commit/db1d767e54268250226273e39936bba56a4ef4de))
- simplify generator API ([36c72e81](https://github.com/Genyus/swarm/commit/36c72e818e61545e8fa01a83f74fcf79737b0d0f))
- refactor generators ([c6052ee9](https://github.com/Genyus/swarm/commit/c6052ee9cb4e5d253f9701da8c6ea0331e52d529))
- remove obsolete method ([f4ebc9cf](https://github.com/Genyus/swarm/commit/f4ebc9cf02b263f96587410b60499d75123d54fb))
- rename BaseGenerator to GeneratorBase and SwarmLogger to SignaleLogger ([1cd16b6d](https://github.com/Genyus/swarm/commit/1cd16b6d5b37006ccabeb42d92b42578e40287fc))
- reorganize directory structure ([9e3e7e41](https://github.com/Genyus/swarm/commit/9e3e7e41cef2e11bc15f8a68aa2f160c4a9a2de2))
- renamed swarm-core to swarm ([99925d18](https://github.com/Genyus/swarm/commit/99925d18ce667c4369d6ff9efdd72020b6fea74b))
- consolidate schema introspection ([5d9a6532](https://github.com/Genyus/swarm/commit/5d9a6532237f3283f9d451be82322cbb03b8b910))

### 🐞 Bug Fixes

- enable operation generation ([3f8be052](https://github.com/Genyus/swarm/commit/3f8be05293d42b9f36a4d3647a5f274e165884a1))
- update template variables ([51b3891d](https://github.com/Genyus/swarm/commit/51b3891db2e683a21a2c012547fbca8ae30cc6e4))
- remove entity suffixing ([c93cc2cd](https://github.com/Genyus/swarm/commit/c93cc2cd7c5aa69478672b013fe879acb9f15767))
- prevent casing mis-match ([1e7cda77](https://github.com/Genyus/swarm/commit/1e7cda775b18a78246afbdbb7e9f9c4d86857582))
- fix config insertion bug ([17fc1c0b](https://github.com/Genyus/swarm/commit/17fc1c0b7954bde7bd0184a233b8637903a9ea7b))
- improve logging output ([b6c2635c](https://github.com/Genyus/swarm/commit/b6c2635c48dd5b2035d5b83bbd9d421c5a44b085))
- simplify route generation ([bc1951c1](https://github.com/Genyus/swarm/commit/bc1951c1a433f683bb70b2863673d0b3baf01d6c))
- implement CRUD generation ([88acf329](https://github.com/Genyus/swarm/commit/88acf32999e982ab7d8f9ee91f3f7dc0eae79369))
- implement plugin resolution ([57e32fd2](https://github.com/Genyus/swarm/commit/57e32fd2f13f95c6465716ab296df9c3ce9d3882))
- prevent full stack trace display for user-facing errors ([b73b7f6b](https://github.com/Genyus/swarm/commit/b73b7f6bfe5425346ab26d5a58553049d05ee6b4))
- normalise error messages ([f1f12b98](https://github.com/Genyus/swarm/commit/f1f12b981e95fdd7fe852ddba6292b08f4bca13f))
- handle missing config file gracefully ([fbc352da](https://github.com/Genyus/swarm/commit/fbc352daf9f634e77bd0756fd7f201e82a0f1865))

Contributors: [Genyus](https://github.com/Genyus)

[0.2.0]: https://github.com/genyus/swarm/releases/tag/v0.2.0
