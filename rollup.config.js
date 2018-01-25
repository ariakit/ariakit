import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [{
    name: 'reas',
    file: pkg.main,
    format: 'cjs',
    exports: 'named',
  }, {
    file: pkg.module,
    format: 'es',
  }],
  external: ['react', 'react-dom'].concat(Object.keys(pkg.dependencies)),
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    resolve(),
    commonjs(),
  ],
}
