import { g as getDatabase, E as EnvDatabase } from '../../chunks/session_AwEyVFTC.mjs';
import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../renderers.mjs';

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const db = getDatabase();
    if (!db.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { type, password } = req.body;
    if (!type || !["env", "env-example"].includes(type)) {
      return res.status(400).json({ error: 'Invalid export type. Must be "env" or "env-example"' });
    }
    if (type === "env") {
      if (!password) {
        return res.status(400).json({ error: "Password confirmation required for .env export" });
      }
      const testDb = new EnvDatabase();
      const isPasswordValid = testDb.authenticate(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }
    const variables = db.getAllVariables();
    let content = "";
    let filename = "";
    if (type === "env-example") {
      content = generateEnvExample(variables);
      filename = ".env.example";
    } else {
      content = generateEnv(variables);
      filename = ".env";
    }
    const warningNotice = type === "env" ? `# WARNING: To use this .env file, you must disable env-manager in your config
# Otherwise, env-manager will override these values
# Set ENV_MANAGER_ENABLED=false in your config to disable

` : `# Environment Variables Example
# Copy this file to .env and fill in the actual values
# Remember to disable env-manager in config if using .env files directly

`;
    content = warningNotice + content;
    const projectRoot = process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
    const filePath = path.join(projectRoot, filename);
    await fs.writeFile(filePath, content, "utf-8");
    res.status(200).json({
      success: true,
      message: `${filename} has been created in your project root`,
      path: filePath
    });
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export file" });
  }
}
function generateEnvExample(variables) {
  const categories = groupVariablesByCategory(variables);
  let content = "";
  for (const [category, vars] of Object.entries(categories)) {
    content += `# ${category}
`;
    for (const variable of vars) {
      if (variable.description) {
        content += `# ${variable.description}
`;
      }
      const exampleValue = generateExampleValue(variable);
      content += `${variable.name}=${exampleValue}
`;
    }
    content += "\n";
  }
  return content;
}
function generateEnv(variables) {
  const categories = groupVariablesByCategory(variables);
  let content = "";
  for (const [category, vars] of Object.entries(categories)) {
    content += `# ${category}
`;
    for (const variable of vars) {
      if (variable.description) {
        content += `# ${variable.description}
`;
      }
      content += `${variable.name}=${variable.value}
`;
    }
    content += "\n";
  }
  return content;
}
function groupVariablesByCategory(variables) {
  const categories = {};
  for (const variable of variables) {
    const category = variable.category || "General";
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(variable);
  }
  return categories;
}
function generateExampleValue(variable) {
  if (variable.sensitive) {
    if (variable.name.includes("SECRET") || variable.name.includes("KEY")) {
      return "your_secret_key_here";
    }
    if (variable.name.includes("PASSWORD")) {
      return "your_password_here";
    }
    if (variable.name.includes("TOKEN")) {
      return "your_token_here";
    }
    return "your_sensitive_value_here";
  }
  if (variable.type === "url") {
    if (variable.name.includes("DATABASE")) {
      return "postgresql://user:password@localhost:5432/database";
    }
    return "https://example.com";
  }
  if (variable.type === "boolean") {
    return "true";
  }
  if (variable.type === "number") {
    return "3000";
  }
  if (variable.name.includes("PORT")) {
    return "3000";
  }
  if (variable.name.includes("EMAIL")) {
    return "user@example.com";
  }
  return "example_value";
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: handler
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
