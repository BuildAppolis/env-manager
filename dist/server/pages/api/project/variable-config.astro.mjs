import { g as getDatabase } from '../../../chunks/session_DAr66qTp.mjs';
import path from 'path';
export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const { variableName } = await request.json();
    if (!variableName) {
      return new Response(JSON.stringify({ error: "Variable name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const projectRoot = path.resolve(process.cwd(), "..");
    const configPath = path.join(projectRoot, "env.config.ts");
    try {
      const configModule = await import(
        /* @vite-ignore */
        configPath
      );
      const projectConfig = configModule.default;
      let variableConfig = null;
      let groupName = null;
      for (const [groupKey, group] of Object.entries(projectConfig.requirements)) {
        const groupData = group;
        const variable = groupData.variables.find((v) => v.name === variableName);
        if (variable) {
          variableConfig = variable;
          groupName = groupKey;
          break;
        }
      }
      if (!variableConfig) {
        return new Response(JSON.stringify({
          error: "Variable not found in project configuration"
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      const config = {
        name: variableConfig.name,
        description: variableConfig.description,
        category: groupName,
        sensitive: variableConfig.sensitive || false,
        minLength: variableConfig.minLength,
        defaultValue: variableConfig.default,
        generate: variableConfig.generate,
        validation: variableConfig.validation ? variableConfig.validation.source : null
      };
      return new Response(JSON.stringify(config), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (configError) {
      console.error("Config loading error:", configError);
      return new Response(JSON.stringify({
        error: "Failed to load project configuration",
        message: `Error loading env.config.ts: ${configError instanceof Error ? configError.message : String(configError)}`
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("Get variable config error:", error);
    return new Response(JSON.stringify({ error: "Failed to get variable configuration" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
