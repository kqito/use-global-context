import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

/* eslint @typescript-eslint/no-var-requires: 0 */
const { presets, plugins } = require('./babel.config.js');

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      file: pkg.module,
      format: 'esm',
    },
  ],
  plugins: [
    resolve({}),
    typescript({
      tsconfigOverride: {
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      },
    }),
    babel({
      babelHelpers: 'bundled',
      presets,
      plugins,
    }),
  ],
  external: [
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.dependencies || {}),
  ],
};
