module.exports = {
  setupFilesAfterEnv: ['<rootDir>setupTests.js'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: './coverage/',
  preset: 'ts-jest',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      babelConfig: false,
      tsconfig: './tsconfig.json',
    },
  },
};
