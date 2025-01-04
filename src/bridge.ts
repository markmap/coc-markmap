import { createHash } from 'crypto';
import {
  MarkmapDevServer,
  config,
  createMarkmap,
  develop,
  fetchAssets,
} from 'markmap-cli';
import open from 'open';

let devServer: MarkmapDevServer | undefined;

type MaybePromise<T> = T | Promise<T>;

const handlers: Record<string, (data: unknown) => MaybePromise<unknown>> = {
  initialize(options: { assetsDir: string }) {
    config.assetsDir = options.assetsDir;
  },
  async createMarkmap(options: Record<string, unknown>) {
    await fetchAssets();
    await createMarkmap({
      open: true,
      toolbar: true,
      offline: false,
      ...options,
    });
  },
  async startServer(options?: Record<string, unknown>) {
    if (!devServer) {
      await fetchAssets();
      devServer = await develop({
        toolbar: true,
        offline: true,
        ...options,
      });
    }
    return (
      devServer.serverInfo && {
        port: devServer.serverInfo.address.port,
      }
    );
  },
  addProvider(filePath: string) {
    const key = createHash('sha256')
      .update(filePath, 'utf8')
      .digest('hex')
      .slice(0, 7);
    const provider = invariant(devServer).addProvider({ key });
    return provider.key;
  },
  delProvider(key: string) {
    invariant(devServer).delProvider(key);
  },
  setContent(data: { key: string; content: string }) {
    const provider = invariant(devServer?.providers[data.key]);
    provider.setContent(data.content);
  },
  setCursor(data: { key: string; line: number }) {
    const provider = invariant(devServer?.providers[data.key]);
    provider.setCursor(data.line);
  },
  stopServer() {
    if (!devServer) return;
    devServer.shutdown();
    devServer = undefined;
  },
  openUrl(url: string) {
    open(url);
  },
};

process.on(
  'message',
  async ({ id, cmd, data }: { id: number; cmd: string; data: unknown }) => {
    const handler = handlers[cmd];
    let result: unknown;
    let error: string | undefined;
    try {
      result = await handler?.(data);
    } catch (err) {
      error = `${err}`;
    }
    process.send?.({
      id,
      cmd: '_setResult',
      data: { result, error },
    });
  },
);

function invariant<T>(input: T | undefined, message?: string): T {
  if (!input) throw new Error(message || 'input is required');
  return input;
}
