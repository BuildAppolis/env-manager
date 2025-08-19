import fs from 'fs';
import path from 'path';
import os from 'os';
import { randomBytes, createHash, pbkdf2Sync } from 'crypto';
export { renderers } from '../../renderers.mjs';

const credentialsPath = path.join(os.homedir(), ".env-manager", "credentials.json");
const registryPath = path.join(os.homedir(), ".env-manager", "projects.json");
function loadCredentials() {
  try {
    if (fs.existsSync(credentialsPath)) {
      return JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
    }
  } catch (error) {
    console.error("Failed to load credentials:", error);
  }
  return null;
}
function saveCredentials(credentials) {
  try {
    const credDir = path.dirname(credentialsPath);
    if (!fs.existsSync(credDir)) {
      fs.mkdirSync(credDir, { recursive: true });
    }
    fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
    fs.chmodSync(credentialsPath, 384);
    return true;
  } catch (error) {
    console.error("Failed to save credentials:", error);
    return false;
  }
}
function hashPassword(password, salt) {
  return pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function generateRecoveryPhrase() {
  const words = [
    "alpha",
    "bravo",
    "charlie",
    "delta",
    "echo",
    "foxtrot",
    "golf",
    "hotel",
    "india",
    "juliet",
    "kilo",
    "lima",
    "mike",
    "november",
    "oscar",
    "papa",
    "quebec",
    "romeo",
    "sierra",
    "tango",
    "uniform",
    "victor",
    "whiskey",
    "zulu"
  ];
  const phrase = [];
  for (let i = 0; i < 4; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)]);
  }
  phrase.push(Math.floor(Math.random() * 9999).toString().padStart(4, "0"));
  return phrase.join("-");
}
const GET = async () => {
  try {
    const credentials = loadCredentials();
    const hasGlobalPassword = !!credentials;
    return new Response(JSON.stringify({
      hasGlobalPassword,
      createdAt: credentials?.createdAt,
      lastModified: credentials?.lastModified
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error checking password status:", error);
    return new Response(JSON.stringify({ error: "Failed to check password status" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, password, newPassword, recoveryPhrase, projectPath } = body;
    if (action === "setup") {
      const existingCreds = loadCredentials();
      if (existingCreds) {
        return new Response(JSON.stringify({
          error: "Password already configured",
          requiresAuth: true
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!password || password.length < 6) {
        return new Response(JSON.stringify({
          error: "Password must be at least 6 characters"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const salt = randomBytes(32).toString("hex");
      const passwordHash = hashPassword(password, salt);
      const encryptionKey = randomBytes(32).toString("hex");
      const newRecoveryPhrase = generateRecoveryPhrase();
      const recoveryHash = createHash("sha256").update(newRecoveryPhrase).digest("hex");
      const credentials = {
        passwordHash,
        salt,
        encryptionKey,
        recoveryHash,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastModified: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: "Failed to save credentials" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: "Password configured successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "verify") {
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({
          error: "No password configured",
          needsSetup: true
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const passwordHash = hashPassword(password, credentials.salt);
      const isValid = passwordHash === credentials.passwordHash;
      if (isValid && projectPath) {
        const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
        const project = registry.projects[projectPath];
        if (project?.projectPassword) {
          const projectPasswordHash = hashPassword(password, project.projectPassword.salt);
          const projectValid = projectPasswordHash === project.projectPassword.passwordHash;
          return new Response(JSON.stringify({
            valid: isValid,
            projectValid,
            requiresProjectPassword: true
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
      return new Response(JSON.stringify({ valid: isValid }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "change") {
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({ error: "No password configured" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const currentHash = hashPassword(password, credentials.salt);
      if (currentHash !== credentials.passwordHash) {
        return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({
          error: "New password must be at least 6 characters"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const salt = randomBytes(32).toString("hex");
      const passwordHash = hashPassword(newPassword, salt);
      const newRecoveryPhrase = generateRecoveryPhrase();
      const recoveryHash = createHash("sha256").update(newRecoveryPhrase).digest("hex");
      credentials.passwordHash = passwordHash;
      credentials.salt = salt;
      credentials.recoveryHash = recoveryHash;
      credentials.lastModified = (/* @__PURE__ */ new Date()).toISOString();
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: "Failed to save new password" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: "Password changed successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (action === "recover") {
      const credentials = loadCredentials();
      if (!credentials) {
        return new Response(JSON.stringify({ error: "No password configured" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const recoveryHash = createHash("sha256").update(recoveryPhrase).digest("hex");
      if (recoveryHash !== credentials.recoveryHash) {
        return new Response(JSON.stringify({ error: "Invalid recovery phrase" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (!newPassword || newPassword.length < 6) {
        return new Response(JSON.stringify({
          error: "New password must be at least 6 characters"
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const salt = randomBytes(32).toString("hex");
      const passwordHash = hashPassword(newPassword, salt);
      const newRecoveryPhrase = generateRecoveryPhrase();
      const newRecoveryHash = createHash("sha256").update(newRecoveryPhrase).digest("hex");
      credentials.passwordHash = passwordHash;
      credentials.salt = salt;
      credentials.recoveryHash = newRecoveryHash;
      credentials.lastModified = (/* @__PURE__ */ new Date()).toISOString();
      if (!saveCredentials(credentials)) {
        return new Response(JSON.stringify({ error: "Failed to save new password" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({
        success: true,
        recoveryPhrase: newRecoveryPhrase,
        message: "Password recovered successfully"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Password operation error:", error);
    return new Response(JSON.stringify({ error: "Password operation failed" }), {
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
