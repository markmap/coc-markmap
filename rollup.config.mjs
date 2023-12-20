import { defineConfig } from 'rollup';
import { definePlugins, defineExternal } from '@gera2ld/plaid-rollup';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
  input: './src/index.ts',
  plugins: definePlugins({
    esm: true,
  }),
  external: defineExternal(['coc.nvim', ...Object.keys(pkg.dependencies)]),
  output: {
    format: 'cjs',
    file: 'dist/index.js',
  },
});
