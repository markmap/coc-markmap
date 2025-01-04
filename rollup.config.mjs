import { defineExternal, definePlugins } from '@gera2ld/plaid-rollup';
import { defineConfig } from 'rollup';
import pkg from './package.json' with { type: 'json' };

export default defineConfig([
  {
    input: './src/index.ts',
    plugins: definePlugins({
      esm: true,
    }),
    external: defineExternal(['coc.nvim', ...Object.keys(pkg.dependencies)]),
    output: {
      format: 'cjs',
      dir: 'dist',
    },
  },
  {
    input: './src/bridge.ts',
    plugins: definePlugins({
      esm: true,
    }),
    external: defineExternal(['coc.nvim', ...Object.keys(pkg.dependencies)]),
    output: {
      format: 'es',
      dir: 'dist',
    },
  },
]);
