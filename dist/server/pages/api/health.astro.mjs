import { readFileSync } from 'fs';
import { join } from 'path';
export { renderers } from '../../renderers.mjs';

let version = "1.4.9";
try {
  const packagePath = join(process.cwd(), "package.json");
  const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
  version = packageJson.version;
} catch (error) {
  console.error("Failed to read package.json version:", error);
}
const GET = async () => {
  return new Response(JSON.stringify({
    status: "ok",
    service: "BuildAppolis Env-Manager",
    version,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
