import baseConfig from '../../eslint.config.js';

export default [
  ...baseConfig,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.typecheck.json',
      },
    },
  },
];
