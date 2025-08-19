import { g as getDatabase } from '../../chunks/session_CHWjKZB4.mjs';
import { g as getGitUtils } from '../../chunks/git-utils_B6WJYd3b.mjs';
import { g as getHotReloadManager } from '../../chunks/hot-reload_CovL2LCW.mjs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    let branch = url.searchParams.get("branch");
    if (!branch) {
      const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      branch = gitInfo.branch || "main";
    }
    const variables = database.getAllVariables(branch);
    return new Response(JSON.stringify({ variables, branch }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get variables error:", error);
    return new Response(JSON.stringify({ error: "Failed to get variables" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const variable = await request.json();
    if (!variable.branch) {
      const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      variable.branch = gitInfo.branch || "main";
    }
    const result = database.setVariable(variable.name, variable.value, variable);
    const hotReloadSettings = database.getHotReloadSettings();
    if (hotReloadSettings.enabled && hotReloadSettings.autoReload) {
      const manager = getHotReloadManager(hotReloadSettings);
      await manager.triggerReload({
        type: "variables_changed",
        timestamp: Date.now(),
        details: {
          variable: variable.name,
          branch: variable.branch
        }
      });
    }
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Set variable error:", error);
    return new Response(JSON.stringify({ error: "Failed to set variable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const PUT = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const variable = await request.json();
    const result = database.updateVariable(variable.name, variable.value, variable);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Update variable error:", error);
    return new Response(JSON.stringify({ error: "Failed to update variable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const DELETE = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { name } = await request.json();
    const result = database.deleteVariable(name);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Delete variable error:", error);
    return new Response(JSON.stringify({ error: "Failed to delete variable" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  POST,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
