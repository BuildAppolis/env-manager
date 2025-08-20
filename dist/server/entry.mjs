import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CiZMU4_s.mjs';
import { manifest } from './manifest_D3sMa4Gh.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/status.astro.mjs');
const _page2 = () => import('./pages/api/auth.astro.mjs');
const _page3 = () => import('./pages/api/branches.astro.mjs');
const _page4 = () => import('./pages/api/draft.astro.mjs');
const _page5 = () => import('./pages/api/export.astro.mjs');
const _page6 = () => import('./pages/api/export-types.astro.mjs');
const _page7 = () => import('./pages/api/generate-secret.astro.mjs');
const _page8 = () => import('./pages/api/health.astro.mjs');
const _page9 = () => import('./pages/api/hot-reload.astro.mjs');
const _page10 = () => import('./pages/api/password.astro.mjs');
const _page11 = () => import('./pages/api/project/status.astro.mjs');
const _page12 = () => import('./pages/api/project/variable-config.astro.mjs');
const _page13 = () => import('./pages/api/projects.astro.mjs');
const _page14 = () => import('./pages/api/snapshots/_id_/restore.astro.mjs');
const _page15 = () => import('./pages/api/snapshots/_id_.astro.mjs');
const _page16 = () => import('./pages/api/snapshots.astro.mjs');
const _page17 = () => import('./pages/api/variables.astro.mjs');
const _page18 = () => import('./pages/api/version.astro.mjs');
const _page19 = () => import('./pages/api/versions/restore.astro.mjs');
const _page20 = () => import('./pages/api/versions.astro.mjs');
const _page21 = () => import('./pages/index.astro.mjs');
const _page22 = () => import('./pages/_---slug_.astro.mjs');
const pageMap = new Map([
    ["node_modules/.pnpm/astro@5.13.2_@types+node@20.19.11_jiti@2.5.1_lightningcss@1.30.1_rollup@4.46.4_typescript@5.9.2_yaml@2.8.1/node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth/status.ts", _page1],
    ["src/pages/api/auth.ts", _page2],
    ["src/pages/api/branches.ts", _page3],
    ["src/pages/api/draft.ts", _page4],
    ["src/pages/api/export.ts", _page5],
    ["src/pages/api/export-types.ts", _page6],
    ["src/pages/api/generate-secret.ts", _page7],
    ["src/pages/api/health.ts", _page8],
    ["src/pages/api/hot-reload.ts", _page9],
    ["src/pages/api/password.ts", _page10],
    ["src/pages/api/project/status.ts", _page11],
    ["src/pages/api/project/variable-config.ts", _page12],
    ["src/pages/api/projects.ts", _page13],
    ["src/pages/api/snapshots/[id]/restore.ts", _page14],
    ["src/pages/api/snapshots/[id].ts", _page15],
    ["src/pages/api/snapshots.ts", _page16],
    ["src/pages/api/variables.ts", _page17],
    ["src/pages/api/version.ts", _page18],
    ["src/pages/api/versions/restore.ts", _page19],
    ["src/pages/api/versions.ts", _page20],
    ["src/pages/index.astro", _page21],
    ["src/pages/[...slug].astro", _page22]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///home/cory-ubuntu/coding/projects/env-manager/dist/client/",
    "server": "file:///home/cory-ubuntu/coding/projects/env-manager/dist/server/",
    "host": true,
    "port": 6969,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
