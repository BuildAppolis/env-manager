import { g as getDatabase } from '../../chunks/session_Czm17L6L.mjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
export { renderers } from '../../renderers.mjs';

class SecretGenerator {
  /**
   * Generate a UUID v4
   */
  static generateUuid() {
    return crypto.randomUUID();
  }
  /**
   * Generate a cryptographically secure random hex string
   * @param length - Length of the hex string (default 32 bytes = 64 hex chars)
   */
  static generateCryptoSecret(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }
  /**
   * Generate a strong password with mixed characters
   * @param length - Length of the password (default 24)
   * @param options - Options for password generation
   */
  static generatePassword(length = 24, options = {}) {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true,
      excludeAmbiguous = true
    } = options;
    let charset = "";
    if (uppercase) {
      charset += excludeAmbiguous ? "ABCDEFGHJKLMNPQRSTUVWXYZ" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (lowercase) {
      charset += excludeAmbiguous ? "abcdefghjkmnpqrstuvwxyz" : "abcdefghijklmnopqrstuvwxyz";
    }
    if (numbers) {
      charset += excludeAmbiguous ? "23456789" : "0123456789";
    }
    if (symbols) {
      charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    }
    if (!charset) {
      throw new Error("At least one character type must be enabled");
    }
    let password = "";
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }
    return password;
  }
  /**
   * Generate a JWT secret (base64 encoded)
   * @param length - Length of the secret in bytes (default 32)
   */
  static generateJwtSecret(length = 32) {
    return crypto.randomBytes(length).toString("base64");
  }
  /**
   * Generate an API key with a specific format
   * @param prefix - Optional prefix for the key (e.g., 'sk_live_')
   */
  static generateApiKey(prefix = "") {
    const key = crypto.randomBytes(24).toString("base64url");
    return prefix ? `${prefix}${key}` : key;
  }
  /**
   * Generate a database connection string template
   * @param type - Database type
   */
  static generateDatabaseUrl(type = "postgres") {
    const password = this.generatePassword(16, { symbols: false });
    const username = "user_" + crypto.randomBytes(4).toString("hex");
    switch (type) {
      case "postgres":
        return `postgresql://${username}:${password}@localhost:5432/dbname`;
      case "mysql":
        return `mysql://${username}:${password}@localhost:3306/dbname`;
      case "mongodb":
        return `mongodb://${username}:${password}@localhost:27017/dbname`;
      default:
        return "";
    }
  }
  /**
   * Generate value based on variable name patterns
   * @param variableName - Name of the environment variable
   * @param generate - Generation type specified in config
   */
  static generateByPattern(variableName, generate) {
    if (generate) {
      switch (generate) {
        case "uuid":
          return this.generateUuid();
        case "crypto":
          return this.generateCryptoSecret();
        case "password":
          return this.generatePassword();
      }
    }
    const name = variableName.toUpperCase();
    if (name.includes("UUID") || name.includes("_ID") && !name.includes("CLIENT")) {
      return this.generateUuid();
    }
    if (name.includes("JWT") || name.includes("AUTH_SECRET")) {
      return this.generateJwtSecret();
    }
    if (name.includes("API_KEY") || name.includes("API_TOKEN")) {
      const prefix = name.includes("STRIPE") ? "sk_test_" : name.includes("SENDGRID") ? "SG." : "";
      return this.generateApiKey(prefix);
    }
    if (name.includes("DATABASE_URL") || name.includes("DB_URL")) {
      if (name.includes("POSTGRES")) return this.generateDatabaseUrl("postgres");
      if (name.includes("MYSQL")) return this.generateDatabaseUrl("mysql");
      if (name.includes("MONGO")) return this.generateDatabaseUrl("mongodb");
      return this.generateDatabaseUrl();
    }
    if (name.includes("PASSWORD") || name.includes("PASS")) {
      return this.generatePassword();
    }
    if (name.includes("SECRET") || name.includes("TOKEN") || name.includes("KEY")) {
      return this.generateCryptoSecret();
    }
    if (name.includes("PORT")) {
      return String(3e3 + Math.floor(Math.random() * 7e3));
    }
    return this.generateCryptoSecret();
  }
  /**
   * Generate multiple secrets at once
   * @param variables - Array of variable names or configs
   */
  static generateBatch(variables) {
    const results = {};
    for (const variable of variables) {
      if (typeof variable === "string") {
        results[variable] = this.generateByPattern(variable);
      } else {
        results[variable.name] = this.generateByPattern(variable.name, variable.generate);
      }
    }
    return results;
  }
}

const POST = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const {
      variableName,
      generationType,
      projectPath
    } = await request.json();
    if (!variableName) {
      return new Response(JSON.stringify({ error: "Variable name required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let generateType = void 0;
    let generatedValue = "";
    if (projectPath) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
      const configPath = path.join(projectRoot, "env.config.ts");
      try {
        await fs.access(configPath);
        const configModule = await import(
          /* @vite-ignore */
          configPath
        );
        const projectConfig = configModule.default;
        for (const [, group] of Object.entries(projectConfig.requirements)) {
          const groupData = group;
          const varConfig = groupData.variables?.find((v) => v.name === variableName);
          if (varConfig?.generate) {
            generateType = varConfig.generate;
            break;
          }
        }
      } catch {
      }
    }
    const finalGenerationType = generationType || generateType;
    if (finalGenerationType) {
      switch (finalGenerationType) {
        case "uuid":
          generatedValue = SecretGenerator.generateUuid();
          break;
        case "crypto":
          generatedValue = SecretGenerator.generateCryptoSecret();
          break;
        case "password":
          generatedValue = SecretGenerator.generatePassword();
          break;
        default:
          generatedValue = SecretGenerator.generateByPattern(variableName);
      }
    } else {
      generatedValue = SecretGenerator.generateByPattern(variableName);
    }
    return new Response(JSON.stringify({
      success: true,
      value: generatedValue,
      type: finalGenerationType || "auto"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Generate secret error:", error);
    return new Response(JSON.stringify({
      error: "Failed to generate secret",
      message: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async ({ request }) => {
  try {
    const database = getDatabase();
    if (!database.isAuthenticated()) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const url = new URL(request.url);
    const variableNames = url.searchParams.get("variables")?.split(",") || [];
    const projectPath = url.searchParams.get("projectPath");
    if (variableNames.length === 0) {
      return new Response(JSON.stringify({ error: "No variables specified" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const configMap = /* @__PURE__ */ new Map();
    if (projectPath) {
      const projectRoot = projectPath || process.env.PROJECT_ROOT || path.resolve(process.cwd(), "..");
      const configPath = path.join(projectRoot, "env.config.ts");
      try {
        await fs.access(configPath);
        const configModule = await import(
          /* @vite-ignore */
          configPath
        );
        const projectConfig = configModule.default;
        for (const [, group] of Object.entries(projectConfig.requirements)) {
          const groupData = group;
          for (const varConfig of groupData.variables || []) {
            if (varConfig.generate) {
              configMap.set(varConfig.name, varConfig.generate);
            }
          }
        }
      } catch {
      }
    }
    const results = {};
    for (const name of variableNames) {
      const generateType = configMap.get(name);
      results[name] = SecretGenerator.generateByPattern(name, generateType);
    }
    return new Response(JSON.stringify({
      success: true,
      values: results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Generate secrets error:", error);
    return new Response(JSON.stringify({
      error: "Failed to generate secrets",
      message: error instanceof Error ? error.message : String(error)
    }), {
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
