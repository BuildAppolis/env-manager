import { g as getDatabase } from '../../chunks/session_AwEyVFTC.mjs';
import { g as getGitUtils } from '../../chunks/git-utils_B6WJYd3b.mjs';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const GET = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
    const gitUtils = getGitUtils(projectRoot);
    const gitBranches = await gitUtils.getAllBranches();
    const dbBranches = database.getBranches();
    const gitInfo = await gitUtils.getGitInfo();
    const response = {
      current: gitInfo.branch || "main",
      gitBranches,
      dbBranches,
      gitInfo
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Get branches error:", error);
    return new Response(JSON.stringify({ error: "Failed to get branches" }), {
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
    const { action, branch } = await request.json();
    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
    const gitUtils = getGitUtils(projectRoot);
    switch (action) {
      case "switch":
        const success = await gitUtils.switchBranch(branch);
        if (success) {
          return new Response(JSON.stringify({
            success: true,
            message: `Switched to branch ${branch}`
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({
            error: `Failed to switch to branch ${branch}`
          }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }
      case "copy":
        const { sourceBranch, targetBranch } = await request.json();
        const sourceVars = database.getVariablesByBranch(sourceBranch);
        for (const variable of sourceVars) {
          database.setVariable(variable.name, variable.value, {
            ...variable,
            branch: targetBranch
          });
        }
        return new Response(JSON.stringify({
          success: true,
          message: `Copied ${sourceVars.length} variables from ${sourceBranch} to ${targetBranch}`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }
  } catch (error) {
    console.error("Branch operation error:", error);
    return new Response(JSON.stringify({ error: "Branch operation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
