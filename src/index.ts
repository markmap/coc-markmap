import { basename, extname, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import {
  Disposable,
  ExtensionContext,
  commands,
  events,
  window,
  workspace,
} from 'coc.nvim';
// Note: only CJS is supported by coc.nvim
import debounce from 'lodash.debounce';
import { getPortPromise } from 'portfinder';

const disposables: Disposable[] = [];

async function getFullText(): Promise<string> {
  const doc = await workspace.document;
  return doc.textDocument.getText();
}

async function getSelectedText(): Promise<string> {
  const doc = await workspace.document;
  const range = await window.getSelectedRange('v');
  return range ? doc.textDocument.getText(range) : '';
}

async function startDevelop() {
  if (disposables.length > 0) {
    for (const disposable of disposables) {
      disposable.dispose();
    }
    disposables.length = 0;
  }
  const port = await getPortPromise();
  const p = runJS(
    `import('markmap-cli').then(({ develop }) => develop(undefined, ${JSON.stringify(
      {
        open: true,
        toolbar: true,
        offline: true,
        port,
      },
    )}))`,
  );
  const rpc = async (cmd: string, args: unknown[]) => {
    // console.log('RPC:', cmd, args);
    try {
      const res = await fetch(`http://localhost:${port}/~api`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          cmd,
          args,
        }),
      });
      if (!res.ok) {
        throw new Error(`Request error: ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };
  const { nvim } = workspace;
  const buffer = await nvim.buffer;
  const updateContent = async () => {
    const lines = await buffer.getLines();
    return await rpc('setContent', [lines.join('\n')]);
  };
  const handleTextChange = debounce((bufnr: number) => {
    if (buffer.id !== bufnr) {
      return;
    }
    updateContent();
  }, 500);
  const handleCursor = debounce((bufnr: number) => {
    if (buffer.id !== bufnr) {
      return;
    }
    rpc('setCursor', [events.cursor.lnum - 1]);
  }, 300);
  disposables.push(Disposable.create(() => p.kill()));
  disposables.push(events.on('TextChanged', handleTextChange));
  disposables.push(events.on('TextChangedI', handleTextChange));
  disposables.push(events.on('CursorMoved', handleCursor));
  disposables.push(events.on('CursorMovedI', handleCursor));
  let time = 1000;
  for (let i = 0; i < 3; i += 1) {
    await delay(time);
    if (await updateContent()) {
      time = 0;
      break;
    }
    time *= 2;
  }
  if (time) {
    window.showErrorMessage('Error starting server');
    p.kill();
  } else {
    window.showInformationMessage(`Markmap served at http://localhost:${port}`);
  }
}

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function createMarkmapFromVim(
  content: string,
  options?: { watch?: boolean; offline?: boolean },
): Promise<void> {
  const mergedOptions = {
    watch: false,
    offline: false,
    ...options,
  };
  if (mergedOptions.watch) {
    return startDevelop();
  }
  const { nvim } = workspace;
  const input = (await nvim.eval('expand("%:p")')) as string;
  const name = basename(input, extname(input));
  const output = resolve(`${name}.html`);
  const createOptions = {
    content,
    output,
    open: true,
    toolbar: true,
    ...mergedOptions,
  };
  runJS(
    `import('markmap-cli').then(({ createMarkmap }) => createMarkmap(${JSON.stringify(
      createOptions,
    )}))`,
  );
}

function runJS(code: string) {
  // console.log('runJS', code);
  return spawn(process.execPath, ['-e', code], {
    cwd: __dirname,
  });
}

export function activate(context: ExtensionContext): void {
  // const config = workspace.getConfiguration('markmap');

  context.subscriptions.push(
    workspace.registerKeymap(
      ['n'],
      'markmap-create',
      async () => {
        const content = await getFullText();
        await createMarkmapFromVim(content);
      },
      { sync: false },
    ),
  );

  context.subscriptions.push(
    workspace.registerKeymap(
      ['v'],
      'markmap-create-v',
      async () => {
        const content = await getSelectedText();
        await createMarkmapFromVim(content);
      },
      { sync: false },
    ),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.create', async (...args: string[]) => {
      const content = await getFullText();
      const options = {
        offline: args.includes('--offline'),
      };
      await createMarkmapFromVim(content, options);
    }),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.watch', async () => {
      const content = await getFullText();
      await createMarkmapFromVim(content, { watch: true });
    }),
  );
}
