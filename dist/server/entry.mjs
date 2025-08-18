import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_y8PBfwF1.mjs';
import { manifest } from './manifest_CPMrWZ99.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth.astro.mjs');
const _page2 = () => import('./pages/api/export.astro.mjs');
const _page3 = () => import('./pages/api/project/status.astro.mjs');
const _page4 = () => import('./pages/api/project/variable-config.astro.mjs');
const _page5 = () => import('./pages/api/snapshots/_id_/restore.astro.mjs');
const _page6 = () => import('./pages/api/snapshots/_id_.astro.mjs');
const _page7 = () => import('./pages/api/snapshots.astro.mjs');
const _page8 = () => import('./pages/api/variables.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/.pnpm/astro@4.16.18_@types+node@20.19.11_rollup@4.46.3_typescript@5.9.2/node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth.ts", _page1],
    ["src/pages/api/export.ts", _page2],
    ["src/pages/api/project/status.ts", _page3],
    ["src/pages/api/project/variable-config.ts", _page4],
    ["src/pages/api/snapshots/[id]/restore.ts", _page5],
    ["src/pages/api/snapshots/[id].ts", _page6],
    ["src/pages/api/snapshots.ts", _page7],
    ["src/pages/api/variables.ts", _page8],
    ["src/pages/index.astro", _page9]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///home/cory-ubuntu/coding/projects/env-manager/dist/client/",
    "server": "file:///home/cory-ubuntu/coding/projects/env-manager/dist/server/",
    "host": true,
    "port": 3001,
    "assets": "_astro"
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
{
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
