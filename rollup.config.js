import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
import pkg from './package.json';

const { presets } = require('./babel.config');

const extensions = ['.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx'];

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
    commonjs(),
    resolve({
      extensions,
    }),
    typescript({
      tsconfigOverride: {
        exclude: ['__tests__', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
      },
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      presets,
      exclude: 'node_modules/**',
    }),
  ],
  external: [
    ...Object.keys(pkg.devDependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
};
