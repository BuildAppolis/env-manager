import { readFileSync } from 'fs';
import { join } from 'path';
export { renderers } from '../../renderers.mjs';

function getVersionInfo() {
  let version = "1.4.9";
  let environment = "production";
  let isPublished = false;
  try {
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
    version = packageJson.version;
    if (process.cwd().includes("node_modules/@buildappolis/env-manager")) {
      isPublished = true;
      environment = "production";
    } else if (process.env.NODE_ENV === "development" || process.cwd().includes("/coding/projects/env-manager")) {
      isPublished = false;
      environment = "development";
    } else {
      isPublished = false;
      environment = "local";
    }
  } catch (error) {
    console.error("Failed to read version info:", error);
  }
  return {
    version,
    environment,
    isPublished,
    buildDate: (/* @__PURE__ */ new Date()).toISOString()
  };
}
getVersionInfo().version;

const GET = async () => {
  const versionInfo = getVersionInfo();
  return new Response(JSON.stringify(versionInfo), {
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
