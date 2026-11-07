import boundaries from 'eslint-plugin-boundaries';

export default [
  {
    plugins: {
      boundaries,
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
              allow: ['domain', 'application', 'presentation', 'infrastructure', 'app', 'shared'],
            },
            {
              from: 'shared',
              allow: ['shared'],
            },
          ],
        },
      ],
    },
  },
];

