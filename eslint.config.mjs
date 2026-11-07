import boundaries from 'eslint-plugin-boundaries';
import i18next from 'eslint-plugin-i18next';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/**', 'scripts/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      boundaries,
      i18next,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        {
          type: 'domain',
          pattern: 'src/domain/**/*',
        },
        {
          type: 'application',
          pattern: 'src/application/**/*',
        },
        {
          type: 'infrastructure',
          pattern: 'src/infrastructure/**/*',
        },
        {
          type: 'presentation',
          pattern: 'src/presentation/**/*',
        },
        {
          type: 'app',
          pattern: 'src/app/**/*',
        },
        {
          type: 'shared',
          pattern: 'src/{lib,i18n,styles}/**/*',
        },
      ],
    },
    rules: {
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: 'domain',
              allow: ['domain', 'shared'],
            },
            {
              from: 'application',
              allow: ['domain', 'application', 'shared'],
            },
            {
              from: 'infrastructure',
              allow: ['domain', 'application', 'infrastructure', 'shared'],
            },
            {
              from: 'presentation',
              allow: ['domain', 'application', 'presentation', 'shared', 'infrastructure'],
            },
            {
              from: 'app',
              allow: ['domain', 'application', 'infrastructure', 'presentation', 'shared', 'app'],
            },
            {
              from: 'shared',
              allow: ['shared'],
            },
          ],
        },
      ],
      'i18next/no-literal-string': [
        'warn',
        {
          mode: 'jsx-text-only',
          'should-validate-template': true,
        },
      ],
    },
  },
];
