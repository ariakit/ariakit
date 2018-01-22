import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  name: 'reas',
  input: 'src/index.js',
  output: [{
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
  }, {
    file: 'dist/es.js',
    format: 'es',
  }],
  external: path => path.indexOf('node_modules') >= 0,
  plugins: [
    babel({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
    }),
    resolve(),
    commonjs(),
  ],
}
