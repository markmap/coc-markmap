import {
  Disposable,
  ExtensionContext,
  Logger,
  commands,
  events,
  window,
  workspace,
} from 'coc.nvim';
import { spawn } from 'node:child_process';
import { basename, extname, resolve } from 'node:path';
// Note: only CJS is supported by coc.nvim, so we must bundle it
import { debounce } from 'es-toolkit';

class CocMarkmapBridge {
  private _child = spawn(process.execPath, [resolve(__dirname, 'bridge.js')], {
    cwd: __dirname,
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  serverInfo: { port: number } | undefined;

  id = 0;

  private _callbacks: Record<
    number,
    (data: { result: unknown; error?: string }) => void
  > = {};

  private _connectedBuffers: Record<number, string> = {};

  private _disposables: Disposable[] = [];

  constructor(private logger: Logger) {
    this._child.on(
      'message',
      (message: {
        id: number;
        cmd: string;
        data: { result: unknown; error?: string };
      }) => {
        this._callbacks[message.id]?.(message.data);
        delete this._callbacks[message.id];
      },
    );
    this._disposables.push(Disposable.create(() => this.stopServer()));
    this._disposables.push(events.on('TextChanged', this.handleTextChange));
    this._disposables.push(events.on('TextChangedI', this.handleTextChange));
    this._disposables.push(events.on('CursorMoved', this.handleCursorChange));
    this._disposables.push(events.on('CursorMovedI', this.handleCursorChange));
  }

  private _send<T>(cmd: string, data?: unknown): Promise<T> {
    this.id += 1;
    this._child.send({ id: this.id, cmd, data });
    return new Promise((resolve, reject) => {
      this._callbacks[this.id] = (data) => {
        if (data.error) reject(data.error);
        else resolve(data.result as T);
      };
    });
  }

  initialize(assetsDir: string) {
    return this._send('initialize', { assetsDir });
  }

  destroy() {
    this._child.kill();
  }

  isServerStarted() {
    return !!this.serverInfo;
  }

  async startServer() {
    this.serverInfo = await this._send('startServer');
  }

  async stopServer() {
    if (!this.serverInfo) return;
    await this._send('stopServer');
    this.serverInfo = undefined;
  }

  async setContent(key: string, content: string) {
    await this._send('setContent', { key, content });
  }

  async setCursor(key: string, line: number) {
    await this._send('setCursor', { key, line });
  }

  async connectBuffer() {
    await this.startServer();
    const { nvim } = workspace;
    const buffer = await nvim.buffer;
    const filePath = (await nvim.eval('expand("%:p")')) as string;
    const filename = basename(filePath);
    const key =
      this._connectedBuffers[buffer.id] ||
      (await this._send<string>('addProvider', filePath));
    this._connectedBuffers[buffer.id] = key;
    this.handleTextChange(buffer.id);
    const url = `http://localhost:${this.serverInfo?.port}/?key=${key}&filename=${encodeURIComponent(filename)}`;
    window.showInformationMessage(
      `Buffer ${buffer.id}: Markmap is served at ${url}`,
    );
    this._send('openUrl', url);
  }

  async disconnectBuffer() {
    const { nvim } = workspace;
    const buffer = await nvim.buffer;
    const key = this._connectedBuffers[buffer.id];
    if (key) {
      await this._send('delProvider', key);
      delete this._connectedBuffers[buffer.id];
      window.showInformationMessage(`Buffer ${buffer.id}: Markmap is disposed`);
    }
  }

  async createMarkmap(options?: Record<string, unknown>) {
    const { nvim } = workspace;
    const filePath = (await nvim.eval('expand("%:p")')) as string;
    const name = basename(filePath, extname(filePath));
    const output = resolve(`${name}.html`);
    const doc = await workspace.document;
    const content = doc.textDocument.getText();
    const createOptions = {
      content,
      output,
      ...options,
    };
    await this._send('createMarkmap', createOptions);
  }

  private _bufferIds = new Set<number>();

  private _updateContents = debounce(async () => {
    const { nvim } = workspace;
    const buffers = await nvim.buffers;
    const matchedBuffers = buffers.filter((buffer) =>
      this._bufferIds.has(buffer.id),
    );
    this._bufferIds.clear();
    for (const buffer of matchedBuffers) {
      const key = this._connectedBuffers[buffer.id];
      if (!key) continue;
      const lines = await buffer.getLines();
      await this.setContent(key, lines.join('\n'));
    }
    this.logger.info('Content updated');
  }, 500);

  handleTextChange = (bufferId: number) => {
    if (!this._connectedBuffers[bufferId]) return;
    this.logger.info(`Buffer ${bufferId}: text change`);
    this._bufferIds.add(bufferId);
    this._updateContents();
  };

  handleCursorChange = debounce(async () => {
    const { nvim } = workspace;
    const buffer = await nvim.buffer;
    const key = this._connectedBuffers[buffer.id];
    if (!key) return;
    this.logger.info('Cursor change:', events.cursor.lnum);
    await this._send('setCursor', { key, line: events.cursor.lnum - 1 });
  }, 300);
}

export function activate(context: ExtensionContext) {
  // const config = workspace.getConfiguration('markmap');
  const { logger, storagePath } = context;
  const loading = (async () => {
    logger.info('Initialize bridge...');
    const bridge = new CocMarkmapBridge(logger);
    await bridge.initialize(storagePath);
    logger.info('Bridge loaded');
    return bridge;
  })();

  context.subscriptions.push(
    workspace.registerKeymap(
      ['n'],
      'markmap-create',
      async () => {
        const bridge = await loading;
        await bridge.createMarkmap();
      },
      { sync: false },
    ),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.create', async (...args: string[]) => {
      const options = {
        offline: args.includes('--offline'),
      };
      const bridge = await loading;
      await bridge.createMarkmap(options);
    }),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.watch', async () => {
      const bridge = await loading;
      await bridge.connectBuffer();
    }),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.unwatch', async () => {
      const bridge = await loading;
      await bridge.disconnectBuffer();
    }),
  );

  context.subscriptions.push(
    commands.registerCommand('markmap.stop', async () => {
      const bridge = await loading;
      await bridge.stopServer();
    }),
  );
}
