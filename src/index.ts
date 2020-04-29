import {
  ExtensionContext,
  Neovim,
  commands,
  workspace,
} from 'coc.nvim';
import { createMarkmap } from 'markmap-lib';

async function getContent(nvim: Neovim, line1 = '1', line2 = '"$"'): Promise<string> {
  const lines = (await nvim.eval(`getline(${line1},${line2})`)) as string[];
  return lines.join('\n');
}

async function createMarkmapFromVim(nvim: Neovim, { line1, line2, ...rest }: {
  line1?: string;
  line2?: string;
} = {}): Promise<void> {
  const content = await getContent(nvim, line1, line2);
  const basename = await nvim.eval('expand("%<")');
  createMarkmap({
    ...rest,
    content,
    output: basename && `${basename}.html`,
  });
}

export function activate(context: ExtensionContext): void {
  const { nvim } = workspace;
  const config = workspace.getConfiguration('markmap');

  context.subscriptions.push(workspace.registerKeymap(
    ['n'],
    'markmap-create',
    async () => {
      await createMarkmapFromVim(nvim);
    },
    { sync: false },
  ));

  context.subscriptions.push(workspace.registerKeymap(
    ['v'],
    'markmap-create-v',
    async () => {
      const [
        [, line1],
        [, line2],
      ] = await nvim.eval('[getpos("\'<"),getpos("\'>")]') as [number[], number[]];
      await createMarkmapFromVim(nvim, {
        line1: `${line1}`,
        line2: `${line2}`,
      });
    },
    { sync: false },
  ));

  context.subscriptions.push(commands.registerCommand(
    'markmap.create',
    async (...args) => {
      const positional = [];
      const options: any = {};
      for (const arg of args) {
        if (arg === '--enable-mathjax') options.mathJax = config.get<object>('mathJax') || true;
        else if (!arg.startsWith('-')) positional.push(arg);
      }
      [options.line1, options.line2] = positional;
      await createMarkmapFromVim(nvim, options);
    },
  ));
}
