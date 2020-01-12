import fs from 'fs';
import {
  ExtensionContext,
  Neovim,
  commands,
  workspace,
} from 'coc.nvim';
import parse from 'markmap/lib/parse.markdown';
import transform from 'markmap/lib/transform.headings';

let template;

export function activate(context: ExtensionContext) {
  const { nvim } = workspace;
  context.subscriptions.push(workspace.registerKeymap(
    ['n'],
    'markmap-create',
    async () => {
      await createMarkmap(nvim);
    },
    { sync: false },
  ));
  context.subscriptions.push(commands.registerCommand(
    'markmap.create',
    async () => {
      await createMarkmap(nvim);
    },
  ));
}

interface ICreateOptions {
  open?: boolean;
}

async function createMarkmap(nvim: Neovim, { open = true }: ICreateOptions = {}) {
  if (!template) {
    template = await fs.promises.readFile(`${__dirname}/../templates/markmap.html`, 'utf8');
  }
  const text = ((await nvim.eval('getbufline(bufname(),1,"$")')) as string[]).join('\n');
  const basename = await nvim.eval('expand("%<")');
  const data = transform(parse(text));
  const html = template.replace('{/* data */}', JSON.stringify(data));
  const filename = `${basename}.html`;
  fs.promises.writeFile(filename, html, 'utf8');
  if (open) nvim.command(`silent !open ${filename}`);
}
