import { g as getDatabase } from '../../chunks/session_CMQvN_Ad.mjs';
import { g as getGitUtils } from '../../chunks/git-utils_B6WJYd3b.mjs';
import { g as getHotReloadManager } from '../../chunks/hot-reload_DH00vsQQ.mjs';
import path from 'path';
import crypto from 'crypto';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const projectPath = url.searchParams.get("projectPath");
    const database = getDatabase(projectPath || void 0);
    let branch = url.searchParams.get("branch");
    if (!branch) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
      const gitUtils = getGitUtils(projectRoot);
      const gitInfo = await gitUtils.getGitInfo();
      branch = gitInfo.branch || "main";
    }
    let variables = [];
    try {
      variables = database.getAllVariables(branch);
    } catch (authError) {
      if (authError.message === "Not authenticated") {
        variables = [];
      } else {
        throw authError;
      }
    }
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
const POST = async ({ request, url }) => {
  try {
    const projectPath = url.searchParams.get("projectPath");
    const database = getDatabase(projectPath || void 0);
    const dbData = database.data;
    const hasPassword = !!(dbData?.auth?.passwordHash && dbData?.auth?.salt);
    if (hasPassword && !database.isAuthenticated()) {
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
    let result;
    try {
      result = database.setVariable(variable.name, variable.value, variable);
    } catch (setError) {
      console.error("Error setting variable:", setError);
      if (setError.message === "Not authenticated" && !hasPassword) {
        const dbData2 = database.data;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const newVariable = {
          name: variable.name,
          value: variable.value,
          category: variable.category || "other",
          description: variable.description || "",
          sensitive: variable.sensitive || false,
          encrypted: false,
          branch: variable.branch || "main",
          createdAt: now,
          updatedAt: now
        };
        dbData2.variables = dbData2.variables || [];
        const existingIndex = dbData2.variables.findIndex((v) => v.name === variable.name);
        if (existingIndex >= 0) {
          dbData2.variables[existingIndex] = { ...dbData2.variables[existingIndex], ...newVariable, updatedAt: now };
        } else {
          dbData2.variables.push(newVariable);
        }
        dbData2.history = dbData2.history || [];
        dbData2.history.push({
          id: crypto.randomUUID(),
          action: existingIndex >= 0 ? "update" : "create",
          variableName: variable.name,
          newValue: variable.value,
          timestamp: now
        });
        await database.saveData();
        result = newVariable;
      } else {
        throw setError;
      }
    }
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
const DELETE = async ({ request, url }) => {
  try {
    const projectPath = url.searchParams.get("projectPath");
    const database = getDatabase(projectPath || void 0);
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
