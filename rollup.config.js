import typescript from 'rollup-plugin-typescript2';

export default {
  input: './libs/index.ts',
  output: [{
    file: './dist/index.js',
    format: 'es',
    sourcemap: true
  }],
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'bundler',
          target: 'ES2022'
        }
      }
    })
  ],
  external: ['@aws-sdk/client-cloudfront', 'bunyan', 'bunyan-format']
}