import {
  ExtensionContext,
  Neovim,
  commands,
  workspace,
} from 'coc.nvim';
import { createMarkmap } from 'markmap-cli';

export function activate(context: ExtensionContext) {
  const { nvim } = workspace;
  context.subscriptions.push(workspace.registerKeymap(
    ['n'],
    'markmap-create',
    async () => {
      await createMarkmapFromVim(nvim);
    },
    { sync: false },
  ));
  context.subscriptions.push(commands.registerCommand(
    'markmap.create',
    async () => {
      await createMarkmapFromVim(nvim);
    },
  ));
}

async function createMarkmapFromVim(nvim: Neovim) {
  const content = ((await nvim.eval('getbufline(bufname(),1,"$")')) as string[]).join('\n');
  const basename = await nvim.eval('expand("%<")');
  const output = `${basename}.html`;
  createMarkmap({
    content,
    output,
  });
}
