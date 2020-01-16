import {
  ExtensionContext,
  Neovim,
  commands,
  workspace,
} from 'coc.nvim';
import { createMarkmap } from 'markmap-cli';

async function getContent(nvim: Neovim, line1 = '1', line2 = '"$"'): Promise<string> {
  const lines = (await nvim.eval(`getline(${line1},${line2})`)) as string[];
  return lines.join('\n');
}

async function createMarkmapFromVim(nvim: Neovim, line1?: string, line2?: string): Promise<void> {
  const content = await getContent(nvim, line1, line2);
  const basename = await nvim.eval('expand("%<")');
  createMarkmap({
    content,
    output: basename && `${basename}.html`,
  });
}

export function activate(context: ExtensionContext): void {
  const { nvim } = workspace;

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
      await createMarkmapFromVim(nvim, `${line1}`, `${line2}`);
    },
    { sync: false },
  ));

  context.subscriptions.push(commands.registerCommand(
    'markmap.create',
    async (line1, line2) => {
      await createMarkmapFromVim(nvim, line1, line2);
    },
  ));
}
