import { addHook } from 'pirates';

addHook(
  (code) => `const Prism = require('prismjs');\n${code}`,
  {
    exts: ['.js'],
    matcher: (filename) => filename.includes('/node_modules/prismjs/components/'),
    ignoreNodeModules: false,
  },
);
