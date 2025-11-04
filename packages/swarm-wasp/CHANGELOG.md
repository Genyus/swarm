# @ingenyus/swarm-wasp

## [0.2.4][0.2.4] - 2025-11-04

### 📦 Updated Dependencies

- update @ingenyus/swarm to 0.3.1 ([04da606](https://github.com/genyus/swarm/commit/04da60693f0031aa5ad3e456a526f708ae6b1051))


[0.2.4]: https://github.com/genyus/swarm/releases/tag/v0.2.4

## [0.2.3][0.2.3] - 2025-11-03

### Updated Dependencies

- update @ingenyus/swarm to 0.3.0

[0.2.3]: https://github.com/genyus/swarm/releases/tag/v0.2.3

## [0.2.2][0.2.2] - 2025-11-03

### 🔧 Minor Improvements

- remove unnecessary constructor args ([9d27085](https://github.com/Genyus/swarm/commit/9d270852dc0f831a961e743c55eef94ef79c62b9))

### Updated Dependencies

- @ingenyus/swarm@0.2.2

Contributors: [Genyus](https://github.com/Genyus)

[0.2.2]: https://github.com/genyus/swarm/releases/tag/v0.2.2

## [0.2.1][0.2.1] - 2025-11-02

### 🔧 Minor Improvements

- remove obsolete properties ([8743146](https://github.com/Genyus/swarm/commit/874314652fafbd45a01e39daf35ff175e0e0e1c8))

### Updated Dependencies

- @ingenyus/swarm@0.2.1

Contributors: [Genyus](https://github.com/Genyus)

[0.2.1]: https://github.com/genyus/swarm/releases/tag/v0.2.1

## [0.2.0][0.2.0] - 2025-11-01

### 🎉 New Features

- add swarm-wasp package boilerplate ([f74e04c9](https://github.com/Genyus/swarm/commit/f74e04c9877cb751fdfe0d43262ccb66f1d14c9d))
- improve create operations ([6e13911a](https://github.com/Genyus/swarm/commit/6e13911ac3f8e19733dfa80e328f6d6cce1fbddd))
- remove relation fields from metadata ([ecc602c2](https://github.com/Genyus/swarm/commit/ecc602c2bc36267f634587593292a77fd6c51c0f))
- auto-include datatype in entities array for actions and queries ([abd0dc9e](https://github.com/Genyus/swarm/commit/abd0dc9ef090dd6fdda687504d081e750bf24c36))
- add optional custom name parameter to action and query generators ([1de94157](https://github.com/Genyus/swarm/commit/1de94157c817b4584d0eddaf9e17cc6faec26117))
- add comprehensive support for Prisma composite primary keys ([5ee2c977](https://github.com/Genyus/swarm/commit/5ee2c977f5261bba15ba0b99eabcc14653f5d333))

### 🔧 Minor Improvements

- migrate all Wasp references to swarm-wasp ([59314f41](https://github.com/Genyus/swarm/commit/59314f413fe39e441ed10c6901a86bf3d6afd97b))
- restructure monorepo ([d56a4ac0](https://github.com/Genyus/swarm/commit/d56a4ac020fe602f46254d1cd8c055028acfd0e1))
- merge swarm-config into swarm-wasp ([d3bd9f72](https://github.com/Genyus/swarm/commit/d3bd9f72e163626804d95043d314137d5f192ed9))
- refactor template handling ([b0ddcd1d](https://github.com/Genyus/swarm/commit/b0ddcd1d9172343a8a79c1c0cc0dd8a6da2578a8))
- rename base classes to use Base suffix ([e53ea319](https://github.com/Genyus/swarm/commit/e53ea31927781c41f60a2ee94aa4b88bf0b23f9d))
- remove Hungarian notation from interfaces ([688f4637](https://github.com/Genyus/swarm/commit/688f46378f62419e62397597570158b2fa306475))
- complete naming convention improvements ([6c3db60a](https://github.com/Genyus/swarm/commit/6c3db60a4102586c563a851fa834bcbad8a74e2c))
- improve types and fix test imports in utils and generators ([f43ed422](https://github.com/Genyus/swarm/commit/f43ed422304fb28245ae16939c44c9985864fd45))
- update imports to use barrel paths ([a5b8dcc9](https://github.com/Genyus/swarm/commit/a5b8dcc9b850a21173086df4ca8d78279a441a05))
- reorganize directory structure ([9abcfc16](https://github.com/Genyus/swarm/commit/9abcfc169536a4343d6f7cf69bdbe73989af9403))
- Phase 3 - eliminate duplication and reduce complexity ([1edf386f](https://github.com/Genyus/swarm/commit/1edf386fe4bf71002bfebaf4758e9ead66c57d7b))
- split operation generator into action and query generators ([85c3d045](https://github.com/Genyus/swarm/commit/85c3d0458e8eee0c4dec642585b923bfb40fd7f3))
- improve operation code generation with consistent field helpers and type utilities ([63ae73f3](https://github.com/Genyus/swarm/commit/63ae73f3e275023e1b15e38b650766ddcff88a89))

### 🐞 Bug Fixes

- extend optional field support ([8a3463fe](https://github.com/Genyus/swarm/commit/8a3463fe1239f8af38f7adb31ea07327b03d5637))
- ensure parent features exist ([e44f3793](https://github.com/Genyus/swarm/commit/e44f3793efd31c1cb1337af18df10c812806ad20))
- complete Hungarian notation removal and fix type issues ([fd12d9d3](https://github.com/Genyus/swarm/commit/fd12d9d330cb251e973f07fa61b377e2b7ef86a4))
- resolve test failures after refactoring ([3823b42d](https://github.com/Genyus/swarm/commit/3823b42de6ccdc3d0f0677f4741dd9fa2b7e7429))
- Fix insertion ordering ([8ff2bb2f](https://github.com/Genyus/swarm/commit/8ff2bb2f2eba316865b18a54923c1a07e2596800))
- fix route configuration format ([ab3b1c2a](https://github.com/Genyus/swarm/commit/ab3b1c2a223d54ad77a17f9d790e09da282605f8))
- simplify feature command ([900793e6](https://github.com/Genyus/swarm/commit/900793e69b903db2d5f5fd89bce30425cabb50e9))
- fix CRUD generator command ([0f6c9f0e](https://github.com/Genyus/swarm/commit/0f6c9f0efe1904df5bc2f78f3f70921c5262e608))

### Updated Dependencies

- @ingenyus/swarm@0.2.0

Contributors: [Genyus](https://github.com/Genyus)

[0.2.0]: https://github.com/genyus/swarm/releases/tag/v0.2.0
